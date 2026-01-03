import { useState } from 'react';
import styles from './SalesSummaryFilters.module.css';

const SalesSummaryFilters = ({ onFilterChange, events }) => {
  const [filters, setFilters] = useState({
    start: '',
    end: '',
    eventId: ''
  });

  const handleChange = (field, value) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    onFilterChange(newFilters); // notify parent
  };

  return (
    <div className={styles.filters}>
      <label>
        Start Date:
        <input
          type="date"
          value={filters.start}
          onChange={e => handleChange('start', e.target.value)}
        />
      </label>
      <label>
        End Date:
        <input
          type="date"
          value={filters.end}
          onChange={e => handleChange('end', e.target.value)}
        />
      </label>
      <label>
        Event:
        <select
          value={filters.eventId}
          onChange={e => handleChange('eventId', e.target.value)}
        >
          <option value="">All Events</option>
          {events.map(ev => (
            <option key={ev.id} value={ev.id}>
              {ev.title}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
};

export default SalesSummaryFilters;
