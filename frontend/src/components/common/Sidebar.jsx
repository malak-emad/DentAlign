import React from "react";
import { NavLink } from "react-router-dom";
import styles from "./Sidebar.module.css";
import logo from "../../assets/logos/medical-logo.png";
import { sidebarMenus } from "./sidebarConfig";

export default function Sidebar({ open, onClose, role = "staff" }) {
  const menuItems = sidebarMenus[role] || [];

  return (
    <aside className={`${styles.sidebar} ${open ? styles.open : ""}`}>
      
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.closeBtn} onClick={onClose}>✕</button>
        <img src={logo} className={styles.logo} alt="Clinic Logo" />
        <span className={styles.brand}>DentAlign</span>
      </div>

      <div className={styles.line} />

      {/* Menu */}
      <ul className={styles.menu}>
        {menuItems.map((item) => (
          <li key={item.path}>
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                isActive ? styles.active : undefined
              }
              onClick={onClose}
            >
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </aside>
  );
}
