import React, { useState } from "react";
import StaffNavbar from "./StaffNavbar";
import Sidebar from "./Sidebar";
import StaffHeader from "./StaffHeader";
import styles from "./StaffLayout.module.css";

export default function StaffLayout({ children }) {
  const [open, setOpen] = useState(false);

  // 🔔 SINGLE SOURCE OF TRUTH
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "appointment",
      title: "New Appointment Scheduled",
      message: "Ahmed Salah booked an appointment for Tomorrow at 3:00 PM.",
      time: "10 min ago",
      read: false,
    },
    {
      id: 2,
      type: "patient",
      title: "Patient Record Updated",
      message: "Medical history updated for Sara Mohamed.",
      time: "1 hour ago",
      read: false,
    },
    {
      id: 3,
      type: "alert",
      title: "Missed Appointment",
      message: "Mohamed Ali missed today’s appointment.",
      time: "Yesterday",
      read: true,
    },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className={styles.wrapper}>
      <StaffNavbar
        onMenuToggle={() => setOpen(!open)}
        unreadCount={unreadCount}
      />

      <Sidebar open={open} onClose={() => setOpen(false)} />
      <StaffHeader />

      {/* 👇 Inject notifications into pages */}
      <main className={styles.content}>
        {React.cloneElement(children, {
          notifications,
          setNotifications,
        })}
      </main>
    </div>
  );
}
