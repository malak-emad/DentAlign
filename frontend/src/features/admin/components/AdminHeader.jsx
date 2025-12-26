import React from "react";
import styles from "./AdminHeader.module.css";

// Later the name will come from context (AuthContext)
export default function AdminHeader() {
  const adminName = "Admin";
  return (
    <div className={styles.header}>
      <h2 className={styles.text}>Welcome, {adminName}</h2>
    </div>
  );
}
