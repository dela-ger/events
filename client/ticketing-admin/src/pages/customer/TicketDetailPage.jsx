import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import httpClient from '../../api/httpClient';
import PaystackCheckoutButton from '../../components/payments/PaystackCheckoutButton';
import dayjs from 'dayjs';

const TicketDetailPage = () => {
  const { id } = useParams(); // eventId from the route
  const [tickets, setTickets] = useState([]);
  const [event, setEvent] = useState(null);
  const [quantities, setQuantities] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const { data } = await httpClient.get(`/public/events/${id}/tickets`);
        console.log('Fetched tickets data:', data);

        // If your backend returns { event, tickets }
        if (data.event && data.tickets) {
          setEvent(data.event);
          setTickets(data.tickets);
        } else {
          // If backend returns just an array of tickets
          setTickets(data);
        }
      } catch (err) {
        console.error('Error fetching tickets:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, [id]);

  const handleQuantityChange = (ticketId, value) => {
    setQuantities(prev => ({ ...prev, [ticketId]: value }));
  };

  if (loading) return <div>Loading tickets…</div>;
  if (!tickets || tickets.length === 0) return <div>No tickets found for this event</div>;

  return (
    <div className="ticket-detail">
      {event && (
        <div className="event-info">
          <h1>{event.title}</h1>
          <p>{event.description}</p>
          
          <p>
            {dayjs(event.start_time).format('MMM D, YYYY · h:mm A')}
          </p>
          <p>{event.venue}</p>
          {event.banner_url && (
            <img src={event.banner_url} alt={event.title} style={{ maxWidth: '100%', borderRadius: '8px' }} />
          )}
        </div>
      )}

      <h2>Available Tickets</h2>
      {tickets.map(ticket => {
        const available = ticket.quantity_total - ticket.quantity_sold;
        const quantity = quantities[ticket.id] || 1;

        return (
          <div key={ticket.id} className="ticket-card" style={{ marginBottom: '24px' }}>
            <h3>{ticket.name}</h3>
            {ticket.description && <p>{ticket.description}</p>}
            <p>
              Price: {(ticket.price_cents / 100).toFixed(2)} {ticket.currency}
            </p>
            <p>Available: {available}</p>

            <label>
              Quantity:
              <input
                type="number"
                min="1"
                max={available}
                value={quantity}
                onChange={(e) => handleQuantityChange(ticket.id, Number(e.target.value))}
                style={{ marginLeft: '8px', width: '80px' }}
              />
            </label>

            <div style={{ marginTop: '12px' }}>
              <PaystackCheckoutButton
                ticketId={ticket.id}
                quantity={quantity}
                email={ticket.user_email || 'customer@example.com'} // replace with logged-in user email
                onInitSuccess={(ref) => console.log('Payment reference:', ref)}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TicketDetailPage;
