// controllers/publicTicket.controller.js
import { query } from '../../config/db.js';

// Existing list controller
export const getPublicTickets = async (req, res) => {
  try {
    const eventId = parseInt(req.params.id);

    // Verify event is published
    const eventRes = await query(
      `SELECT id, title, status
       FROM events
       WHERE id = $1 AND status = 'published'`,
      [eventId]
    );

    if (eventRes.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found or not published' });
    }

    // Fetch tickets for this event
    const ticketRes = await query(
      `SELECT id, name, price_cents, currency,
              quantity_total, quantity_sold, per_user_limit
       FROM tickets
       WHERE event_id = $1
       ORDER BY price_cents ASC`,
      [eventId]
    );

    res.json({
      event: eventRes.rows[0],
      tickets: ticketRes.rows
    });
  } catch (error) {
    console.error('Public tickets error:', error);
    res.status(500).json({ error: 'Could not load tickets' });
  }
};

// controllers/publicTicket.controller.js
export const getPublicTicketDetail = async (req, res) => {
  try {
    const eventId = parseInt(req.params.eventId);

    // Fetch all tickets for this event
    const ticketRes = await query(
      `SELECT id, name, price_cents, currency,
              quantity_total, quantity_sold, per_user_limit
       FROM tickets
       WHERE event_id = $1
       ORDER BY price_cents ASC`,
      [eventId]
    );

    if (ticketRes.rows.length === 0) {
      return res.status(404).json({ error: 'No tickets found for this event' });
    }

    // Compute availability for each ticket
    const tickets = ticketRes.rows.map(t => ({
      ...t,
      quantity_available: t.quantity_total,
      available: t.quantity_total - t.quantity_sold
    }));

    res.json(tickets);
  } catch (error) {
    console.error('Public tickets detail error:', error);
    res.status(500).json({ error: 'Could not load tickets' });
  }
};

