import React from "react";
import { NavLink } from "react-router-dom";
import styles from "./PatientSidebar.module.css";
import logo from "../../../assets/logos/medical-logo.png";

export default function PatientSidebar({ open, onClose }) {
  return (
    <aside className={`${styles.sidebar} ${open ? styles.open : ""}`}>
      <div className={styles.header}>
        <button className={styles.closeBtn} onClick={onClose}>✕</button>

        <img src={logo} className={styles.logo} alt="Clinic Logo" />
        <span className={styles.brand}>DentAlign</span>
      </div>

      <div className={styles.line}></div>

      <ul>
        <li>
          <NavLink
            to="/patient/dashboard"
            className={({ isActive }) => (isActive ? styles.active : "")}
            onClick={onClose}
          >
            Dashboard
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/patient/booking"
            className={({ isActive }) => (isActive ? styles.active : "")}
            onClick={onClose}
          >
            Book Appointment
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/patient/prescriptions"
            className={({ isActive }) => (isActive ? styles.active : "")}
            onClick={onClose}
          >
            Prescriptions 
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/patient/history"
            className={({ isActive }) => (isActive ? styles.active : "")}
            onClick={onClose}
          >
            History 
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/patient/radiology"
            className={({ isActive }) => (isActive ? styles.active : "")}
            onClick={onClose}
          >
            Radiology Images
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/patient/bills"
            className={({ isActive }) => (isActive ? styles.active : "")}
            onClick={onClose}
          >
            Bills & Payments
          </NavLink>
        </li>
      </ul>
    </aside>
  );
}
