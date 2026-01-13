import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import httpClient from '../../api/httpClient';
import dayjs from 'dayjs';

const TicketsPage = () => {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('idle');

  useEffect(() => {
    const fetchData = async () => {
      setStatus('loading');
      try {
        // Adjust endpoint to your backend: published events/tickets
        const { data } = await httpClient.get('public/events?status=published');
        console.log('Fetched events data:', data);
        setItems(data || []);
        setStatus('success');
      } catch (err) {
        console.error('Fetch events error:', err?.response?.data || err.message);
        setStatus('error');
      }
    };
    fetchData();
  }, []);

  if (status === 'loading') return <div>Loading events…</div>;
  if (status === 'error') return <div>Could not load events</div>;

  return (
    <div className="tickets-page">
      <h1>Available events</h1>
      <div className="ticket-grid">
        {items.map((evt) => (
          <article key={evt.id} className="ticket-card">
            <h2>{evt.title}</h2>
            <p>
              {dayjs(evt.start_time).format('MMM D, YYYY · h:mm A')} –{' '}
              {dayjs(evt.end_time).format('h:mm A')}
            </p>
            <p>{evt.venue}</p>
            <p>
              From {evt.min_price_cents ? (evt.min_price_cents / 100).toFixed(2) : (evt.price_cents / 100).toFixed(2)}{' '}
              {evt.currency}
            </p>
            <Link to={`/tickets/${evt.id}`} aria-label={`View ${evt.title}`}>
              View details
            </Link>
          </article>
        ))}
        {items.length === 0 && <p>No published events yet.</p>}
      </div>
    </div>
  );
};

export default TicketsPage;