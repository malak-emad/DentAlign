import React from "react";
import { Link } from "react-router-dom";
import styles from "./Navbar.module.css";
import logo from "../../assets/logos/medical-logo.png"; // change path if needed

export default function Navbar() {
  return (
    <nav className={styles.navbar}>
      {/* Left Section: Logo + Brand */}
      <div className={styles.left}>
        <img src={logo} alt="Clinic Logo" className={styles.logo} />
        <span className={styles.brand}>DentAlign</span>
      </div>

      {/* Center Menu */}
      <ul className={styles.menu}>
        <li><Link to="/">Home</Link></li>
        <li><a href="#">Doctors</a></li>
        <li><Link to="/signup">Signup</Link></li>
        <li><Link to="/login">Signin</Link></li>
        <li><a href="#">Contact Us</a></li>
      </ul>

      {/* Right Button (like screenshot) */}
      <div className={styles.contactBtn}>
        <a href="#">Contact us</a>
      </div>
    </nav>
  );
}
