import React from "react";
import styles from "./StaffPatients.module.css";
import { Link } from "react-router-dom";

export default function PatientsPage() {
  const patients = [
    {
      id: 1,
      name: "John Doe",
      age: 27,
      image: "/images/p1.jpg"
    },
    {
      id: 2,
      name: "Sarah Ali",
      age: 34,
      image: "/images/p2.jpg"
    }
  ];

  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>Patients</h1>

      <div className={styles.grid}>
        {patients.map((p) => (
          <Link
            to={`/staff/patient/${p.id}`}
            key={p.id}
            className={styles.card}
          >
            <img src={p.image} className={styles.image} />
            <h3>{p.name}</h3>
            <p>Age: {p.age}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
