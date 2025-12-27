import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { adminApi } from "../api/adminApi";
import styles from "./AdminPatientDetails.module.css";

export default function AdminPatientDetails() {
  const { id } = useParams();
  const [tab, setTab] = useState("overview");
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPatientDetails = async () => {
      try {
        setLoading(true);
        const data = await adminApi.getPatientDetails(id);
        setPatient(data);
        setError('');
      } catch (err) {
        console.error('Error fetching patient details:', err);
        setError('Failed to load patient details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPatientDetails();
    }
  }, [id]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading patient details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>{error}</div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>Patient not found</div>
      </div>
    );
  }

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
            Registered: {patient.registered_at || patient.date_joined}
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
          Appointments ({patient.appointments?.length || 0})
        </button>
        <button
          className={tab === "billing" ? styles.active : ""}
          onClick={() => setTab("billing")}
        >
          Billing ({patient.invoices?.length || 0})
        </button>
      </div>

      {/* Content */}
      <div className={styles.content}>
        {tab === "overview" && (
          <div className={styles.overview}>
            <div className={styles.stat}>
              <span>Total Appointments</span>
              <strong>{patient.appointments?.length || 0}</strong>
            </div>
            <div className={styles.stat}>
              <span>Total Invoices</span>
              <strong>{patient.invoices?.length || 0}</strong>
            </div>
            <div className={styles.stat}>
              <span>Outstanding Balance</span>
              <strong>
                $
                {patient.invoices
                  ?.filter((i) => 
                    i.status && 
                    i.status.toLowerCase() !== "paid" && 
                    !i.is_cancelled_appointment  // Exclude invoices for cancelled appointments
                  )
                  .reduce((a, b) => a + (parseFloat(b.amount || b.total_amount) || 0), 0) || 0}
              </strong>
            </div>
          </div>
        )}

        {tab === "appointments" && (
          <div className={styles.list}>
            {patient.appointments?.length > 0 ? (
              patient.appointments.map((a, idx) => (
                <div key={idx} className={styles.card}>
                  <div>
                    <strong>{a.date}</strong> — {a.time || a.appointment_time}
                  </div>
                  <p>{a.treatment || a.service}</p>
                  <p>Doctor: {a.doctor || a.staff_name}</p>
                  <span className={`${styles.status} ${styles[a.status?.toLowerCase()]}`}>
                    {a.status}
                  </span>
                </div>
              ))
            ) : (
              <div className={styles.noData}>No appointments found</div>
            )}
          </div>
        )}

        {tab === "billing" && (
          <div className={styles.list}>
            {patient.invoices?.length > 0 ? (
              patient.invoices.map((inv) => (
                <div key={inv.id} className={styles.card}>
                  <strong>INV-{inv.id}</strong>
                  <p>Date: {inv.date}</p>
                  <p>Amount: ${inv.amount || inv.total_amount}</p>
                  <span
                    className={`${styles.status} ${styles[inv.status?.toLowerCase().replace(' ', '_')]}`}
                  >
                    {inv.status}
                  </span>
                </div>
              ))
            ) : (
              <div className={styles.noData}>No invoices found</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
