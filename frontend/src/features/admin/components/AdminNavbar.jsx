import React, { useState, useEffect } from "react";
import styles from "./AdminNavbar.module.css";
import menuIcon from "../../../assets/icons/menu.png";
import bellIcon from "../../../assets/icons/bell.png";
import logoutIcon from "../../../assets/icons/logout.png";
import logo from "../../../assets/logos/medical-logo.png";
import { Link } from "react-router-dom";

export default function AdminNavbar({ onMenuToggle }) {
  const [adminName, setAdminName] = useState("Admin");

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setAdminName(user.username || user.full_name || "Admin");
      } catch (error) {
        console.error("Failed to parse user data:", error);
      }
    }
  }, []);

  const initials = adminName
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("");

  return (
    <nav className={styles.navbar}>
      <div className={styles.left}>
        <img
          src={menuIcon}
          alt="menu"
          className={styles.menuIcon}
          onClick={onMenuToggle}
        />

        <img src={logo} alt="Clinic Logo" className={styles.logo} />
        <span className={styles.brand}>DentAlign</span>
      </div>

      <div className={styles.right}>
        <img src={bellIcon} alt="notifications" className={styles.bell} />

        <Link to="/admin/profile">
          <div className={styles.profile}>
            <div className={styles.initials}>{initials}</div>
          </div>
        </Link>

        <Link to="/login">
          <img src={logoutIcon} alt="logout" className={styles.logoutIcon} />
        </Link>
      </div>
    </nav>
  );
}
