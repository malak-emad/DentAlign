import React from "react";
import { NavLink } from "react-router-dom";
import styles from "./Sidebar.module.css";
import logo from "../../assets/logos/medical-logo.png";

export default function Sidebar({ open, onClose }) {
  return (
    <aside className={`${styles.sidebar} ${open ? styles.open : ""}`}>
      
      {/* Header: X + logo + brand */}
      <div className={styles.header}>
        <button className={styles.closeBtn} onClick={onClose}>✕</button>

        <img src={logo} className={styles.logo} alt="Clinic Logo" />
        <span className={styles.brand}>DentAlign</span>
      </div>

      <div className={styles.line}></div>

      <ul>
        <li>
          <NavLink 
            to="/staff/dashboard"
            className={({ isActive }) => isActive ? styles.active : ""}
            onClick={onClose}
          >
            Dashboard
          </NavLink>
        </li>

        <li>
          <NavLink 
            to="/staff/appointments"
            className={({ isActive }) => isActive ? styles.active : ""}
            onClick={onClose}
          >
            Appointments
          </NavLink>
        </li>

        <li>
          <NavLink 
            to="/staff/patients"
            className={({ isActive }) => isActive ? styles.active : ""}
            onClick={onClose}
          >
            Patients
          </NavLink>
        </li>

        <li>
          <NavLink 
            to="/staff/radiology"
            className={({ isActive }) => isActive ? styles.active : ""}
            onClick={onClose}
          >
            Radiology
          </NavLink>
        </li>

        <li>
          <NavLink 
            to="/staff/reports"
            className={({ isActive }) => isActive ? styles.active : ""}
            onClick={onClose}
          >
            Reports & Metrics
          </NavLink>
        </li>

      </ul>
    </aside>
  );
}
