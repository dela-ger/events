import { query } from '../../config/db.js';

export const purchaseTicket = async (req, res) => {
  try {
    const userId = req.user.id;
    const { ticket_id, quantity } = req.body;

    if (!ticket_id || !quantity || quantity <= 0) {
      return res.status(400).json({ error: 'Invalid ticket_id or quantity' });
    }

    // Get ticket details
    const ticketRes = await query(
      `SELECT t.id, t.quantity_total, t.quantity_sold, t.per_user_limit
       FROM tickets t
       WHERE t.id = $1`,
      [ticket_id]
    );

    const ticket = ticketRes.rows[0];
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Check availability
    const remaining = ticket.quantity_total - ticket.quantity_sold;
    if (quantity > remaining) {
      return res.status(400).json({ error: 'Not enough tickets available' });
    }

    // Check per-user limit
    const userSalesRes = await query(
      `SELECT COALESCE(SUM(quantity), 0) AS total
       FROM sales
       WHERE user_id = $1 AND ticket_id = $2`,
      [userId, ticket_id]
    );

    const userTotal = userSalesRes.rows[0].total;
    if (userTotal + quantity > ticket.per_user_limit) {
      return res.status(400).json({ error: 'Exceeds per-user ticket limit' });
    }

    // Record sale
    await query(
      `INSERT INTO sales (user_id, ticket_id, quantity)
       VALUES ($1, $2, $3)`,
      [userId, ticket_id, quantity]
    );

    // Update quantity_sold
    await query(
      `UPDATE tickets
       SET quantity_sold = quantity_sold + $1
       WHERE id = $2`,
      [quantity, ticket_id]
    );

    res.status(201).json({ message: 'Ticket purchased successfully' });
  } catch (error) {
    console.error('Failed to purchase ticket:', error);
    res.status(500).json({ error: 'Failed to purchase ticket' });
  }
};