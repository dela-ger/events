import axios from 'axios';
import { query } from '../../config/db.js';

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;

// Step 1: Initialize payment
export const initializePayment = async (req, res) => {
  try {
    const { eventId, ticketId } = req.params;
    const { email, quantity } = req.body;

    // Fetch ticket info
    const ticketRes = await query(
      `SELECT * FROM tickets WHERE id = $1 AND event_id = $2`,
      [ticketId, eventId]
    );
    if (ticketRes.rows.length === 0) {
      return res.status(404).json({ error: "Ticket not found" });
    }
    const ticket = ticketRes.rows[0];

    // Calculate amount (Paystack expects minor units)
    const amount = ticket.price_cents * quantity;

    // Generate unique reference
    const paymentReference = `ref_${ticketId}_${Date.now()}_${crypto
      .randomBytes(6)
      .toString("hex")}`;

    // Insert sale record (linking to ticket)
    await query(
      `INSERT INTO sales (ticket_id, quantity, payment_reference, status)
       VALUES ($1, $2, $3, $4)`,
      [ticketId, quantity, paymentReference, "PENDING"]
    );

    // Call Paystack API
    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email,
        amount,
        reference: paymentReference,
        metadata: { eventId, ticketId, quantity },
      },
      { headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` } }
    );

    const { authorization_url } = response.data.data;

    // Return checkout URL + reference
    res.json({ checkoutUrl: authorization_url, reference: paymentReference });
  } catch (err) {
    console.error("Payment init error:", err.response?.data || err.message);
    res.status(500).json({ error: "Could not initialize payment" });
  }
};



// Step 2: Verify payment (Webhook)
export const verifyPayment = async (req, res) => {
  try {
    const payload = req.body;

    // Paystack sends event type
    if (payload.event === 'charge.success') {
      const { eventId, ticketId, quantity } = payload.data.metadata;

      // Update ticket sales
      await query(
        `UPDATE tickets
         SET quantity_sold = quantity_sold + $1
         WHERE id = $2 AND event_id = $3`,
        [quantity, ticketId, eventId]
      );
    }

    res.sendStatus(200); // acknowledge webhook
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
