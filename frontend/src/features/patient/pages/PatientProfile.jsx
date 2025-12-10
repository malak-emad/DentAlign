import React from "react";
import styles from "./PatientProfile.module.css";

export default function PatientProfile() {
  const patient = {
    name: "Sarah Mohamed",
    email: "sarah.mohamed@example.com",
    phone: "+201 555 777 999",
    gender: "Female",
    birthdate: "1999‑06‑14",
    bloodType: "A+",
    image: "/assets/patients/default-female.jpg",
  };

  return (
    <div className={styles.container}>
      
      {/* ------ HEADER CARD ------ */}
      <div className={styles.header}>
        <img 
          src={patient.image} 
          alt="Patient" 
          className={styles.photo}
        />

        <div className={styles.info}>
          <h2>{patient.name}</h2>
          <p className={styles.role}>Patient</p>
        </div>

        {/* EDIT BUTTON */}
        <button className={styles.editBtn}>
          Edit Profile
        </button>
      </div>

      {/* ------ DETAILS CARDS ------ */}
      <div className={styles.cards}>

        <div className={styles.card}>
          <h3>Contact Information</h3>
          <p><strong>Email:</strong> {patient.email}</p>
          <p><strong>Phone:</strong> {patient.phone}</p>
        </div>

        <div className={styles.card}>
          <h3>Personal Details</h3>
          <p><strong>Gender:</strong> {patient.gender}</p>
          <p><strong>Birthdate:</strong> {patient.birthdate}</p>
          <p><strong>Blood Type:</strong> {patient.bloodType}</p>
        </div>

      </div>
    </div>
  );
}
