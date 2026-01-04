import { useEffect, useState } from 'react';
import { useApi } from '../lib/api';
import styles from './Sales.module.css';

const Sales = () => {
  const api = useApi();
  const [sales, setSales] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/sales/sales')
      .then(res => {
        console.log('Sales data:', res.data);
        setSales(res.data);
      })
      .catch(err => {
        console.error('Failed to load sales:', err);
        setError('Failed to load sales data.');
      });
  }, []);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Sales Management</h1>
      {error && <p className={styles.error}>{error}</p>}
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Sale ID</th>
            <th>User</th>
            <th>Event</th>
            <th>Ticket</th>
            <th>Quantity</th>
            <th>Total (GHS)</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {sales.map(sale => (
            <tr key={sale.id}>
              <td>{sale.id}</td>
              <td>{sale.user_name || sale.user_id}</td>
              <td>{sale.event_title}</td>
              <td>{sale.ticket_name}</td>
              <td>{sale.quantity}</td>
              <td>
  {new Intl.NumberFormat('en-GH', { style: 'currency', currency: sale.currency || 'GHS' }) .format(sale.total_cents / 100)}
</td>

              <td>{new Date(sale.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Sales;
