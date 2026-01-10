import { pool } from '../../config/db.js';

export const getPublishedEvents = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT 
         id,
         title,
         description,
         highlights,
         start_time,
         end_time,
         venue,
         banner_url
       FROM events
       WHERE status = 'published'
       ORDER BY start_time ASC`
    );
    res.json(rows);
  } catch (err) {
    console.error('Public events error:', err.message);
    res.status(500).json({ error: 'Could not load events' });
  }
};