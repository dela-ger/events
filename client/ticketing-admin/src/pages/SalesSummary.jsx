import { useEffect, useState } from 'react';
import { useApi } from '../lib/api';
import styles from './SalesSummary.module.css';
import SalesSummaryFilters from '../components/SalesSummaryFilters.jsx';
import SalesCharts from '../components/SalesCharts.jsx';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

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

    api.get(`sales/dashboard/summary?${params.toString()}`)
      .then(res => setSummary(res.data))
      .catch(err => console.error('Failed to load summary:', err));

    console.log('Applied filters:', filters);
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

  const handleDownloadCSV = async () => {
  try {
    const params = new URLSearchParams(filters).toString();

    // Use axios directly to include auth headers
    const response = await axios.get(`${API_URL}/sales/dashboard/export?${params}`, {
      responseType: 'blob', // important for file download
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`, // or however you store JWT
      },
    });

    // Create a blob URL and trigger download
    const blob = new Blob([response.data], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'sales_summary.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Failed to download CSV:', err);
  }
};

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

      <button onClick={handleDownloadCSV}>
  Download CSV
</button>




    </div>
  );
};

export default SalesSummary;
