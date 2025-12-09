import React from "react";
import styles from "./StaffHeader.module.css";

// Later the name will come from context (AuthContext)
export default function StaffHeader() {
  const staffName = "Dr. Ahmed Aly";

  return (
    <div className={styles.header}>
      <h2 className={styles.text}>Welcome, {staffName}</h2>
    </div>
  );
}
