import { useEffect, useState } from 'react';
import { useApi } from '../lib/api';
import styles from './SalesSummary.module.css';
import SalesSummaryFilters from '../components/SalesSummaryFilters.jsx';
import SalesCharts from '../components/SalesCharts.jsx';

const SalesSummary = () => {
  const api = useApi();
  const [summary, setSummary] = useState([]);
  const [filters, setFilters] = useState({ start: '', end: '', eventId: '' });
  const [events, setEvents] = useState([]);

  // Fetch events for dropdown
  useEffect(() => {
    api.get('/events')
      .then(res => setEvents(res.data))
      .catch(err => console.error('Failed to load events:', err));
  }, []);

  // Fetch summary with filters
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.start) params.append('start', filters.start);
    if (filters.end) params.append('end', filters.end);
    if (filters.eventId) params.append('event_id', filters.eventId);

    api.get(`/dashboard/summary?${params.toString()}`)
      .then(res => setSummary(res.data))
      .catch(err => console.error('Failed to load summary:', err));
  }, [filters]);

  // Totals
  const totals = summary.reduce(
    (acc, event) => {
      acc.sales += parseInt(event.total_sales);
      acc.tickets += parseInt(event.tickets_sold);
      acc.revenue += parseInt(event.revenue_cents);
      return acc;
    },
    { sales: 0, tickets: 0, revenue: 0 }
  );

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Sales Summary Dashboard</h1>

      <SalesSummaryFilters onFilterChange={setFilters} events={events} />

      {/* KPI Cards */}
      <div className={styles.cards}>
        <div className={styles.card}><h2>Total Sales</h2><p>{totals.sales}</p></div>
        <div className={styles.card}><h2>Tickets Sold</h2><p>{totals.tickets}</p></div>
        <div className={styles.card}>
          <h2>Total Revenue</h2>
          <p>
            {new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' })
              .format(totals.revenue / 100)}
          </p>
        </div>
      </div>

      {/* Charts */}
      <SalesCharts summary={summary} />

      {/* Table */}
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Event</th>
            <th>Total Sales</th>
            <th>Tickets Sold</th>
            <th>Revenue</th>
          </tr>
        </thead>
        <tbody>
          {summary.map(event => (
            <tr key={event.event_id}>
              <td>{event.event_title}</td>
              <td>{event.total_sales}</td>
              <td>{event.tickets_sold}</td>
              <td>
                {new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' })
                  .format(event.revenue_cents / 100)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SalesSummary;
