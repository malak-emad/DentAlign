import React, { useState } from "react";
import { Link } from "react-router-dom";
import styles from "./AdminNotifications.module.css";

/* ===== MOCK DATA ===== */
const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    type: "doctor_request",
    title: "New Doctor Registration",
    message: "Dr. Ahmed Hassan requested to join",
    relatedId: 5,
    isRead: false,
    createdAt: "2025-12-20 18:30",
  },
  {
    id: 2,
    type: "nurse_request",
    title: "New Nurse Registration",
    message: "Mona Ali requested to join",
    relatedId: 7,
    isRead: false,
    createdAt: "2025-12-20 17:45",
  },
  {
    id: 3,
    type: "invoice_pending",
    title: "Invoice Pending Approval",
    message: "Invoice #245 requires approval",
    relatedId: 245,
    isRead: true,
    createdAt: "2025-12-19 14:10",
  },
];

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [filter, setFilter] = useState("all");

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      )
    );
  };

  const filtered =
    filter === "unread"
      ? notifications.filter((n) => !n.isRead)
      : notifications;

  const getLink = (n) => {
    if (n.type.includes("doctor") || n.type.includes("nurse")) {
      return "/admin/approvals";
    }
    if (n.type === "invoice_pending") {
      return "/admin/invoices";
    }
    return "#";
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Notifications</h1>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All</option>
          <option value="unread">Unread</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className={styles.empty}>No notifications</div>
      ) : (
        <div className={styles.list}>
          {filtered.map((n) => (
            <Link
              to={getLink(n)}
              key={n.id}
              className={`${styles.item} ${
                !n.isRead ? styles.unread : ""
              }`}
              onClick={() => markAsRead(n.id)}
            >
              <div>
                <strong>{n.title}</strong>
                <p>{n.message}</p>
                <span className={styles.time}>{n.createdAt}</span>
              </div>

              {!n.isRead && <span className={styles.dot} />}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
