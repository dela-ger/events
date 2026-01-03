import { useEffect, useState } from 'react';
import { useApi } from '../lib/api';
import styles from './Dashboard.module.css';
import SignOutButton from '../components/SignOutButton';
import SalesCharts from '../components/SalesCharts';

const Dashboard = () => {
  const api = useApi();
  const [summary, setSummary] = useState([]); // array of event summaries

  useEffect(() => {
    api.get('/dashboard/summary')
      .then(res => {
        console.log('Dashboard summary data:', res.data);
        setSummary(res.data);
      })
      .catch(err => console.error('Failed to load dashboard summary:', err));
  }, []);

  // Aggregate totals from the array
  const totals = summary.reduce(
    (acc, e) => {
      acc.total_sales += parseInt(e.total_sales || 0);
      acc.tickets_sold += parseInt(e.tickets_sold || 0);
      acc.revenue_cents += parseInt(e.revenue_cents || 0);
      return acc;
    },
    { total_sales: 0, tickets_sold: 0, revenue_cents: 0 }
  );

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Dashboard Summary</h1>
      <SignOutButton />

      {/* Totals cards */}
      <div className={styles.cards}>
        <div className={styles.card}>
          <h2>Total Events</h2>
          <p>{summary.length}</p>
        </div>
        <div className={styles.card}>
          <h2>Total Sales</h2>
          <p>{totals.total_sales}</p>
        </div>
        <div className={styles.card}>
          <h2>Tickets Sold</h2>
          <p>{totals.tickets_sold}</p>
        </div>
        <div className={styles.card}>
          <h2>Total Revenue</h2>
          <p>GHS {totals.revenue_cents / 100}</p>
        </div>
      </div>

      {/* <SalesCharts /> */}

      {/* Per-event breakdown table */}
      <h2 className={styles.subtitle}>Event Breakdown</h2>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Event</th>
            <th>Sales</th>
            <th>Tickets Sold</th>
            <th>Revenue (GHS)</th>
          </tr>
        </thead>
        <tbody>
          {summary.map(event => (
            <tr key={event.event_id}>
              <td>{event.event_title}</td>
              <td>{event.total_sales}</td>
              <td>{event.tickets_sold}</td>
              <td>{event.revenue_cents / 100}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Dashboard;
