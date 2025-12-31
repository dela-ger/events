import { useApi } from '../lib/api';
import { useNavigate } from 'react-router-dom';
import styles from './DeleteTicketButton.module.css';

const DeleteTicketButton = ({ ticketId, eventId }) => {
  const api = useApi();
  const navigate = useNavigate();

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this ticket?')) return;

    try {
      await api.delete(`/tickets/${ticketId}`);
      console.log('Ticket deleted:', ticketId);
      // Redirect back to event detail page
      navigate(`/events/${eventId}`);
    } catch (err) {
      console.error('Failed to delete ticket:', err);
      alert('Failed to delete ticket. Please try again.');
    }
  };

  return (
    <button onClick={handleDelete} className={styles.deleteButton}>
      Delete
    </button>
  );
};

export default DeleteTicketButton;
