import { sendTicketConfirmationEmail, triggerWebhook } from '../../utils/notifications.js';
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

    // notifications and webhooks
    await sendTicketConfirmationEmail(req.user, ticket, quantity);

    await triggerWebhook('ticket.purchase', {
      user_id: userId,
      ticket_id,
      quantity
    });


    res.status(201).json({ message: 'Ticket purchased successfully' });
  } catch (error) {
    console.error('Failed to purchase ticket:', error);
    res.status(500).json({ error: 'Failed to purchase ticket' });
  }
};

// get sales for the authenticated user's company
export const listSales = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const { event_id, ticket_id } = req.query;

    const filters = [];
    const values = [companyId];
    let i = 2;

    if (event_id) {
      filters.push(`t.event_id = $${i++}`);
      values.push(event_id);
    }

    if (ticket_id) {
      filters.push(`s.ticket_id = $${i++}`);
      values.push(ticket_id);
    }

    const whereClause = filters.length > 0 ? `AND ${filters.join(' AND ')}` : '';

    const result = await query(
      `SELECT s.id, s.user_id, s.ticket_id, s.quantity, s.created_at,
              t.name AS ticket_name, e.title AS event_title
       FROM sales s
       JOIN tickets t ON s.ticket_id = t.id
       JOIN events e ON t.event_id = e.id
       WHERE e.company_id = $1
       ${whereClause}
       ORDER BY s.created_at DESC`,
      values
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Failed to list sales:', error);
    res.status(500).json({ error: 'Failed to list sales' });
  }
};

// get user sales
export const getMySales = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await query(
      `SELECT s.id, s.quantity, s.created_at,
              t.name AS ticket_name, t.price_cents, t.currency,
              e.title AS event_title, e.start_time AS event_date, e.venue AS event_location
       FROM sales s
       JOIN tickets t ON s.ticket_id = t.id
       JOIN events e ON t.event_id = e.id
       WHERE s.user_id = $1
       ORDER BY s.created_at DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Failed to fetch user sales:', error);
    res.status(500).json({ error: 'Failed to fetch user sales' });
  }
};

// get event sales
export const getSalesByEvent = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const eventId = parseInt(req.params.id);

    const result = await query(
      `SELECT s.id, s.user_id, s.quantity, s.created_at,
              u.name AS user_name, u.email,
              t.name AS ticket_name,
              e.title AS event_title, e.start_time AS event_date
       FROM sales s
       JOIN users u ON s.user_id = u.id
       JOIN tickets t ON s.ticket_id = t.id
       JOIN events e ON t.event_id = e.id
       WHERE e.id = $1 AND e.company_id = $2
       ORDER BY s.created_at DESC`,
      [eventId, companyId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Failed to fetch sales by event:', error);
    res.status(500).json({ error: 'Failed to fetch sales by event' });
  }
};

// get dashboard sales summary
export const getDashboardSummary = async (req, res) => {
  try {
    const companyId = req.user.companyId;

    const result = await query(
      `SELECT e.id AS event_id, e.title AS event_title,
              COUNT(s.id) AS total_sales,
              COALESCE(SUM(s.quantity), 0) AS tickets_sold,
              COALESCE(SUM(s.quantity * t.price_cents), 0) AS revenue_cents
       FROM events e
       LEFT JOIN tickets t ON e.id = t.event_id
       LEFT JOIN sales s ON t.id = s.ticket_id
       WHERE e.company_id = $1
       GROUP BY e.id, e.title
       ORDER BY e.title ASC`,
      [companyId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Failed to fetch dashboard summary:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard summary' });
  }
};

// add access control as needed
export const getSalesByUser = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const userId = parseInt(req.params.id);

    const result = await query(
      `SELECT s.id, s.quantity, s.created_at,
              t.name AS ticket_name, t.price_cents, t.currency,
              e.title AS event_title, e.start_time AS event_date, e.venue AS event_location
       FROM sales s
       JOIN tickets t ON s.ticket_id = t.id
       JOIN events e ON t.event_id = e.id
       WHERE s.user_id = $1 AND e.company_id = $2
       ORDER BY s.created_at DESC`,
      [userId, companyId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Failed to fetch sales by user:', error);
    res.status(500).json({ error: 'Failed to fetch sales by user' });
  }
};

// get user purchase summary
export const getUserPurchaseSummary = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const userId = parseInt(req.params.id);

    const result = await query(
      `SELECT e.id AS event_id, e.title AS event_title,
              COALESCE(SUM(s.quantity), 0) AS tickets_purchased,
              COALESCE(SUM(s.quantity * t.price_cents), 0) AS revenue_cents
       FROM sales s
       JOIN tickets t ON s.ticket_id = t.id
       JOIN events e ON t.event_id = e.id
       WHERE s.user_id = $1 AND e.company_id = $2
       GROUP BY e.id, e.title
       ORDER BY e.title ASC`,
      [userId, companyId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Failed to fetch user purchase summary:', error);
    res.status(500).json({ error: 'Failed to fetch user purchase summary' });
  }
};