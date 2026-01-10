import { query } from '../../config/db.js';

// Publish event
export const publishEvent = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const eventId = parseInt(req.params.id);

    const result = await query(
      `UPDATE events
       SET status = 'published'
       WHERE id = $1 AND company_id = $2
       RETURNING *`,
      [eventId, companyId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found or unauthorized' });
    }

    res.status(200).json({ message: 'Event published successfully', event: result.rows[0] });
  } catch (error) {
    console.error('Failed to publish event:', error);
    res.status(500).json({ error: 'Failed to publish event' });
  }
};

// Unpublish event
export const unpublishEvent = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const eventId = parseInt(req.params.id);

    const result = await query(
      `UPDATE events
       SET status = 'draft'
       WHERE id = $1 AND company_id = $2
       RETURNING *`,
      [eventId, companyId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found or unauthorized' });
    }

    res.status(200).json({ message: 'Event reverted to draft', event: result.rows[0] });
  } catch (error) {
    console.error('Failed to unpublish event:', error);
    res.status(500).json({ error: 'Failed to unpublish event' });
  }
};