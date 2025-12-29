import { useEffect, useState } from 'react';
import { useApi } from '../lib/api';
import styles from './Dashboard.module.css';
import SignOutButton from '../components/SignOutButton';

const Dashboard = () => {
  const api = useApi();
  const [summary, setSummary] = useState([]);

  useEffect(() => {
    api.get('/dashboard/summary')
      .then(res => setSummary(res.data))
      .catch(err => console.error('Failed to load dashboard summary:', err));
  }, []);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Dashboard Summary</h1>
      <SignOutButton />
      <ul>
        {summary.map(event => (
          <li key={event.event_id} className={styles.event}>
            <strong>{event.event_title}</strong> — {event.tickets_sold} tickets sold, GHS {event.revenue_cents / 100}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Dashboard;