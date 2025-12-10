import React, { useState, useEffect } from "react";
import { staffApi } from "../api/staffApi";
import styles from "./StaffAppointments.module.css";

export default function Appointments() {
  const [filter, setFilter] = useState("today");
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch appointments based on current filter
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        
        // Build filter parameters based on selected filter
        const today = new Date();
        let filterParams = {};
        
        if (filter === "today") {
          filterParams.date = today.toISOString().split('T')[0]; // YYYY-MM-DD format
        } else if (filter === "week") {
          // Get start of week (last Monday)
          const startOfWeek = new Date(today);
          startOfWeek.setDate(today.getDate() - today.getDay() + 1);
          filterParams.date_gte = startOfWeek.toISOString().split('T')[0];
        } else if (filter === "month") {
          // Get start of month
          const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
          filterParams.date_gte = startOfMonth.toISOString().split('T')[0];
        }
        
        const data = await staffApi.getAppointments(filterParams);
        setAppointments(data.results || data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch appointments:', err);
        setError('Failed to load appointments. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [filter]);

  const formatAppointmentTime = (timeString) => {
    if (!timeString) return 'Time TBD';
    
    try {
      // Handle both time formats: "HH:MM:SS" and full datetime
      const time = timeString.includes('T') 
        ? new Date(timeString).toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
          })
        : new Date(`1970-01-01T${timeString}`).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit', 
            hour12: true
          });
      return time;
    } catch (e) {
      return timeString;
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return styles.statusCompleted;
      case 'confirmed':
        return styles.statusConfirmed;
      case 'scheduled':
        return styles.statusScheduled;
      case 'cancelled':
        return styles.statusCancelled;
      default:
        return styles.statusDefault;
    }
  };

  return (
    <div className={styles.container}>
      
      {/* --- Filters --- */}
      <div className={styles.filters}>
        <button 
          className={filter === "today" ? styles.active : ""} 
          onClick={() => setFilter("today")}
        >
          Today
        </button>

        <button 
          className={filter === "week" ? styles.active : ""} 
          onClick={() => setFilter("week")}
        >
          This Week
        </button>

        <button 
          className={filter === "month" ? styles.active : ""} 
          onClick={() => setFilter("month")}
        >
          This Month
        </button>
      </div>

      {/* --- Loading State --- */}
      {loading && (
        <div className={styles.loading}>
          <p>Loading appointments...</p>
        </div>
      )}

      {/* --- Error State --- */}
      {error && (
        <div className={styles.error}>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className={styles.retryButton}>
            Retry
          </button>
        </div>
      )}

      {/* --- List of Appointments --- */}
      {!loading && !error && (
        <div className={styles.list}>
          {appointments.length > 0 ? (
            appointments.map((appointment, index) => (
              <div key={appointment.appointment_id || index} className={styles.card}>
                <div className={styles.avatar}>
                  {appointment.patient_name ? appointment.patient_name.split(' ').map(n => n[0]).join('').toUpperCase() : '?'}
                </div>

                <div className={styles.info}>
                  <h3>{appointment.patient_name || 'Unknown Patient'}</h3>
                  <p>Time: {formatAppointmentTime(appointment.appointment_time)}</p>
                  <p>Date: {appointment.appointment_date}</p>
                  {appointment.reason && <p>Purpose: {appointment.reason}</p>}
                  <span className={`${styles.status} ${getStatusBadgeClass(appointment.status)}`}>
                    {appointment.status || 'Scheduled'}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className={styles.emptyState}>
              <p>No appointments found for {filter === 'today' ? 'today' : filter === 'week' ? 'this week' : 'this month'}.</p>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
