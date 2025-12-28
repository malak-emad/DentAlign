import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { patientApi } from "../api/patientApi";
import styles from "./PatientDashboard.module.css";

export default function PatientDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const data = await patientApi.getDashboardStats();
        setDashboardData(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className={styles.retryButton}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <p>No dashboard data available</p>
        </div>
      </div>
    );
  }

  const { patient_info, next_appointment, pending_bills, latest_treatment, medical_records_count } = dashboardData;

  return (
    <div className={styles.container}>

      {/* PAGE TITLE */}
      <h1 className={styles.pageTitle}>
        Welcome back, {patient_info.name.split(' ')[0]}!
      </h1>

      {/* GRID CARDS */}
      <div className={styles.grid}>

        {/* NEXT APPOINTMENT */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Next Appointment</h3>

          {next_appointment ? (
            <div className={styles.details}>
              <p><strong>Doctor:</strong> {next_appointment.doctor_name}</p>
              <p><strong>Date:</strong> {new Date(next_appointment.date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric', 
                month: 'long',
                day: 'numeric'
              })}</p>
              <p><strong>Time:</strong> {next_appointment.time}</p>
              <p><strong>Reason:</strong> {next_appointment.reason}</p>
            </div>
          ) : (
            <div className={styles.details}>
              <p className={styles.emptyState}>No upcoming appointments scheduled</p>
            </div>
          )}

          <Link to="/patient/booking" className={styles.secondaryBtn}>
            {next_appointment ? 'Reschedule' : 'Book Appointment'}
          </Link>
        </div>

        {/* PENDING BILLS */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Pending Bills</h3>

          {pending_bills.count > 0 ? (
            <>
              <p className={styles.highlightNumber}>
                {pending_bills.count} Outstanding
              </p>
              <p className={styles.totalAmount}>
                Total: ${pending_bills.total_amount.toFixed(2)}
              </p>
            </>
          ) : (
            <p className={styles.emptyState}>No pending bills</p>
          )}

          <Link to="/patient/bills" className={styles.primaryBtn}>
            {pending_bills.count > 0 ? 'Pay Now' : 'View Bills'}
          </Link>
        </div>

        {/* LATEST TREATMENT */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Latest Treatment</h3>

          {latest_treatment ? (
            <div className={styles.details}>
              <p><strong>Treatment:</strong> {latest_treatment.treatment_type}</p>
              <p><strong>Description:</strong> {latest_treatment.description}</p>
              {latest_treatment.doctor_name && (
                <p><strong>Doctor:</strong> {latest_treatment.doctor_name}</p>
              )}
              {latest_treatment.date && (
                <p><strong>Date:</strong> {new Date(latest_treatment.date).toLocaleDateString()}</p>
              )}
              {latest_treatment.notes && (
                <p><strong>Notes:</strong> {latest_treatment.notes}</p>
              )}
              {latest_treatment.cost > 0 && (
                <p><strong>Total Cost:</strong> ${latest_treatment.cost.toFixed(2)}</p>
              )}
            </div>
          ) : (
            <p className={styles.emptyState}>No recent treatments</p>
          )}

          <Link to="/patient/prescriptions" className={styles.secondaryBtn}>
            View All Treatments
          </Link>
        </div>

        {/* MEDICAL RECORDS */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Medical Records</h3>

          <p className={styles.highlightNumber}>
            {medical_records_count} Records
          </p>

          <Link to="/patient/history" className={styles.secondaryBtn}>
            View Records
          </Link>
        </div>

      </div>

      {/* QUICK ACTIONS */}
      <div className={styles.quickActions}>
        <Link to="/patient/booking" className={styles.quickBtn}>
          Book Appointment
        </Link>
        <Link to="/patient/history" className={styles.quickBtn}>
          My Records
        </Link>
        <Link to="/patient/bills" className={styles.quickBtn}>
          Bills
        </Link>
        <Link to="/patient/prescriptions" className={styles.quickBtn}>
          Treatments
        </Link>
      </div>
    </div>
  );
}
