import { useApi } from '../lib/api';
import { useNavigate } from 'react-router-dom';
import styles from './DeleteEventButton.module.css';

const DeleteEventButton = ({ eventId }) => {
  const api = useApi();
  const navigate = useNavigate();

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;

    try {
      const res = await api.delete(`/events/${eventId}`);
      console.log('Event deleted:', res.data);
      // Refresh or redirect back to events list
      navigate('/events');
    } catch (err) {
      console.error('Failed to delete event:', err);
      alert('Failed to delete event. Please try again.');
    }
  };

  return (
    <button onClick={handleDelete} className={styles.deleteButton}>
      Delete
    </button>
  );
};

export default DeleteEventButton;
