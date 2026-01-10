import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import httpClient from '../../api/httpClient';
import PaystackCheckoutButton from '../../components/payments/PaystackCheckoutButton';

const TicketDetailPage = () => {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const { data } = await httpClient.get(`/tickets/${id}`);
        setTicket(data);
      } catch (err) {
        console.error('Error fetching ticket:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTicket();
  }, [id]);

  if (loading) return <div>Loading ticket…</div>;
  if (!ticket) return <div>Ticket not found</div>;

  const available = ticket.quantity_available - ticket.quantity_sold;

  return (
    <div className="ticket-detail">
      <h1>{ticket.name}</h1>
      <p>{ticket.description}</p>
      <p>
        Price: {ticket.price_cents / 100} {ticket.currency}
      </p>
      <p>Available: {available}</p>

      <label>
        Quantity:
        <input
          type="number"
          min="1"
          max={available}
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
        />
      </label>

      <PaystackCheckoutButton
        ticketId={ticket.id}
        quantity={quantity}
        email={ticket.user_email} // or from logged-in user profile
        onInitSuccess={(ref) => console.log('Payment reference:', ref)}
      />
    </div>
  );
};

export default TicketDetailPage;