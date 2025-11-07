import { query } from '../../config/db.js';

export async function createEvent(req, res) {
  const { title, description, start_time, end_time, venue, banner_url } = req.body;
  const companyId = req.user.companyId;

  if (!companyId) {
    return res.status(403).json({ error: 'User is not linked to a company' });
  }

  try {
    const result = await query(
      `INSERT INTO events (company_id, title, description, start_time, end_time, venue, banner_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [companyId, title, description, start_time, end_time, venue, banner_url]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create event error:', err);
    res.status(500).json({ error: 'Failed to create event' });
  }
}

// get events for the authenticated user's company
export const getEvents = async (req, res) => {
  try {
    const companyId = req.user.companyId;

    const result = await query(
      'SELECT * FROM events WHERE company_id = $1 ORDER BY start_time ASC',
      [companyId]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Failed to fetch events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
};

// get events by event ID for the authenticated user's company
export const getEventById = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const eventId = parseInt(req.params.id);

    const result = await query(
      'SELECT * FROM events WHERE id = $1 AND company_id = $2',
      [eventId, companyId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Failed to fetch event:', error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
};

// update event by ID for the authenticated user's company
export const updateEvent = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const eventId = parseInt(req.params.id);
    const {
      title,
      description,
      start_time,
      end_time,
      venue,
      banner_url,
      status
    } = req.body;

    const result = await query(
      `UPDATE events
       SET title = $1,
           description = $2,
           start_time = $3,
           end_time = $4,
           venue = $5,
           banner_url = $6,
           status = $7
       WHERE id = $8 AND company_id = $9
       RETURNING *`,
      [
        title,
        description,
        start_time,
        end_time,
        venue,
        banner_url,
        status,
        eventId,
        companyId
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found or unauthorized' });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Failed to update event:', error);
    res.status(500).json({ error: 'Failed to update event' });
  }
};

// delete event by ID for the authenticated user's company
export const deleteEvent = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const eventId = parseInt(req.params.id);

    const result = await query(
      'DELETE FROM events WHERE id = $1 AND company_id = $2 RETURNING *',
      [eventId, companyId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found or unauthorized' });
    }

    res.status(200).json({ message: 'Event deleted successfully', event: result.rows[0] });
  } catch (error) {
    console.error('Failed to delete event:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
};