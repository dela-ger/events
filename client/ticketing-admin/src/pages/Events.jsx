import { useEffect, useState } from 'react';
import { useApi } from '../lib/api';
import styles from './Events.module.css';

const Events = () => {
  const api = useApi();
  const [events, setEvents] = useState([]);

  useEffect(() => {
    api.get('/dashboard/summary')
      .then(res => {
        console.log('Raw event data:', res.data);
        setEvents(res.data)})
      .catch(err => console.error('Failed to load events:', err));
  }, []);

  console.log(events);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>All Events</h1>
      {events.map(event => (
        <div key={event.event_id} className={styles.event}>
          <strong>{event.event_title}</strong><br />
          {event.tickets_created} tickets created<br />
          {event.tickets_sold} sold — GHS {event.revenue_cents / 100}
        </div>
      ))}
    </div>
  );
};

export default Events;