import { useState, useEffect } from 'react';
import { useApi } from '../lib/api';
import styles from './SalesSummaryFilters.module.css';

const SalesSummaryFilters = ({ onFilterChange }) => {
  const api = useApi();
  const [filters, setFilters] = useState({
    start: '',
    end: '',
    eventId: '',
    interval: 'day'
  });
  const [events, setEvents] = useState([]);

  useEffect(() => {
    api.get('/events')
      .then(res => setEvents(res.data))
      .catch(err => console.error('Failed to load events:', err));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className={styles.filters}>
      <label>
        Start Date:
        <input type="date" name="start" value={filters.start} onChange={handleChange} />
      </label>
      <label>
        End Date:
        <input type="date" name="end" value={filters.end} onChange={handleChange} />
      </label>
      <label>
        Event:
        <select name="eventId" value={filters.eventId} onChange={handleChange}>
          <option value="">All Events</option>
          {events.map(ev => (
            <option key={ev.id} value={ev.id}>{ev.title}</option>
          ))}
        </select>
      </label>
      <label>
        Interval:
        <select name="interval" value={filters.interval} onChange={handleChange}>
          <option value="day">Day</option>
          <option value="week">Week</option>
          <option value="month">Month</option>
        </select>
      </label>
    </div>
  );
};

export default SalesSummaryFilters;
