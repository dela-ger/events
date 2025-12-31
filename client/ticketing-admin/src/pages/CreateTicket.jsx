import { useState } from 'react';
import { useApi } from '../lib/api';
import styles from './CreateTicket.module.css';
import { useNavigate, useParams } from 'react-router-dom';

const CreateTicket = () => {
  const api = useApi();
  const navigate = useNavigate();
  const { id } = useParams(); // event ID from route

  const [formData, setFormData] = useState({
    name: '',
    price_cents: '',
    currency: 'GHS',
    quantity: '',
    per_user_limit: ''
  });

  const [error, setError] = useState(null);

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
      const payload = { ...formData, event_id: id };
      const res = await api.post('/tickets', payload);
      console.log('Ticket created:', res.data);
      // Redirect back to event detail page
      navigate(`/events/${id}`);
    } catch (err) {
      console.error('Failed to create ticket:', err);
      setError('Failed to create ticket. Please try again.');
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Create Ticket</h1>
      {error && <p className={styles.error}>{error}</p>}
      <form onSubmit={handleSubmit} className={styles.form}>
        <label>
          Ticket Name:
          <input type="text" name="name" value={formData.name} onChange={handleChange} required />
        </label>
        <label>
          Price (in cents):
          <input type="number" name="price_cents" value={formData.price_cents} onChange={handleChange} required />
        </label>
        <label>
          Currency:
          <select name="currency" value={formData.currency} onChange={handleChange}>
            <option value="GHS">GHS</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </select>
        </label>
        <label>
          Quantity:
          <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} required />
        </label>
        <label>
          Per User Limit:
          <input type="number" name="per_user_limit" value={formData.per_user_limit} onChange={handleChange} />
        </label>
        <button type="submit" className={styles.button}>Create Ticket</button>
      </form>
    </div>
  );
};

export default CreateTicket;
