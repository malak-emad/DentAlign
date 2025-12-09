import React, { useState } from "react";
import styles from "./StaffAppointments.module.css";

export default function Appointments() {
  const [filter, setFilter] = useState("today");

  const appointments = [
    {
      id: 1,
      name: "Sara Ali",
      age: 32,
      time: "10:30 AM",
      type: "Check-up",
      img: "/patients/p1.jpg",
    },
    {
      id: 2,
      name: "Omar Hassan",
      age: 27,
      time: "12:00 PM",
      type: "Cleaning",
      img: "/patients/p2.jpg",
    },
  ];

  return (
    <div className={styles.container}>
      
      {/* --- Filters --- */}
      <div className={styles.filters}>
        <button 
          className={filter === "today" ? styles.active : ""} 
          onClick={() => setFilter("today")}
        >
          Today
        </button>

        <button 
          className={filter === "week" ? styles.active : ""} 
          onClick={() => setFilter("week")}
        >
          This Week
        </button>

        <button 
          className={filter === "month" ? styles.active : ""} 
          onClick={() => setFilter("month")}
        >
          This Month
        </button>
      </div>

      {/* --- List of Appointments --- */}
      <div className={styles.list}>
        {appointments.map((a) => (
          <div key={a.id} className={styles.card}>
            <img src={a.img} className={styles.photo} alt="patient" />

            <div className={styles.info}>
              <h3>{a.name}</h3>
              <p>Age: {a.age}</p>
              <p>Time: {a.time}</p>
              <p>Type: {a.type}</p>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
