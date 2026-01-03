import { Link } from "react-router-dom";
import styles from './Navbar.module.css';
import SignOutButton from "./SignOutButton";

function Navbar() {
  return (
    <nav className={styles.navbar}>
      <h2 className={styles.logo}>Admin CRM</h2>
      <ul className={styles.navLinks}>
        <li><Link to="/">Dashboard</Link></li>
        <li><Link to="/events">Events</Link></li>
        <li><Link to="/sales">Sales</Link></li>
        <li><Link to="/sales/summary">Sales Summary</Link></li>

        <li><SignOutButton /></li>
      </ul>
    </nav>
  )
}

export default Navbar