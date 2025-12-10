import React from "react";
import styles from "./PatientNavbar.module.css";
import menuIcon from "../../../assets/icons/menu.png";
import bellIcon from "../../../assets/icons/bell.png";
import logoutIcon from "../../../assets/icons/logout.png";
import logo from "../../../assets/logos/medical-logo.png";
import { Link } from "react-router-dom";

export default function PatientNavbar({ onMenuToggle }) {
  const patientName = "Sarah Mohamed";
  const initials = patientName
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
        <img src={bellIcon} className={styles.bell} />

        <Link to="/patient/profile">
            <div className={styles.profile}>
            <div className={styles.initials}>{initials}</div>
            </div>
        </Link>

        <Link to="/login">
          <img src={logoutIcon} className={styles.logoutIcon} />
        </Link>
      </div>
    </nav>
  );
}
