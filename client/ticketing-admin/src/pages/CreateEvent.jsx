import { useState } from "react";
import { useApi } from "../lib/api";
import styles from "./CreateEvent.module.css";
import { useNavigate } from "react-router-dom";

const CreateEvent = ()=> {
    const api = useApi();
    const navigate = useNavigate();


    const [formData, setFormData] = useState({ 
        title: '', 
        description: '', 
        start_time: '', 
        end_time: '', 
        venue: '', 
        banner_url: '' });

    const [error, setError] = useState(null);

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
            const res = await api.post('/events', formData);
            console.log('Event created:', res.data);

            // Redirect to events page after successful creation
            navigate('/events');
        } catch (err) {
            console.error('Failed to create event:', setError('Failed to create event'))
        }

    };

    return(
        <div className={styles.container}>
      <h1 className={styles.title}>Create New Event</h1>
      {error && <p className={styles.error}>{error}</p>}
      <form onSubmit={handleSubmit} className={styles.form}>
        <label>
          Title:
          <input type="text" name="title" value={formData.title} onChange={handleChange} required />
        </label>
        <label>
          Description:
          <textarea name="description" value={formData.description} onChange={handleChange} required />
        </label>
        <label>
          Start Time:
          <input type="datetime-local" name="start_time" value={formData.start_time} onChange={handleChange} required />
        </label>
        <label>
          End Time:
          <input type="datetime-local" name="end_time" value={formData.end_time} onChange={handleChange} required />
        </label>
        <label>
          Venue:
          <input type="text" name="venue" value={formData.venue} onChange={handleChange} required />
        </label>
        <label>
          Banner URL:
          <input type="url" name="banner_url" value={formData.banner_url} onChange={handleChange} />
        </label>
        <button type="submit" className={styles.button}>Create Event</button>
      </form>
    </div>
    )
} 

export default CreateEvent;