import { useEffect, useState } from 'react';
import { useApi } from '../lib/api';
import styles from './Events.module.css';
import { Link } from 'react-router-dom';
import DeleteEventButton from '../components/DeleteEventButton.jsx';

const Events = () => {
  const api = useApi();
  const [events, setEvents] = useState([]);

  useEffect(() => {
    api.get('/events?includeTickets=true')
      .then(res => {
        console.log('Raw event data:', res.data);
        setEvents(res.data);
      })
      .catch(err => console.error('Failed to load events:', err));
  }, []);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>All Events</h1>
      {events.map(event => (
        <div key={event.id} className={styles.event}>
    <strong>{event.title}</strong><br />
    {event.venue} — {new Date(event.start_time).toLocaleDateString()}<br />
    {(event.tickets || []).length} ticket types<br />
    {(event.tickets || []).reduce((sum, t) => sum + t.quantity_sold, 0)} sold — 
    GHS {(event.tickets || []).reduce((sum, t) => sum + t.price_cents * t.quantity_sold, 0) / 100}

    <Link to={`/events/${event.id}/edit`} >Edit</Link>
    <DeleteEventButton eventId={event.id} />

    <Link to={`/events/${event.id}/tickets/create`} >+ Add Ticket</Link>
    <br />
    <Link to={`/events/${event.id}`}>{event.title}</Link>

    </div>
      ))}
      <Link to="/events/create" className={styles.createButton}>Create New Event</Link>

      
    </div>
  );
};

export default Events;
