import React from "react";
import styles from "./AppointmentStatusBadge.module.css";

export default function AppointmentStatusBadge({ status }) {
  return (
    <span className={`${styles.badge} ${styles[status]}`}>
      {status}
    </span>
  );
}
