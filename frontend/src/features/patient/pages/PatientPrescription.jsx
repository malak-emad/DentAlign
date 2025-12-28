import React, { useState, useEffect } from "react";
import styles from "./PatientPrescriptions.module.css";
import { patientApi } from "../api/patientApi";

export default function PatientPrescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        setLoading(true);
        const response = await patientApi.getTreatments();
        setPrescriptions(response.prescriptions || []);
      } catch (err) {
        console.error('Failed to fetch prescriptions:', err);
        setError('Failed to load prescriptions');
      } finally {
        setLoading(false);
      }
    };

    fetchPrescriptions();
  }, []);

  // ---------- FILTER STATE ----------
  const [doctorFilter, setDoctorFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");

  const filteredPrescriptions = prescriptions
    .filter((p) => (doctorFilter ? p.doctor === doctorFilter : true))
    .sort((a, b) =>
      sortOrder === "desc"
        ? new Date(b.date || b.record_date) - new Date(a.date || a.record_date)
        : new Date(a.date || a.record_date) - new Date(b.date || b.record_date)
    );

  const uniqueDoctors = [...new Set(prescriptions.map((p) => p.doctor))];

  if (loading) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Prescriptions</h1>
        <div className={styles.loading}>Loading prescriptions...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Prescriptions</h1>
        <div className={styles.error}>{error}</div>
      </div>
    );
  }

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
                {p.date ? new Date(p.date).toLocaleDateString() : 'Date not available'}
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
                {p.medications && p.medications.length > 0 ? (
                  p.medications.map((medication, index) => (
                    <div key={index} className={styles.medItem}>
                      <strong>{medication}</strong>
                    </div>
                  ))
                ) : (
                  <div className={styles.medItem}>
                    <em>No medications prescribed</em>
                  </div>
                )}
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
