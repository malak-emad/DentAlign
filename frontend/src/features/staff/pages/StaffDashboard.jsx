import React, { useState, useEffect } from "react";
import { staffApi } from "../api/staffApi";
import styles from "./StaffDashboard.module.css";

export default function StaffDashboard() {
  console.log("Staff Dashboard page loaded");

  const [dashboardData, setDashboardData] = useState({
    patients: { total: 0, new_this_month: 0 },
    appointments: { today: 0, this_week: 0, pending: 0 },
    treatments: { this_month: 0, total_revenue: 0 },
    invoices: { pending: 0, overdue: 0, total_outstanding: 0 },
    recent_activities: {
      recent_appointments: [],
      recent_treatments: [],
      overdue_invoices: []
    }
  });
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]); // Today's date
  const [appointmentsForDate, setAppointmentsForDate] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const data = await staffApi.getDashboardStats();
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

  // Fetch appointments for selected date
  useEffect(() => {
    const fetchAppointmentsForDate = async () => {
      try {
        const response = await staffApi.getAppointments({ date: selectedDate });
        // Handle paginated response - extract the results array
        const appointments = response.results || response;
        setAppointmentsForDate(appointments);
      } catch (err) {
        console.error('Failed to fetch appointments for date:', err);
        // Fallback to dashboard data if API call fails
        if (selectedDate === new Date().toISOString().split('T')[0]) {
          setAppointmentsForDate(dashboardData.recent_activities?.recent_appointments || []);
        } else {
          setAppointmentsForDate([]);
        }
      }
    };

    if (!loading && selectedDate) {
      fetchAppointmentsForDate();
    }
  }, [selectedDate, loading, dashboardData]);

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
  };

  const formatSelectedDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    
    if (isToday) {
      return "Today's Appointments";
    } else {
      return `Appointments for ${date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}`;
    }
  };

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

  return (
    <div className={styles.container}>
      {/* STAT CARDS */}
      <div className={styles.cards}>
        <div className={styles.card}>
          <h2>{dashboardData.appointments?.today || 0}</h2>
          <p>Appointments Today</p>
        </div>

        <div className={styles.card}>
          <h2>{dashboardData.patients?.total || 0}</h2>
          <p>Total Patients</p>
        </div>

        <div className={styles.card}>
          <h2>{dashboardData.invoices?.pending || 0}</h2>
          <p>Pending Invoices</p>
        </div>

        <div className={styles.card}>
          <h2>{dashboardData.invoices?.overdue || 0}</h2>
          <p>Overdue Invoices</p>
          {dashboardData.invoices?.overdue > 0 && (
            <span className={styles.warning}>⚠️</span>
          )}
        </div>
      </div>

      <div className={styles.bottom}>
        {/* CALENDAR */}
        <div className={styles.calendar}>
          <h3>Select Date</h3>
          <input 
            type="date" 
            className={styles.datePicker} 
            value={selectedDate}
            onChange={handleDateChange}
            max="2030-12-31"
            min="2020-01-01"
          />
        </div>

        {/* APPOINTMENTS FOR SELECTED DATE */}
        <div className={styles.todayList}>
          <h3>{formatSelectedDate(selectedDate)}</h3>

          {appointmentsForDate?.length > 0 ? (
            appointmentsForDate.map((appointment, index) => (
              <div key={index} className={styles.appCard}>
                <div className={styles.header}>
                  <strong>{appointment.patient_name}</strong>
                  <span>{appointment.appointment_time || 'Time TBD'}</span>
                </div>
                <div className={styles.details}>
                  <small className={styles.status}>
                    {appointment.status || 'Scheduled'}
                  </small>
                  {appointment.reason && (
                    <small className={styles.reason}>{appointment.reason}</small>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className={styles.emptyState}>
              <p>No appointments scheduled for {selectedDate === new Date().toISOString().split('T')[0] ? 'today' : 'this date'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
