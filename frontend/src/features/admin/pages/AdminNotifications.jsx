import React from "react";
import styles from "./AdminNotifications.module.css";

export default function AdminNotifications({
  notifications,
  setNotifications,
}) {
  const markOneAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const dismissNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div className={styles.notificationsPage}>
      {/* HEADER */}
      <div className={styles.header}>
        <h2>Admin Notifications</h2>
        {notifications.some((n) => !n.read) && (
          <button className={styles.clearBtn} onClick={markAllAsRead}>
            Mark all as read
          </button>
        )}
      </div>

      {/* LIST */}
      {notifications.length > 0 ? (
        <div className={styles.list}>
          {notifications.map((item) => (
            <div
              key={item.id}
              className={`${styles.notificationCard} ${
                !item.read ? styles.unread : ""
              }`}
              onClick={() => markOneAsRead(item.id)}
            >
              <div className={styles.icon}>
                {item.type === "doctor" && "🩺"}
                {item.type === "nurse" && "🧑‍⚕️"}
              </div>

              <div className={styles.content}>
                <h4>{item.title}</h4>
                <p>{item.message}</p>
                <span className={styles.time}>{item.time}</span>
              </div>

              <div className={styles.actions}>
                <button
                  className={styles.approve}
                  onClick={(e) => {
                    e.stopPropagation();
                    markOneAsRead(item.id);
                  }}
                >
                  Review
                </button>

                <button
                  className={styles.reject}
                  onClick={(e) => {
                    e.stopPropagation();
                    dismissNotification(item.id);
                  }}
                >
                  Dismiss
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          🔔 No registration requests at the moment
        </div>
      )}
    </div>
  );
}
