import React, { useState } from "react";
import AdminNavbar from "./AdminNavbar";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import styles from "./AdminLayout.module.css";

export default function AdminLayout({ children }) {
  const [open, setOpen] = useState(false);

  // 🔔 SINGLE SOURCE OF TRUTH (same idea as staff)
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "doctor",
      title: "Doctor Registration Request",
      message: "Dr. Ahmed Hassan requested to register.",
      time: "5 min ago",
      read: false,
    },
    {
      id: 2,
      type: "nurse",
      title: "Nurse Registration Request",
      message: "Sara Mohamed requested to register as nurse.",
      time: "1 hour ago",
      read: false,
    },
    {
      id: 3,
      type: "doctor",
      title: "Doctor Registration Request",
      message: "Dr. Karim Ali requested to join.",
      time: "Yesterday",
      read: true,
    },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className={styles.wrapper}>
      <AdminNavbar
        onMenuToggle={() => setOpen(!open)}
        unreadCount={unreadCount}
      />

      <AdminSidebar open={open} onClose={() => setOpen(false)} />
      <AdminHeader />

      <main className={styles.content}>
        {React.cloneElement(children, {
          notifications,
          setNotifications,
        })}
      </main>
    </div>
  );
}
