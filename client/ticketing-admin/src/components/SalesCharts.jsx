import { useEffect, useState } from 'react';
import { useApi } from '../lib/api';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import styles from './SalesCharts.module.css';
// Register required components 
ChartJS.register( CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, ArcElement );

const SalesCharts = () => {
  const api = useApi();
  const [summary, setSummary] = useState([]);

  useEffect(() => {
    api.get('/dashboard/summary')
      .then(res => setSummary(res.data))
      .catch(err => console.error('Failed to load summary:', err));
  }, []);

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

  // Line chart: revenue trend (sorted by event title for now)
  const lineData = {
    labels: summary.map(e => e.event_title),
    datasets: [
      {
        label: 'Revenue (GHS)',
        data: summary.map(e => e.revenue_cents / 100),
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
        <div className={styles.chart}><Line data={lineData} /></div>
        <div className={styles.chart}><Pie data={pieData} /></div>
      </div>
    </div>
  );
};

export default SalesCharts;
