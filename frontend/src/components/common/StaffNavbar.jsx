import React from "react";
import styles from "./StaffNavbar.module.css";
import { Link } from "react-router-dom";
import menuIcon from "../../assets/icons/menu.png";
import bellIcon from "../../assets/icons/bell.png";
import logoutIcon from "../../assets/icons/logout.png"; 
import logo from "../../assets/logos/medical-logo.png";

export default function StaffNavbar({ onMenuToggle }) {
  const staffName = "Ahmed Aly";
  const initials = staffName
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join("");

  return (
    <nav className={styles.navbar}>
      {/* LEFT SECTION */}
      <div className={styles.left}>
        <img
          src={menuIcon}
          alt="menu"
          className={styles.menuIcon}
          onClick={onMenuToggle}
        />

        <img src={logo} alt="Clinic Logo" className={styles.logo} />
        <span className={styles.brand}>DentAlign </span>
      </div>

      {/* RIGHT SECTION */}
      <div className={styles.right}>
        <img src={bellIcon} className={styles.bell} />

        {/* PROFILE ICON */}
        <Link to="/staff/profile">
        <div className={styles.profile}>
          <div className={styles.initials}>{initials}</div>

          {/* <div className={styles.dropdown}>
            <Link to="/staff/profile">Profile</Link>
          </div> */}
        </div>
        </Link>

        {/* LOGOUT ICON */}
        <Link to="/login">
          <img src={logoutIcon} className={styles.logoutIcon} />
        </Link>
      </div>
    </nav>
  );
}
