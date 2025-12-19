import React from "react";
import { Link, useLocation } from "react-router-dom";
import styles from "./Navbar.module.css";
import logo from "../../assets/logos/medical-logo.png";

export default function Navbar() {
  const { pathname } = useLocation();

  return (
    <nav className={styles.navbar}>
      
      <div className={styles.left}>
        <img src={logo} alt="Clinic Logo" className={styles.logo} />
        <span className={styles.brand}>DentAlign</span>
      </div>

      <ul className={styles.menu}>
        <li>
          <Link
            to="/"
            className={pathname === "/" ? styles.active : ""}
          >
            Home
          </Link>
        </li>

        <li>
          <a
            href="/doctorOverview"
            className={pathname === "/doctorOverview" ? styles.active : ""}
          >
            Doctors
          </a>
        </li>

        <li>
          <Link
            to="/signup"
            className={pathname === "/signup" ? styles.active : ""}
          >
            SignUp
          </Link>
        </li>

        <li>
          <Link
            to="/login"
            className={pathname === "/login" ? styles.active : ""}
          >
            LogIn
          </Link>
        </li>
      </ul>

      <div
        className={`${styles.contactBtn} ${
          pathname === "/contact" ? styles.activeContactWrapper : ""
        }`}
      >
        <Link
          to="/contact"
          className={pathname === "/contact" ? styles.activeBtn : ""}
        >
          Contact us
        </Link>
      </div>
    </nav>
  );
}
