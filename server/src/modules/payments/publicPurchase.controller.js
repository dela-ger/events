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
      return res.status(404).json({ error: 'Ticket not found' });
    }
    const ticket = ticketRes.rows[0];

    // Calculate amount
    const amount = ticket.price_cents * quantity;

    // Call Paystack API
    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email,
        amount, // amount in kobo/pesewas (Paystack expects smallest currency unit)
        metadata: { eventId, ticketId, quantity }
      },
      { headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` } }
    );

    res.json({ checkoutUrl: response.data.data.authorization_url });
  } catch (err) {
    console.error('Payment init error:', err);
    res.status(500).json({ error: 'Could not initialize payment' });
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
