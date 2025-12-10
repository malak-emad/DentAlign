import React from "react";
import styles from "./PatientHeader.module.css";

export default function PatientHeader() {
  const patientName = "Sarah Mohamed";

  return (
    <div className={styles.header}>
      <h2 className={styles.text}>Welcome, {patientName}</h2>
    </div>
  );
}
