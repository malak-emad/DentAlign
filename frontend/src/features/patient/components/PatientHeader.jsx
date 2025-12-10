import React, { useState, useEffect } from "react";
import styles from "./PatientHeader.module.css";

export default function PatientHeader() {
  const [patientName, setPatientName] = useState("Patient");

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setPatientName(user.username || user.full_name || "Patient");
      } catch (error) {
        console.error('Failed to parse user data:', error);
      }
    }
  }, []);

  return (
    <div className={styles.header}>
      <h2 className={styles.text}>Welcome, {patientName}</h2>
    </div>
  );
}
