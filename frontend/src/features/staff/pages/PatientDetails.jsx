import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import styles from "./PatientDetails.module.css";

export default function PatientProfile() {
  const { id } = useParams();
  const [tab, setTab] = useState("info");

  const patient = {
    id,
    name: "John Doe",
    age: 27,
    image: "/images/p1.jpg",
    history: "No chronic diseases. Non-smoker. No allergies."
  };

  return (
    <div className={styles.container}>
      
      {/* Top Patient Banner */}
      <div className={styles.header}>
        <Link to="/staff/patients" className={styles.backBtn}>← Back</Link>

        <img src={patient.image} className={styles.image} />

        <div className={styles.info}>
          <h2>{patient.name}</h2>
          <p>Age: {patient.age}</p>
          <p>ID: #{patient.id}</p>
          <p className={styles.history}>{patient.history}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button onClick={() => setTab("info")} className={tab === "info" ? styles.active : ""}>Medical Info</button>
        <button onClick={() => setTab("pres")} className={tab === "pres" ? styles.active : ""}>Prescriptions</button>
        <button onClick={() => setTab("apps")} className={tab === "apps" ? styles.active : ""}>Appointments</button>
        <button onClick={() => setTab("radio")} className={tab === "radio" ? styles.active : ""}>Radiology Images</button>
      </div>

      {/* Content */}
      <div className={styles.content}>
        {tab === "info" && <div><h3>Medical Info</h3><p>...</p></div>}
        {tab === "pres" && <div><h3>Prescriptions</h3><p>...</p></div>}
        {tab === "apps" && <div><h3>Appointments</h3><p>...</p></div>}
        {tab === "radio" && <div><h3>Radiology</h3><p>...</p></div>}
      </div>
    </div>
  );
}
