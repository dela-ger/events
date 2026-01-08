// controllers/payments.controller.js
import crypto from 'crypto';
import { paystack } from '../../lib/paystackClient.js';
import { pool } from '../../config/db.js';

export const initializePurchase = async (req, res) => {
  const client = await pool.connect();
  try {
    const userId = req.user.id;
    const { ticketId, quantity, email } = req.body;

    if (!ticketId || !quantity || quantity < 1 || !email) {
      return res.status(400).json({ error: 'Invalid input' });
    }

    await client.query('BEGIN');

    // Lock ticket row for safe concurrent updates
    const ticketRes = await client.query(
      `SELECT id, price_cents, currency, quantity_total, quantity_sold, per_user_limit
       FROM tickets WHERE id = $1 FOR UPDATE`,
      [ticketId]
    );
    const ticket = ticketRes.rows[0];
    if (!ticket) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const remaining = ticket.quantity_total - ticket.quantity_sold;
    if (quantity > remaining) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Not enough tickets available' });
    }

    // TEMP: disable per-user limit check for testing

    // Check per-user limit
    // const userSalesRes = await client.query(
    //   `SELECT COALESCE(SUM(quantity), 0) AS user_total
    //    FROM sales WHERE user_id = $1 AND ticket_id = $2 AND status IN ('PENDING','PAID')`,
    //   [userId, ticketId]
    // );
    // const userTotal = parseInt(userSalesRes.rows[0].user_total, 10);
    // if (ticket.per_user_limit && userTotal + quantity > ticket.per_user_limit) {
    //   await client.query('ROLLBACK');
    //   return res.status(400).json({ error: 'Purchase exceeds per-user limit' });
    // }


    const totalPriceCents = ticket.price_cents * quantity;

    // Unique reference for idempotency
    const paymentReference = `ref_${ticketId}_${userId}_${Date.now()}_${crypto.randomBytes(6).toString('hex')}`;

    // Record payment
    await client.query(
      `INSERT INTO payments (user_id, payment_reference, gateway, currency, amount_cents, status)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, paymentReference, 'paystack', ticket.currency || 'GHS', totalPriceCents, 'INITIALIZED']
    );

    // Record sale
    await client.query(
      `INSERT INTO sales (user_id, ticket_id, quantity, payment_reference, status)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, ticketId, quantity, paymentReference, 'PENDING']
    );

    await client.query('COMMIT');

    // Call Paystack
    const initRes = await paystack.post('/transaction/initialize', {
      email,
      amount: totalPriceCents, // Paystack expects minor units
      currency: ticket.currency || 'GHS',
      reference: paymentReference,
      callback_url: `${process.env.APP_BASE_URL}/payments/callback?reference=${paymentReference}`,
      metadata: { userId, ticketId, quantity },
    });

    const { authorization_url } = initRes.data.data;
    return res.status(200).json({ authorization_url, reference: paymentReference });
  } catch (error) {
    try { await client.query('ROLLBACK'); } catch {}
    console.error('initializePurchase error:', error.response?.data || error.message);
    return res.status(500).json({ error: 'Payment initialization failed' });
  } finally {
    client.release();
  }
};

// verify payment callback

export const verifyPayment = async (req, res) => {
  const { reference } = req.query;
  if (!reference) return res.status(400).json({ error: 'Missing reference' });

  try {
    // Verify with Paystack
    const response = await paystack.get(`/transaction/verify/${reference}`);
    console.log('Paystack verify response:', response.data);
    const data = response.data.data;

    if (data.status !== 'success') {
      await pool.query(
        `UPDATE payments SET status = $1, updated_at = NOW() WHERE payment_reference = $2`,
        ['FAILED', reference]
      );
      await pool.query(
        `UPDATE sales SET status = $1 WHERE payment_reference = $2 AND status = 'PENDING'`,
        ['CANCELLED', reference]
      );
      return res.status(400).json({ error: 'Payment not successful' });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Mark payment success
      await client.query(
        `UPDATE payments SET status = $1, raw_payload = $2::jsonb, updated_at = NOW()
         WHERE payment_reference = $3`,
        ['SUCCESS', JSON.stringify(data), reference]
      );

      // Fetch sale and ticket
      const saleRes = await client.query(
        `SELECT id, ticket_id, quantity, status
         FROM sales WHERE payment_reference = $1 FOR UPDATE`,
        [reference]
      );
      const sale = saleRes.rows[0];
      if (!sale) throw new Error('Sale not found');
      if (sale.status === 'PAID') {
        await client.query('COMMIT');
        return res.json({ message: 'Already processed' });
      }

      const ticketRes = await client.query(
        `SELECT id, quantity_sold FROM tickets WHERE id = $1 FOR UPDATE`,
        [sale.ticket_id]
      );
      const ticket = ticketRes.rows[0];
      if (!ticket) throw new Error('Ticket not found');

      // Update ticket count and mark sale as paid
      await client.query(
        `UPDATE tickets SET quantity_sold = quantity_sold + $1 WHERE id = $2`,
        [sale.quantity, sale.ticket_id]
      );
      await client.query(
        `UPDATE sales SET status = $1 WHERE id = $2`,
        ['PAID', sale.id]
      );

      await client.query('COMMIT');
      return res.json({ message: 'Payment verified and ticket issued', reference });
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('verifyPayment error:', err.message);
      return res.status(500).json({ error: 'Fulfillment failed' });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('verifyPayment error:', error.response?.data || error.message);
    return res.status(500).json({ error: 'Verification failed' });
  }

  console.log('Paystack verify response:', response.data);
};

// webhook controller

export const paystackWebhook = async (req, res) => {
  try {
    // Validate signature
    const signature = req.headers['x-paystack-signature'];
    const computed = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (signature !== computed) {
      return res.status(403).json({ error: 'Invalid signature' });
    }

    const event = req.body.event;
    const data = req.body.data;
    const reference = data.reference;

    if (event === 'charge.success') {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        // Lock payment row
        const payRes = await client.query(
          `SELECT status FROM payments WHERE payment_reference = $1 FOR UPDATE`,
          [reference]
        );

        if (payRes.rows.length === 0) {
          // Create payment record if missing
          await client.query(
            `INSERT INTO payments (user_id, payment_reference, gateway, currency, amount_cents, status, raw_payload)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [data.metadata?.userId || null, reference, 'paystack', data.currency, data.amount, 'SUCCESS', JSON.stringify(data)]
          );
        } else if (payRes.rows[0].status === 'SUCCESS') {
          await client.query('COMMIT');
          return res.status(200).json({ message: 'Already processed' });
        } else {
          await client.query(
            `UPDATE payments SET status = $1, raw_payload = $2::jsonb, updated_at = NOW()
             WHERE payment_reference = $3`,
            ['SUCCESS', JSON.stringify(data), reference]
          );
        }

        // Lock sale row
        const saleRes = await client.query(
          `SELECT id, ticket_id, quantity, status FROM sales WHERE payment_reference = $1 FOR UPDATE`,
          [reference]
        );
        const sale = saleRes.rows[0];
        if (!sale) throw new Error('Sale not found');

        if (sale.status !== 'PAID') {
          await client.query(
            `UPDATE tickets SET quantity_sold = quantity_sold + $1 WHERE id = $2`,
            [sale.quantity, sale.ticket_id]
          );
          await client.query(
            `UPDATE sales SET status = $1 WHERE id = $2`,
            ['PAID', sale.id]
          );
        }

        await client.query('COMMIT');
        return res.status(200).json({ status: 'ok' });
      } catch (err) {
        await client.query('ROLLBACK');
        console.error('Webhook fulfillment error:', err.message);
        return res.status(500).json({ error: 'Webhook fulfillment failed' });
      } finally {
        client.release();
      }
    }

    return res.status(200).json({ status: 'ignored' });
  } catch (error) {
    console.error('Webhook error:', error.message);
    return res.status(500).json({ error: 'Webhook error' });
  }
};