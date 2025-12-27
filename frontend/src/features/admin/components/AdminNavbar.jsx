import React, { useState, useEffect } from "react";
import styles from "./AdminNavbar.module.css";
import menuIcon from "../../../assets/icons/menu.png";
import bellIcon from "../../../assets/icons/bell.png";
import logoutIcon from "../../../assets/icons/logout.png";
import logo from "../../../assets/logos/medical-logo.png";
import { Link, useLocation, useNavigate } from "react-router-dom";
import LogoutConfirmModal from "../../../components/common/LogoutConfirmModal";

export default function AdminNavbar({ onMenuToggle, unreadCount }) {
  const [adminName, setAdminName] = useState("Admin");
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const isNotificationsPage = location.pathname === "/admin/notifications";

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setAdminName(user.username || user.full_name || "Admin");
      } catch {}
    }
  }, []);

  const initials = adminName
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join("");

  const handleLogoutConfirm = () => {
    localStorage.clear(); // optional
    navigate("/login");
  };

  return (
    <>
      <nav className={styles.navbar}>
        {/* LEFT */}
        <div className={styles.left}>
          <img src={menuIcon} alt="menu" className={styles.menuIcon} onClick={onMenuToggle} />
          <img src={logo} alt="Clinic Logo" className={styles.logo} />
          <span className={styles.brand}>DentAlign</span>
        </div>

        {/* RIGHT */}
        <div className={styles.right}>
          <Link to="/admin/notifications" className={styles.bellWrapper}>
            <img
              src={bellIcon}
              alt="notifications"
              className={`${styles.bell} ${isNotificationsPage ? styles.activeBell : ""}`}
            />
            {unreadCount > 0 && (
              <span className={styles.badge}>
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>

          <Link to="/admin/profile">
            <div className={styles.profile}>
              <div className={styles.initials}>{initials}</div>
            </div>
          </Link>

          {/* 🚪 LOGOUT (no Link!) */}
          <img
            src={logoutIcon}
            alt="logout"
            className={styles.logoutIcon}
            onClick={() => setShowLogoutModal(true)}
            style={{ cursor: "pointer" }}
          />
        </div>
      </nav>

      {/* 🔥 LOGOUT POPUP */}
      {showLogoutModal && (
        <LogoutConfirmModal
          onCancel={() => setShowLogoutModal(false)}
          onConfirm={handleLogoutConfirm}
        />
      )}
    </>
  );
}
