import React, { useState } from "react";
import styles from "./PatientPrescriptions.module.css";

export default function PatientPrescriptions() {
  const prescriptions = [
    {
      id: 1,
      doctor: "Dr. Sarah Ahmed",
      date: "2026-01-15",
      diagnosis: "Acute Sinus Infection",
      medications: [
        { name: "Amoxicillin 500mg", freq: "2× daily", duration: "7 days" },
        { name: "Ibuprofen 400mg", freq: "3× daily", duration: "5 days" },
      ],
    },
    {
      id: 2,
      doctor: "Dr. Omar Khaled",
      date: "2025-12-02",
      diagnosis: "Seasonal Allergies",
      medications: [
        { name: "Cetirizine 10mg", freq: "1× daily", duration: "14 days" },
      ],
    },
  ];

  // ---------- FILTER STATE ----------
  const [doctorFilter, setDoctorFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");

  const filteredPrescriptions = prescriptions
    .filter((p) => (doctorFilter ? p.doctor === doctorFilter : true))
    .sort((a, b) =>
      sortOrder === "desc"
        ? new Date(b.date) - new Date(a.date)
        : new Date(a.date) - new Date(b.date)
    );

  const uniqueDoctors = [...new Set(prescriptions.map((p) => p.doctor))];

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Prescriptions</h1>

      {/* ---------- FILTERS ---------- */}
      <div className={styles.filters}>
        <select
          className={styles.select}
          value={doctorFilter}
          onChange={(e) => setDoctorFilter(e.target.value)}
        >
          <option value="">All Doctors</option>
          {uniqueDoctors.map((doc) => (
            <option key={doc} value={doc}>{doc}</option>
          ))}
        </select>

        <select
          className={styles.select}
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
        >
          <option value="desc">Newest First</option>
          <option value="asc">Oldest First</option>
        </select>
      </div>

      {/* ---------- PRESCRIPTION CARDS ---------- */}
      <div className={styles.grid}>
        {filteredPrescriptions.map((p) => (
          <div key={p.id} className={styles.card}>
            {/* Header */}
            <div className={styles.cardHeader}>
              <h3 className={styles.doctor}>{p.doctor}</h3>
              <span className={styles.date}>
                {new Date(p.date).toLocaleDateString()}
              </span>
            </div>

            {/* Diagnosis */}
            <p className={styles.diagnosis}>
              <strong>Diagnosis:</strong> {p.diagnosis}
            </p>

            {/* Medications */}
            <div className={styles.medSection}>
              <h4 className={styles.medTitle}>Medications</h4>
              <div className={styles.medList}>
                {p.medications.map((m, index) => (
                  <div key={index} className={styles.medItem}>
                    <strong>{m.name}</strong>
                    <span>{m.freq} — {m.duration}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Button */}
            <button className={styles.btn}>View / Download</button>
          </div>
        ))}
      </div>
    </div>
  );
}
