import { query } from '../../config/db.js';

export const createTicket = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const {
      event_id,
      name,
      price_cents,
      currency,
      quantity_total,
      per_user_limit
    } = req.body;

    // Verify event belongs to the company
    const eventCheck = await query(
      'SELECT id FROM events WHERE id = $1 AND company_id = $2',
      [event_id, companyId]
    );

    if (eventCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Unauthorized or invalid event' });
    }

    const result = await query(
      `INSERT INTO tickets (
        event_id, name, price_cents, currency, quantity_total, per_user_limit
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [event_id, name, price_cents, currency, quantity_total, per_user_limit]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Failed to create ticket:', error);
    res.status(500).json({ error: 'Failed to create ticket' });
  }
};

// get tickets for a specific event
export const getTicketsByEvent = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const eventId = parseInt(req.query.eventId);

    if (!eventId) {
      return res.status(400).json({ error: 'Missing or invalid eventId' });
    }

    // Verify event ownership
    const eventCheck = await query(
      'SELECT id FROM events WHERE id = $1 AND company_id = $2',
      [eventId, companyId]
    );

    if (eventCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Unauthorized or invalid event' });
    }

    const result = await query(
      `SELECT id, name, price_cents, currency, quantity_total, quantity_sold, per_user_limit, created_at
       FROM tickets
       WHERE event_id = $1
       ORDER BY created_at ASC`,
      [eventId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Failed to fetch tickets:', error);
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
};

// update ticket details
export const updateTicket = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const ticketId = parseInt(req.params.id);
    const {
      name,
      price_cents,
      currency,
      quantity_total,
      per_user_limit
    } = req.body;

    // Verify ticket belongs to a company-owned event
    const ownershipCheck = await query(
      `SELECT t.id
       FROM tickets t
       JOIN events e ON t.event_id = e.id
       WHERE t.id = $1 AND e.company_id = $2`,
      [ticketId, companyId]
    );

    if (ownershipCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Unauthorized or invalid ticket' });
    }

    const result = await query(
      `UPDATE tickets SET
        name = COALESCE($1, name),
        price_cents = COALESCE($2, price_cents),
        currency = COALESCE($3, currency),
        quantity_total = COALESCE($4, quantity_total),
        per_user_limit = COALESCE($5, per_user_limit)
       WHERE id = $6
       RETURNING *`,
      [name, price_cents, currency, quantity_total, per_user_limit, ticketId]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Failed to update ticket:', error);
    res.status(500).json({ error: 'Failed to update ticket' });
  }
};

// delete a ticket
export const deleteTicket = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const ticketId = parseInt(req.params.id);

    // Verify ticket belongs to a company-owned event
    const ownershipCheck = await query(
      `SELECT t.id
       FROM tickets t
       JOIN events e ON t.event_id = e.id
       WHERE t.id = $1 AND e.company_id = $2`,
      [ticketId, companyId]
    );

    if (ownershipCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Unauthorized or invalid ticket' });
    }

    // Optional: prevent deletion if tickets have been sold
    const soldCheck = await query(
      'SELECT quantity_sold FROM tickets WHERE id = $1',
      [ticketId]
    );

    if (soldCheck.rows[0].quantity_sold > 0) {
      return res.status(400).json({ error: 'Cannot delete ticket with sales' });
    }

    await query('DELETE FROM tickets WHERE id = $1', [ticketId]);

    res.json({ message: 'Ticket deleted successfully' });
  } catch (error) {
    console.error('Failed to delete ticket:', error);
    res.status(500).json({ error: 'Failed to delete ticket' });
  }
};

// get a single ticket by ID
export const getTicket = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const ticketId = parseInt(req.params.id);

    const result = await query(
      `SELECT t.id, t.name, t.price_cents, t.currency, t.quantity_total, t.quantity_sold, t.per_user_limit,
              e.id AS event_id, e.title AS event_title, e.start_time AS event_date, e.venue AS event_location
       FROM tickets t
       JOIN events e ON t.event_id = e.id
       WHERE t.id = $1 AND e.company_id = $2`,
      [ticketId, companyId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ticket not found or unauthorized' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Failed to fetch ticket:', error);
    res.status(500).json({ error: 'Failed to fetch ticket' });
  }
};