import { useEffect, useState } from 'react';
import { useApi } from '../lib/api';
import styles from './EditTicket.module.css';
import { useNavigate, useParams } from 'react-router-dom';

const EditTicket = () => {
  const api = useApi();
  const navigate = useNavigate();
  const { id } = useParams(); // ticket ID from route

  const [formData, setFormData] = useState({
    name: '',
    price_cents: '',
    currency: 'GHS',
    quantity_total: '',
    per_user_limit: ''
  });

  const [error, setError] = useState(null);

  // Fetch existing ticket details
  useEffect(() => {
    api.get(`/tickets/${id}`)
      .then(res => {
        console.log('Loaded ticket:', res.data);
        setFormData(res.data);
      })
      .catch(err => {
        console.error('Failed to load ticket:', err);
        setError('Failed to load ticket details.');
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
      const payload = {
        name: formData.name,
        price_cents: parseInt(formData.price_cents),
        currency: formData.currency,
        quantity_total: parseInt(formData.quantity_total),
        per_user_limit: formData.per_user_limit ? parseInt(formData.per_user_limit) : null
      };

      const res = await api.put(`/tickets/${id}`, payload);
      console.log('Ticket updated:', res.data);
      // Redirect back to event detail page
      navigate(`/events/${res.data.event_id}`);
    } catch (err) {
      console.error('Failed to update ticket:', err);
      setError('Failed to update ticket. Please try again.');
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Edit Ticket</h1>
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
          Quantity Total:
          <input type="number" name="quantity_total" value={formData.quantity_total} onChange={handleChange} required />
        </label>
        <label>
          Per User Limit:
          <input type="number" name="per_user_limit" value={formData.per_user_limit || ''} onChange={handleChange} />
        </label>
        <button type="submit" className={styles.button}>Update Ticket</button>
      </form>
    </div>
  );
};

export default EditTicket;
