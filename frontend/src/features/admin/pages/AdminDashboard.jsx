import React from "react";
import styles from "./AdminDashboard.module.css";

export default function AdminDashboard() {
  return (
    <div className={styles.container}>
      
      {/* ===== Page Header ===== */}
      <div className={styles.header}>
        <h1 className={styles.title}>Admin Dashboard</h1>
        <p className={styles.subtitle}>
          Overview of system activity and performance
        </p>
      </div>

      {/* ===== Stats Cards ===== */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Total Patients</p>
          <h2 className={styles.statValue}>1,248</h2>
        </div>

        <div className={styles.statCard}>
          <p className={styles.statLabel}>Staff Members</p>
          <h2 className={styles.statValue}>42</h2>
        </div>

        <div className={styles.statCard}>
          <p className={styles.statLabel}>Today’s Appointments</p>
          <h2 className={styles.statValue}>36</h2>
        </div>

        <div className={styles.statCard}>
          <p className={styles.statLabel}>Monthly Revenue</p>
          <h2 className={styles.statValue}>$18,400</h2>
        </div>
      </div>

      {/* ===== Main Content Grid ===== */}
      <div className={styles.mainGrid}>
        
        {/* Recent Appointments */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h3>Recent Appointments</h3>
          </div>

          <ul className={styles.list}>
            <li className={styles.listItem}>
              <span>John Doe</span>
              <span className={styles.muted}>10:30 AM</span>
            </li>
            <li className={styles.listItem}>
              <span>Sarah Ahmed</span>
              <span className={styles.muted}>11:15 AM</span>
            </li>
            <li className={styles.listItem}>
              <span>Michael Smith</span>
              <span className={styles.muted}>12:00 PM</span>
            </li>
          </ul>
        </div>

        {/* System Overview */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h3>System Overview</h3>
          </div>

          <div className={styles.systemStats}>
            <div>
              <p className={styles.statSmall}>Active Services</p>
              <h4>12</h4>
            </div>
            <div>
              <p className={styles.statSmall}>Pending Reports</p>
              <h4>5</h4>
            </div>
            <div>
              <p className={styles.statSmall}>System Status</p>
              <h4 className={styles.success}>Operational</h4>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
