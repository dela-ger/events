import { useEffect, useState } from 'react';
import { useApi } from '../lib/api';
import { useParams, Link } from 'react-router-dom';
import styles from './EventDetail.module.css';
import DeleteTicketButton from '../components/DeleteTicketButton.jsx';

const EventDetail = () => {
  const api = useApi();
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    // Fetch event info
    api.get(`/events/${id}`)
      .then(res => setEvent(res.data))
      .catch(err => console.error('Failed to load event:', err));

    // Fetch tickets for this event
    api.get(`/tickets?eventId=${id}`)
      .then(res => setTickets(res.data))
      .catch(err => console.error('Failed to load tickets:', err));
  }, [id]);

  if (!event) return <p>Loading...</p>;

  return (
    <div className={styles.container}>
      <h1>{event.title}</h1>
      <p>{event.description}</p>
      <p><strong>Venue:</strong> {event.venue}</p>
      <p><strong>Date:</strong> {new Date(event.start_time).toLocaleString()}</p>

      <h2>Tickets</h2>
      <Link to={`/events/${id}/tickets/create`}>+ Add Ticket</Link>
      <div>
      <ul>
        {tickets.map(ticket => (
            <div key={ticket.id}>
          <li key={ticket.id}>
            {ticket.name} — GHS {ticket.price_cents / 100} ({ticket.quantity_total} total)
          </li>
          <Link to={`/tickets/${ticket.id}/edit`}>Edit</Link>
            <DeleteTicketButton ticketId={ticket.id} eventId={event.id} />
          </div>
          
        ))}
      </ul>
      </div>
    </div>
  );
};

export default EventDetail;
