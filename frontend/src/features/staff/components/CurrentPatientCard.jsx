import React from "react";
import styles from "./CurrentPatientCard.module.css";

export default function CurrentPatientCard({ patient, onEndVisit }) {
  return (
    <div className={styles.card}>
      <h3>Current Patient</h3>
      <p><strong>Name:</strong> {patient.name}</p>
      <p><strong>Started at:</strong> {patient.time}</p>

      <button className={styles.endBtn} onClick={onEndVisit}>
        End Visit
      </button>
    </div>
  );
}
