import React, { useState, useEffect } from "react";
import styles from "./StaffNavbar.module.css";
import { Link, useLocation } from "react-router-dom";
import menuIcon from "../../assets/icons/menu.png";
import bellIcon from "../../assets/icons/bell.png";
import logoutIcon from "../../assets/icons/logout.png";
import logo from "../../assets/logos/medical-logo.png";

export default function StaffNavbar({ onMenuToggle, unreadCount }) {
  const location = useLocation();
  const isNotificationsPage = location.pathname === "/staff/notifications";
  const [staffName, setStaffName] = useState("Staff Member");

  useEffect(() => {
    // Get staff name from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        // Use first_name and last_name from user data
        const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
        setStaffName(fullName || user.email || 'Staff Member');
      } catch (error) {
        console.error('Failed to parse user data:', error);
      }
    }
  }, []);

  const initials = staffName
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join("");

  return (
    <nav className={styles.navbar}>
      <div className={styles.left}>
        <img src={menuIcon} alt="menu" className={styles.menuIcon} onClick={onMenuToggle} />
        <img src={logo} alt="Clinic Logo" className={styles.logo} />
        <span className={styles.brand}>DentAlign</span>
      </div>

      <div className={styles.right}>
        <Link to="/staff/notifications" className={styles.bellWrapper}>
          <img
            src={bellIcon}
            alt="Notifications"
            className={`${styles.bell} ${isNotificationsPage ? styles.activeBell : ""}`}
          />

          {unreadCount > 0 && (
            <span className={styles.badge}>
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Link>

        <Link to="/staff/profile">
          <div className={styles.profile}>
            <div className={styles.initials}>{initials}</div>
          </div>
        </Link>

        <Link to="/login">
          <img src={logoutIcon} alt="Logout" className={styles.logoutIcon} />
        </Link>
      </div>
    </nav>
  );
}
