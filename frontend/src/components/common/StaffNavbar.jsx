import React, { useState, useEffect } from "react";
import styles from "./StaffNavbar.module.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import menuIcon from "../../assets/icons/menu.png";
import bellIcon from "../../assets/icons/bell.png";
import logoutIcon from "../../assets/icons/logout.png";
import logo from "../../assets/logos/medical-logo.png";
import LogoutConfirmModal from "./LogoutConfirmModal";

export default function StaffNavbar({ onMenuToggle, unreadCount }) {
  const location = useLocation();
  const navigate = useNavigate();
  const isNotificationsPage = location.pathname === "/staff/notifications";

  const [staffName, setStaffName] = useState("Staff Member");
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const user = JSON.parse(userData);
        const fullName = `${user.first_name || ""} ${user.last_name || ""}`.trim();
        setStaffName(fullName || user.email || "Staff Member");
      } catch (error) {
        console.error("Failed to parse user data:", error);
      }
    }
  }, []);

  const initials = staffName
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join("");

  const handleLogoutConfirm = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <>
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
          {/* 🔔 Notifications */}
          <Link to="/staff/notifications" className={styles.bellWrapper}>
            <img
              src={bellIcon}
              alt="Notifications"
              className={`${styles.bell} ${
                isNotificationsPage ? styles.activeBell : ""
              }`}
            />
            {unreadCount > 0 && (
              <span className={styles.badge}>
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>

          {/* 👤 Profile */}
          <Link to="/staff/profile">
            <div className={styles.profile}>
              <div className={styles.initials}>{initials}</div>
            </div>
          </Link>

          {/* 🚪 Logout */}
          <img
            src={logoutIcon}
            alt="Logout"
            className={styles.logoutIcon}
            onClick={() => setShowLogoutModal(true)}
          />
        </div>
      </nav>

      {/* 🔔 Logout Confirmation Modal */}
      {showLogoutModal && (
        <LogoutConfirmModal
          onCancel={() => setShowLogoutModal(false)}
          onConfirm={handleLogoutConfirm}
        />
      )}
    </>
  );
}
