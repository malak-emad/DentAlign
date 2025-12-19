import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { staffApi } from "../api/staffApi";
import styles from "./PatientDetails.module.css";

export default function PatientProfile() {
  const { id } = useParams();
  const [tab, setTab] = useState("info");
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPatientDetails = async () => {
      try {
        setLoading(true);
        const data = await staffApi.getPatientDetails(id);
        setPatient(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch patient details:', err);
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
        <div className={styles.error}>
          <p>{error}</p>
          <Link to="/staff/patients" className={styles.backBtn}>← Back to Patients</Link>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <p>Patient not found</p>
          <Link to="/staff/patients" className={styles.backBtn}>← Back to Patients</Link>
        </div>
      </div>
    );
  }

  // Calculate age from dob if available
  const calculateAge = (dob) => {
    if (!dob) return 'N/A';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className={styles.container}>
      
      {/* Top Patient Banner */}
      <div className={styles.header}>
        <Link to="/staff/patients" className={styles.backBtn}>← Back</Link>

        <div className={styles.avatar}>
          {(patient.first_name && patient.last_name) 
            ? `${patient.first_name[0]}${patient.last_name[0]}` 
            : patient.email[0].toUpperCase()
          }
        </div>

        <div className={styles.info}>
          <h2>
            {patient.first_name && patient.last_name 
              ? `${patient.first_name} ${patient.last_name}` 
              : patient.email
            }
          </h2>
          <p>Age: {calculateAge(patient.dob)}</p>
          <p>Email: {patient.email}</p>
          <p>Phone: {patient.phone || 'N/A'}</p>
          <p className={styles.history}>
            {patient.medical_history || 'No medical history recorded.'}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button 
          onClick={() => setTab("info")} 
          className={tab === "info" ? styles.active : ""}
        >
          Medical Info
        </button>
        <button 
          onClick={() => setTab("apps")} 
          className={tab === "apps" ? styles.active : ""}
        >
          Appointments ({patient.appointments?.length || 0})
        </button>
        <button 
          onClick={() => setTab("treatments")} 
          className={tab === "treatments" ? styles.active : ""}
        >
          Treatments ({patient.treatments?.length || 0})
        </button>
        {/* <button 
          onClick={() => setTab("invoices")} 
          className={tab === "invoices" ? styles.active : ""}
        >
          Invoices ({patient.invoices?.length || 0})
        </button> */}
      </div>

      {/* Content */}
      <div className={styles.content}>
        {tab === "info" && (
          <div className={styles.tabContent}>
            <h3>Patient Information</h3>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <strong>Full Name:</strong>
                <span>
                  {patient.first_name && patient.last_name 
                    ? `${patient.first_name} ${patient.last_name}` 
                    : 'Not provided'
                  }
                </span>
              </div>
              <div className={styles.infoItem}>
                <strong>Email:</strong>
                <span>{patient.email}</span>
              </div>
              <div className={styles.infoItem}>
                <strong>Phone:</strong>
                <span>{patient.phone || 'Not provided'}</span>
              </div>
              <div className={styles.infoItem}>
                <strong>Date of Birth:</strong>
                <span>{patient.dob || 'Not provided'}</span>
              </div>
              <div className={styles.infoItem}>
                <strong>Gender:</strong>
                <span>{patient.gender || 'Not provided'}</span>
              </div>
              <div className={styles.infoItem}>
                <strong>Address:</strong>
                <span>{patient.address || 'Not provided'}</span>
              </div>
              <div className={styles.infoItem}>
                <strong>Medical History:</strong>
                <span>{patient.medical_history || 'No medical history recorded'}</span>
              </div>
            </div>
          </div>
        )}

        {tab === "apps" && (
          <div className={styles.tabContent}>
            <h3>Appointments History</h3>
            {patient.appointments && patient.appointments.length > 0 ? (
              <div className={styles.appointmentsList}>
                {patient.appointments.map((appointment, index) => (
                  <div key={index} className={styles.appointmentCard}>
                    <div className={styles.appointmentHeader}>
                      <strong>{appointment.appointment_date}</strong>
                      <span className={styles.time}>{appointment.appointment_time}</span>
                      <span className={`${styles.status} ${styles[appointment.status]}`}>
                        {appointment.status}
                      </span>
                    </div>
                    <div className={styles.appointmentDetails}>
                      <p><strong>Staff:</strong> {appointment.staff_name}</p>
                      <p><strong>Reason:</strong> {appointment.reason || 'Not specified'}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className={styles.emptyMessage}>No appointments found</p>
            )}
          </div>
        )}

        {tab === "treatments" && (
          <div className={styles.tabContent}>
            <h3>Treatment History</h3>
            {patient.treatments && patient.treatments.length > 0 ? (
              <div className={styles.treatmentsList}>
                {patient.treatments.map((treatment, index) => (
                  <div key={index} className={styles.treatmentCard}>
                    <div className={styles.treatmentHeader}>
                      <strong>{treatment.treatment_code}</strong>
                      <span className={styles.cost}>${treatment.cost}</span>
                    </div>
                    <p className={styles.description}>{treatment.description}</p>
                    <p className={styles.date}>Date: {treatment.appointment_date}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className={styles.emptyMessage}>No treatments found</p>
            )}
          </div>
        )}

        {/* {tab === "invoices" && (
          <div className={styles.tabContent}>
            <h3>Billing & Invoices</h3>
            {patient.invoices && patient.invoices.length > 0 ? (
              <div className={styles.invoicesList}>
                {patient.invoices.map((invoice, index) => (
                  <div key={index} className={styles.invoiceCard}>
                    <div className={styles.invoiceHeader}>
                      <strong>Invoice #{invoice.invoice_id.slice(0, 8)}...</strong>
                      <span className={styles.amount}>${invoice.total_amount}</span>
                      <span className={`${styles.status} ${styles[invoice.status]}`}>
                        {invoice.status}
                      </span>
                    </div>
                    <div className={styles.invoiceDetails}>
                      <p><strong>Due Date:</strong> {invoice.due_date}</p>
                      <p><strong>Paid Amount:</strong> ${invoice.paid_amount || 0}</p>
                      <p><strong>Balance:</strong> ${invoice.balance_due || invoice.total_amount}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className={styles.emptyMessage}>No invoices found</p>
            )}
          </div>
        )} */}
      </div>
    </div>
  );
}
