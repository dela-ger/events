import { useEffect, useState } from 'react';
import { Bar, Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { useApi } from '../lib/api'; // make sure you have your api hook
import styles from './SalesCharts.module.css';

// Register Chart.js components once
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const SalesCharts = ({ summary, filters }) => {
  const api = useApi();
  const [trend, setTrend] = useState([]);

  // Fetch revenue trend when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters?.start) params.append('start', filters.start);
    if (filters?.end) params.append('end', filters.end);
    if (filters?.eventId) params.append('event_id', filters.eventId);
    params.append('interval', filters?.interval || 'day');

    api.get(`/sales/revenue-trend?${params.toString()}`)
      .then(res => setTrend(res.data))
      .catch(err => console.error('Failed to load revenue trend:', err));
  }, [filters]);

  if (!summary || summary.length === 0) {
    return <p>No data available for charts.</p>;
  }

  // Bar chart: tickets sold per event
  const barData = {
    labels: summary.map(e => e.event_title),
    datasets: [
      {
        label: 'Tickets Sold',
        data: summary.map(e => e.tickets_sold),
        backgroundColor: '#2980b9'
      }
    ]
  };

  // Line chart: revenue trend over time
  const lineData = {
    labels: trend.map(r => new Date(r.period).toLocaleDateString()),
    datasets: [
      {
        label: 'Revenue (GHS)',
        data: trend.map(r => r.revenue_cents / 100),
        borderColor: '#27ae60',
        fill: false
      }
    ]
  };

  // Pie chart: distribution of tickets sold
  const pieData = {
    labels: summary.map(e => e.event_title),
    datasets: [
      {
        data: summary.map(e => e.tickets_sold),
        backgroundColor: ['#3498db', '#9b59b6', '#f1c40f', '#e74c3c', '#2ecc71']
      }
    ]
  };

  return (
    <div className={styles.container}>
      <h2>Sales Visualizations</h2>
      <div className={styles.charts}>
        <div className={styles.chart}><Bar data={barData} /></div>
        <div className={styles.chart}>
          {trend.length > 0 ? <Line data={lineData} /> : <p>No trend data available</p>}
        
        
        </div>
        <div className={styles.chart}><Pie data={pieData} /></div>
      </div>
    </div>
  );
};

export default SalesCharts;
