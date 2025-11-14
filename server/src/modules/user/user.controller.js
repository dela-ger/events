import { query } from '../../config/db.js';

export const getUserProfile = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const userId = parseInt(req.params.id);

    // Get basic user info
    const userRes = await query(
      `SELECT id, name, email
       FROM users
       WHERE id = $1`,
      [userId]
    );

    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userRes.rows[0];

    // Get sales summary for this user within the company
    const salesRes = await query(
      `SELECT COALESCE(SUM(s.quantity), 0) AS tickets_purchased,
              COALESCE(SUM(s.quantity * t.price_cents), 0) AS revenue_cents
       FROM sales s
       JOIN tickets t ON s.ticket_id = t.id
       JOIN events e ON t.event_id = e.id
       WHERE s.user_id = $1 AND e.company_id = $2`,
      [userId, companyId]
    );

    const summary = salesRes.rows[0];

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      tickets_purchased: parseInt(summary.tickets_purchased),
      revenue_cents: parseInt(summary.revenue_cents)
    });
  } catch (error) {
    console.error('Failed to fetch user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
};

// get users list who bought ticket for events (for admin use)
export const listUsersForCompany = async (req, res) => {
  try {
    const companyId = req.user.companyId;

    const result = await query(
      `SELECT DISTINCT u.id, u.name, u.email
       FROM users u
       JOIN sales s ON u.id = s.user_id
       JOIN tickets t ON s.ticket_id = t.id
       JOIN events e ON t.event_id = e.id
       WHERE e.company_id = $1
       ORDER BY u.name ASC`,
      [companyId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Failed to list users:', error);
    res.status(500).json({ error: 'Failed to list users' });
  }
};