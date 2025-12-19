import React from "react";
import styles from "./StaffNotifications.module.css";

export default function StaffNotifications({
  notifications,
  setNotifications,
}) {
  const markOneAsRead = (id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    );
  };

  return (
    <div className={styles.notificationsPage}>
      <div className={styles.header}>
        <h2>Notifications</h2>

        {notifications.some(n => !n.read) && (
          <button className={styles.clearBtn} onClick={markAllAsRead}>
            Mark all as read
          </button>
        )}
      </div>

      {notifications.length > 0 ? (
        <div className={styles.list}>
          {notifications.map(item => (
            <div
              key={item.id}
              className={`${styles.notificationCard} ${!item.read ? styles.unread : ""}`}
              onClick={() => markOneAsRead(item.id)}
            >
              <div className={styles.icon}>
                {item.type === "appointment" && "📅"}
                {item.type === "patient" && "👤"}
                {item.type === "alert" && "⚠️"}
              </div>

              <div className={styles.content}>
                <h4>{item.title}</h4>
                <p>{item.message}</p>
                <span className={styles.time}>{item.time}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>🔔 You have no notifications</div>
      )}
    </div>
  );
}
