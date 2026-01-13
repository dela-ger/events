import axios from 'axios';
import { query } from '../../config/db.js';
import crypto from 'crypto';

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;

// Step 1: Initialize payment
export const initializePayment = async (req, res) => {
  try {
    const { eventId, ticketId } = req.params;
    const { email, quantity } = req.body;

    if (!email || !quantity) {
      return res.status(400).json({ error: 'Email and quantity are required' });
    }
    if (quantity <= 0 || !Number.isInteger(quantity)) {
      return res.status(400).json({ error: 'Quantity must be a positive integer' });
    }

    // Fetch ticket
    const ticketRes = await query(
      `SELECT id, event_id, name, price_cents, currency, quantity_total, quantity_sold
       FROM tickets WHERE id = $1 AND event_id = $2`,
      [ticketId, eventId]
    );
    if (ticketRes.rows.length === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    const ticket = ticketRes.rows[0];

    // Check availability
    const available = ticket.quantity_total - ticket.quantity_sold;
    if (quantity > available) {
      return res.status(400).json({ error: 'Requested quantity exceeds available tickets' });
    }

    // Compute amount (minor units)
    const amount = ticket.price_cents * quantity;
    const currency = ticket.currency || 'NGN';

    // Unique reference
    const paymentReference = `ref_${ticketId}_${Date.now()}_${crypto.randomBytes(6).toString('hex')}`;

    // Persist sale (pending)
    await query(
      `INSERT INTO sales (ticket_id, quantity, payment_reference, buyer_email, status)
       VALUES ($1, $2, $3, $4, $5)`,
      [ticketId, quantity, paymentReference, email, 'PENDING']
    );

    // Initialize Paystack
    const callback_url = process.env.PAYSTACK_CALLBACK_URL; // optional
    const psInitBody = {
      email,
      amount,
      reference: paymentReference,
      metadata: { eventId, ticketId, quantity, currency },
      ...(callback_url ? { callback_url } : {})
    };

    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      psInitBody,
      { headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` } }
    );

    const { authorization_url } = response.data.data;

    // Return fields expected by frontend
    return res.json({ authorization_url, reference: paymentReference });
  } catch (err) {
    console.error('Payment init error:', err.response?.data || err.message);
    return res.status(500).json({ error: 'Could not initialize payment' });
  }
};


// Step 2: Verify payment (Webhook)
export const verifyPayment = async (req, res) => {
  try {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    const hash = crypto
      .createHmac('sha512', secret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (hash !== req.headers['x-paystack-signature']) {
      return res.sendStatus(401); // invalid signature
    }

    const payload = req.body;

    if (payload.event === 'charge.success') {
      const { eventId, ticketId, quantity } = payload.data.metadata;
      const reference = payload.data.reference;
      const buyerEmail = payload.data.customer.email;

      // Update tickets sold
      await query(
        `UPDATE tickets
         SET quantity_sold = quantity_sold + $1
         WHERE id = $2 AND event_id = $3`,
        [quantity, ticketId, eventId]
      );

      // Update sales status
      await query(
        `UPDATE sales
         SET status = $1, updated_at = NOW()
         WHERE payment_reference = $2`,
        ['PAID', reference]
      );
    }

    res.sendStatus(200);
  } catch (err) {
    console.error('Webhook error:', err);
    res.sendStatus(500);
  }
};




// Verify payment by reference (customer-facing)
export const verifyPaymentReference = async (req, res) => {
  try {
    const { reference } = req.query;
    if (!reference) {
      return res.status(400).json({ error: 'Missing payment reference' });
    }

    // Call Paystack verify API
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      { headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` } }
    );

    const data = response.data.data;

    if (data.status !== 'success') {
      return res.status(400).json({ status: 'failed', message: 'Payment not successful' });
    }

    // Extract metadata
    const { eventId, ticketId, quantity } = data.metadata;

    // Update ticket sales
    await query(
      `UPDATE tickets
       SET quantity_sold = quantity_sold + $1
       WHERE id = $2 AND event_id = $3`,
      [quantity, ticketId, eventId]
    );

    return res.json({ status: 'success', message: 'Payment verified', reference });
  } catch (err) {
    console.error('Public verify error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Could not verify payment' });
  }
};
