import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import styles from "./AdminPatientDetails.module.css";

const MOCK_PATIENT = {
  id: 1,
  full_name: "John Doe",
  email: "john.doe@email.com",
  phone: "+1 234 567 890",
  age: 32,
  registered_at: "2023-05-14",

  appointments: [
    {
      date: "2025-12-21",
      time: "10:30 AM",
      doctor: "Dr. Ahmed Hassan",
      service: "Dental Cleaning",
      status: "completed",
    },
    {
      date: "2025-12-28",
      time: "01:00 PM",
      doctor: "Dr. Mona Ali",
      service: "Consultation",
      status: "scheduled",
    },
  ],

  invoices: [
    {
      id: "INV-001",
      date: "2025-12-21",
      amount: 120,
      status: "paid",
    },
    {
      id: "INV-002",
      date: "2025-12-28",
      amount: 80,
      status: "pending",
    },
  ],
};

export default function AdminPatientDetails() {
  const { id } = useParams();
  const [tab, setTab] = useState("overview");

  const patient = MOCK_PATIENT;

  return (
    <div className={styles.container}>
      <Link to="/admin/patients" className={styles.back}>← Back to Patients</Link>

      {/* Header */}
      <div className={styles.header}>
        <div className={styles.avatar}>
          {patient.full_name
            .split(" ")
            .map((n) => n[0])
            .join("")}
        </div>

        <div className={styles.info}>
          <h2>{patient.full_name}</h2>
          <p>Email: {patient.email}</p>
          <p>Phone: {patient.phone}</p>
          <p>Age: {patient.age}</p>
          <p className={styles.registered}>
            Registered: {patient.registered_at}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={tab === "overview" ? styles.active : ""}
          onClick={() => setTab("overview")}
        >
          Overview
        </button>
        <button
          className={tab === "appointments" ? styles.active : ""}
          onClick={() => setTab("appointments")}
        >
          Appointments ({patient.appointments.length})
        </button>
        <button
          className={tab === "billing" ? styles.active : ""}
          onClick={() => setTab("billing")}
        >
          Billing ({patient.invoices.length})
        </button>
      </div>

      {/* Content */}
      <div className={styles.content}>
        {tab === "overview" && (
          <div className={styles.overview}>
            <div className={styles.stat}>
              <span>Total Appointments</span>
              <strong>{patient.appointments.length}</strong>
            </div>
            <div className={styles.stat}>
              <span>Total Invoices</span>
              <strong>{patient.invoices.length}</strong>
            </div>
            <div className={styles.stat}>
              <span>Outstanding Balance</span>
              <strong>
                $
                {patient.invoices
                  .filter((i) => i.status !== "paid")
                  .reduce((a, b) => a + b.amount, 0)}
              </strong>
            </div>
          </div>
        )}

        {tab === "appointments" && (
          <div className={styles.list}>
            {patient.appointments.map((a, idx) => (
              <div key={idx} className={styles.card}>
                <div>
                  <strong>{a.date}</strong> — {a.time}
                </div>
                <p>{a.service}</p>
                <p>Doctor: {a.doctor}</p>
                <span className={`${styles.status} ${styles[a.status]}`}>
                  {a.status}
                </span>
              </div>
            ))}
          </div>
        )}

        {tab === "billing" && (
          <div className={styles.list}>
            {patient.invoices.map((inv) => (
              <div key={inv.id} className={styles.card}>
                <strong>{inv.id}</strong>
                <p>Date: {inv.date}</p>
                <p>Amount: ${inv.amount}</p>
                <span
                  className={`${styles.status} ${styles[inv.status]}`}
                >
                  {inv.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
