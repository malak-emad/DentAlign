import React from "react";
import { Link, useLocation } from "react-router-dom";
import styles from "./Navbar.module.css";
import logo from "../../assets/logos/medical-logo.png";

export default function Navbar() {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <nav className={styles.navbar}>
      <div className={styles.left}>
        <img src={logo} alt="Clinic Logo" className={styles.logo} />
        <span className={styles.brand}>DentAlign</span>
      </div>

      <ul className={styles.menu}>
        <li><Link to="/">Home</Link></li>
        <li><a href="#">Doctors</a></li>

        {/* Hide SignUp ONLY when on /signup */}
        {currentPath !== "/signup" && (
          <li><Link to="/signup">SignUp</Link></li>
        )}

        {/* Hide Login ONLY when on /login */}
        {currentPath !== "/login" && (
          <li><Link to="/login">LogIn</Link></li>
        )}
      </ul>

      <div className={styles.contactBtn}>
        <a href="#">Contact us</a>
      </div>
    </nav>
  );
}
