import React, { useState, useEffect } from "react";
import styles from "./PatientNavbar.module.css";
import menuIcon from "../../../assets/icons/menu.png";
import bellIcon from "../../../assets/icons/bell.png";
import logoutIcon from "../../../assets/icons/logout.png";
import logo from "../../../assets/logos/medical-logo.png";
import { Link, useNavigate } from "react-router-dom";
import LogoutConfirmModal from "../../../components/common/LogoutConfirmModal"; // adjust path if needed

export default function PatientNavbar({ onMenuToggle }) {
  const [patientName, setPatientName] = useState("Patient");
  const [showLogout, setShowLogout] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setPatientName(user.username || user.full_name || "Patient");
      } catch (error) {
        console.error("Failed to parse user data:", error);
      }
    }
  }, []);

  const initials = patientName
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join("");

  const handleLogoutConfirm = () => {
    localStorage.clear(); // optional but recommended
    navigate("/login");
  };

  return (
    <>
      <nav className={styles.navbar}>
        {/* ===== LEFT ===== */}
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

        {/* ===== RIGHT ===== */}
        <div className={styles.right}>
          <img src={bellIcon} alt="notifications" className={styles.bell} />

          <Link to="/patient/profile">
            <div className={styles.profile}>
              <div className={styles.initials}>{initials}</div>
            </div>
          </Link>

          {/* 🚪 LOGOUT */}
          <img
            src={logoutIcon}
            alt="logout"
            className={styles.logoutIcon}
            onClick={() => setShowLogout(true)}
          />
        </div>
      </nav>

      {/* 🔔 LOGOUT CONFIRM MODAL */}
      {showLogout && (
        <LogoutConfirmModal
          onCancel={() => setShowLogout(false)}
          onConfirm={handleLogoutConfirm}
        />
      )}
    </>
  );
}
