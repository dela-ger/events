import { useEffect, useState } from 'react';
import { useApi } from '../lib/api';
import styles from './EditEvent.module.css';
import { useNavigate, useParams } from 'react-router-dom';

const EditEvent = () => {
  const api = useApi();
  const navigate = useNavigate();
  const { id } = useParams(); // event ID from route

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    venue: '',
    banner_url: '',
    status: ''
  });

  const [error, setError] = useState(null);

  // Fetch existing event details
  useEffect(() => {
    api.get(`/events/${id}`)
      .then(res => {
        console.log('Loaded event:', res.data);
        setFormData(res.data);
      })
      .catch(err => {
        console.error('Failed to load event:', err);
        setError('Failed to load event details.');
      });
  }, [id]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const res = await api.put(`/events/${id}`, formData);
      console.log('Event updated:', res.data);
      // Redirect back to events list
      navigate('/events');
    } catch (err) {
      console.error('Failed to update event:', err);
      setError('Failed to update event. Please try again.');
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Edit Event</h1>
      {error && <p className={styles.error}>{error}</p>}
      <form onSubmit={handleSubmit} className={styles.form}>
        <label>
          Title:
          <input type="text" name="title" value={formData.title} onChange={handleChange} required />
        </label>
        <label>
          Description:
          <textarea name="description" value={formData.description} onChange={handleChange} required />
        </label>
        <label>
          Start Time:
          <input type="datetime-local" name="start_time" value={formData.start_time} onChange={handleChange} required />
        </label>
        <label>
          End Time:
          <input type="datetime-local" name="end_time" value={formData.end_time} onChange={handleChange} required />
        </label>
        <label>
          Venue:
          <input type="text" name="venue" value={formData.venue} onChange={handleChange} required />
        </label>
        <label>
          Banner URL:
          <input type="url" name="banner_url" value={formData.banner_url} onChange={handleChange} />
        </label>
        <label>
          Status:
          <select name="status" value={formData.status || ''} onChange={handleChange}>
            <option value="">Select status</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </label>
        <button type="submit" className={styles.button}>Update Event</button>
      </form>
    </div>
  );
};

export default EditEvent;
