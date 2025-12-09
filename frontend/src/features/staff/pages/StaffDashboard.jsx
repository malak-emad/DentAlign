import React from "react";
import styles from "./StaffDashboard.module.css";

export default function StaffDashboard() {
  console.log("Staff Reports page loaded"); 

  return (
    <div className={styles.container}>
      {/* STAT CARDS */}
      <div className={styles.cards}>
        <div className={styles.card}>
          <h2>12</h2>
          <p>Appointments Today</p>
        </div>

        <div className={styles.card}>
          <h2>58</h2>
          <p>Total Patients</p>
        </div>

        <div className={styles.card}>
          <h2>4</h2>
          <p>Pending Reports</p>
        </div>
      </div>

      <div className={styles.bottom}>
        {/* CALENDAR */}
        <div className={styles.calendar}>
          <h3>Calendar</h3>
          <input type="date" className={styles.datePicker} />
        </div>

        {/* TODAY APPOINTMENTS */}
        <div className={styles.todayList}>
          <h3>Today’s Appointments</h3>

          <div className={styles.appCard}>
            <strong>Sarah Ahmed</strong>
            <span>11:00 AM</span>
          </div>

          <div className={styles.appCard}>
            <strong>Mohamed Ali</strong>
            <span>12:30 PM</span>
          </div>
        </div>
      </div>
    </div>
  );
}
