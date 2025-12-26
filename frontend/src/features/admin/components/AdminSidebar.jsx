import React from "react";
import { NavLink } from "react-router-dom";
import styles from "./AdminSidebar.module.css";
import logo from "../../../assets/logos/medical-logo.png";

export default function AdminSidebar({ open, onClose }) {
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
          <NavLink to="/admin/dashboard"
            className={({ isActive }) => isActive ? styles.active : ""}
            onClick={onClose}>
            Dashboard
          </NavLink>
        </li>

        <li>
          <NavLink to="/admin/scheduling"
            className={({ isActive }) => isActive ? styles.active : ""}
            onClick={onClose}>
            Scheduling
          </NavLink>
        </li>

        <li>
          <NavLink to="/admin/user-approvals"
            className={({ isActive }) => isActive ? styles.active : ""}
            onClick={onClose}>
            User Approval
          </NavLink>
        </li>

        <li>
          <NavLink to="/admin/patients"
            className={({ isActive }) => isActive ? styles.active : ""}
            onClick={onClose}>
            Patients
          </NavLink>
        </li>

        <li>
          <NavLink to="/admin/staff"
            className={({ isActive }) => isActive ? styles.active : ""}
            onClick={onClose}>
            Staff
          </NavLink>
        </li>

        <li>
          <NavLink to="/admin/services"
            className={({ isActive }) => isActive ? styles.active : ""}
            onClick={onClose}>
            Services
          </NavLink>
        </li>

        <li>
          <NavLink to="/admin/invoices"
            className={({ isActive }) => isActive ? styles.active : ""}
            onClick={onClose}>
            Invoices
          </NavLink>
        </li>

        <li>
          <NavLink to="/admin/reports"
            className={({ isActive }) => isActive ? styles.active : ""}
            onClick={onClose}>
            Reports
          </NavLink>
        </li>
      </ul>
    </aside>
  );
}
