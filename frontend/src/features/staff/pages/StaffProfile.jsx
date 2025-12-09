import React from "react";
import styles from "./StaffProfile.module.css";

export default function DoctorProfile() {
  const doctor = {
    name: "Dr. Ahmed ALy",
    specialty: "Orthodontist",
    email: "Ahmed.aly@example.com",
    phone: "+201 234 567 890",
    experience: "12+ years",
    image: "/assets/doctors/dr-ahmed.jpg",
  };

  return (
    <div className={styles.container}>

      {/* Header */}
      <div className={styles.header}>
        <img src={doctor.image} className={styles.photo} alt="Doctor" />

        <div className={styles.info}>
          <h2>{doctor.name}</h2>
          <p className={styles.role}>{doctor.specialty}</p>
        </div>
      </div>

      {/* Content Cards */}
      <div className={styles.cards}>
        <div className={styles.card}>
          <h3>Contact Information</h3>
          <p><strong>Email:</strong> {doctor.email}</p>
          <p><strong>Phone:</strong> {doctor.phone}</p>
        </div>

        <div className={styles.card}>
          <h3>Experience</h3>
          <p><strong>Years:</strong> {doctor.experience}</p>
        </div>
      </div>
    </div>
  );
}
