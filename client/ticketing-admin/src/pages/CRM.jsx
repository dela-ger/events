import { useEffect, useState } from 'react';
import { useApi } from '../lib/api';
import styles from './CRM.module.css';

const CRM = () => {
  const api = useApi();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    api.get('/users')
      .then(res => {
        console.log('Raw CRM user data:', res.data);
        setUsers(res.data)})
      .catch(err => console.error('Failed to load CRM users:', err));
  }, []);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Customers</h1>
      {users.map(user => (
        <div key={user.id} className={styles.user}>
          <strong>{user.name}</strong><br />
          {user.email}<br />
          
        </div>
      ))}
    </div>
  );
};

export default CRM;