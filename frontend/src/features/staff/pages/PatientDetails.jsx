import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { staffApi } from "../api/staffApi";
import MedicalHistoryModal from "../components/MedicalHistoryModal";
import styles from "./PatientDetails.module.css";

export default function PatientProfile() {
  const { id } = useParams();
  const [tab, setTab] = useState("info");
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMedicalHistory, setShowMedicalHistory] = useState(false);

  useEffect(() => {
    const fetchPatientDetails = async () => {
      try {
        setLoading(true);
        const data = await staffApi.getPatientDetails(id);
        setPatient(data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch patient details:", err);
        setError("Failed to load patient details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchPatientDetails();
  }, [id]);

  const handleShowMedicalHistory = () => {
    setShowMedicalHistory(true);
  };

  const handleCloseMedicalHistory = () => {
    setShowMedicalHistory(false);
  };

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
        <div className={styles.error}>
          <p>{error}</p>
          <Link to="/staff/patients" className={styles.backBtn}>
            ← Back to Patients
          </Link>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <p>Patient not found</p>
          <Link to="/staff/patients" className={styles.backBtn}>
            ← Back to Patients
          </Link>
        </div>
      </div>
    );
  }

  const calculateAge = (dob) => {
    if (!dob) return "N/A";
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  return (
    <div className={styles.container}>
      {/* ================= HEADER ================= */}
      <div className={styles.header}>
        <Link to="/staff/patients" className={styles.backBtn}>←</Link>

        <div className={styles.avatar}>
          {(patient.first_name && patient.last_name)
            ? `${patient.first_name[0]}${patient.last_name[0]}`
            : patient.email[0].toUpperCase()}
        </div>

        <div className={styles.info}>
          <h2>
            {patient.first_name && patient.last_name
              ? `${patient.first_name} ${patient.last_name}`
              : patient.email}
          </h2>
          <p>Age: {calculateAge(patient.dob)}</p>
          <p>Email: {patient.email}</p>
          <p>Phone: {patient.phone || "N/A"}</p>
        </div>
      </div>

      {/* ================= TABS ================= */}
      <div className={styles.tabs}>
        <button onClick={() => setTab("info")} className={tab === "info" ? styles.active : ""}>
          Medical Info
        </button>
        <button onClick={() => setTab("history")} className={tab === "history" ? styles.active : ""}>
          Medical History
        </button>
        <button onClick={() => setTab("apps")} className={tab === "apps" ? styles.active : ""}>
          Appointments ({patient.appointments?.length || 0})
        </button>
        <button onClick={() => setTab("treatments")} className={tab === "treatments" ? styles.active : ""}>
          Treatments ({patient.treatments?.length || 0})
        </button>
      </div>

      {/* ================= CONTENT ================= */}
      <div className={styles.content}>
        {/* Medical Info */}
        {tab === "info" && (
          <div className={styles.tabContent}>
            <h3>Patient Information</h3>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}><strong>Full Name:</strong><span>{patient.first_name} {patient.last_name}</span></div>
              <div className={styles.infoItem}><strong>Email:</strong><span>{patient.email}</span></div>
              <div className={styles.infoItem}><strong>Phone:</strong><span>{patient.phone || "Not provided"}</span></div>
              <div className={styles.infoItem}><strong>Date of Birth:</strong><span>{patient.dob || "Not provided"}</span></div>
              <div className={styles.infoItem}><strong>Gender:</strong><span>{patient.gender || "Not provided"}</span></div>
              <div className={styles.infoItem}><strong>Address:</strong><span>{patient.address || "Not provided"}</span></div>
            </div>
          </div>
        )}

        {/* Medical History */}
        {tab === "history" && (
          <div className={styles.tabContent}>
            <h3>Medical History</h3>
            <div className={styles.medicalHistoryContainer}>
              <button
                onClick={handleShowMedicalHistory}
                className={styles.medicalHistoryBtn}
              >
                View Complete Medical History
              </button>
              <p className={styles.medicalHistoryNote}>
                Click the button above to view the patient's complete medical history including chronic conditions, allergies, medications, past surgeries, and procedures.
              </p>
            </div>
          </div>
        )}

        {/* Appointments */}
        {tab === "apps" && (
          <div className={styles.tabContent}>
            <h3>Appointments History</h3>
            {patient.appointments?.length ? patient.appointments.map((a, i) => (
              <div key={i} className={styles.appointmentCard}>
                <strong>{a.appointment_date}</strong> — {a.reason || "No reason"}
              </div>
            )) : <p className={styles.emptyMessage}>No appointments found</p>}
          </div>
        )}

        {/* Treatments */}
        {tab === "treatments" && (
          <div className={styles.tabContent}>
            <h3>Treatment History</h3>
            {patient.treatments?.length ? patient.treatments.map((t, i) => (
              <div key={i} className={styles.treatmentCard}>
                <strong>{t.treatment_code}</strong> — ${t.cost}
              </div>
            )) : <p className={styles.emptyMessage}>No treatments found</p>}
          </div>
        )}
      </div>

      {/* ================= MEDICAL HISTORY MODAL ================= */}
      {showMedicalHistory && patient && (
        <MedicalHistoryModal
          patient={patient}
          onClose={handleCloseMedicalHistory}
        />
      )}
    </div>
  );
}
