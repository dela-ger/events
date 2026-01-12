import { pool } from '../../config/db.js';

export const getPublishedEvents = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT 
   e.id,
   e.title,
   e.description,
   e.highlights,
   e.start_time,
   e.end_time,
   e.venue,
   e.banner_url,
   MIN(t.price_cents) AS min_price_cents,
   MIN(t.currency) AS currency
FROM events e
JOIN tickets t ON t.event_id = e.id
WHERE e.status = 'published'
GROUP BY e.id, e.title, e.description, e.highlights,
         e.start_time, e.end_time, e.venue, e.banner_url
ORDER BY e.start_time ASC
`
    );

    res.json(rows);
  } catch (err) {
    console.error('Public events error:', err.message);
    res.status(500).json({ error: 'Could not load events' });
  }
};
