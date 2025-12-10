import React from "react";
import styles from "./PatientDashboard.module.css";

export default function PatientDashboard() {
  return (
    <div className={styles.container}>

      {/* PAGE TITLE */}
      <h1 className={styles.pageTitle}>Dashboard</h1>

      {/* GRID CARDS */}
      <div className={styles.grid}>

        {/* NEXT APPOINTMENT */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Next Appointment</h3>

          <div className={styles.details}>
            <p><strong>Doctor:</strong> Dr. Sarah Ahmed</p>
            <p><strong>Date:</strong> Jan 12, 2026</p>
            <p><strong>Time:</strong> 11:00 AM</p>
          </div>

          <button className={styles.secondaryBtn}>Reschedule</button>
        </div>

        {/* PENDING BILLS */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Pending Bills</h3>

          <p className={styles.highlightNumber}>2 Outstanding</p>

          <button className={styles.primaryBtn}>Pay Now</button>
        </div>

        {/* PRESCRIPTION */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Latest Prescription</h3>

          <ul className={styles.list}>
            <li>Paracetamol 500mg</li>
            <li>Cefdinir 300mg</li>
          </ul>

          <button className={styles.secondaryBtn}>View All</button>
        </div>

        {/* RADIOLOGY RESULTS */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Recent Radiology Result</h3>

          <p className={styles.normalText}>Chest X‑Ray — Normal</p>

          <button className={styles.secondaryBtn}>View Images</button>
        </div>

      </div>

      {/* QUICK ACTIONS */}
      <div className={styles.quickActions}>
        <button className={styles.quickBtn}>Book Appointment</button>
        <button className={styles.quickBtn}>My Records</button>
        <button className={styles.quickBtn}>Bills</button>
        <button className={styles.quickBtn}>Prescriptions</button>
      </div>
    </div>
  );
}
