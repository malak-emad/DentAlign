import React, { useState, useEffect } from "react";
import { adminApi } from "../api/adminApi";
import styles from "./AdminDashboard.module.css";

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getDashboardData();
      setDashboardData(data);
      setError(null);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Admin Dashboard</h1>
          <p className={styles.subtitle}>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Admin Dashboard</h1>
          <p className={styles.subtitle} style={{ color: 'red' }}>{error}</p>
          <button onClick={fetchDashboardData}>Retry</button>
        </div>
      </div>
    );
  }
  return (
    <div className={styles.container}>
      
      {/* ===== Page Header ===== */}
      <div className={styles.header}>
        <h1 className={styles.title}>Admin Dashboard</h1>
        <p className={styles.subtitle}>
          Overview of system activity and performance
        </p>
      </div>

      {/* ===== Stats Cards ===== */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Total Patients</p>
          <h2 className={styles.statValue}>{dashboardData?.patients?.total?.toLocaleString() || '0'}</h2>
        </div>

        <div className={styles.statCard}>
          <p className={styles.statLabel}>Staff Members</p>
          <h2 className={styles.statValue}>{dashboardData?.staff?.total || '0'}</h2>
        </div>

        <div className={styles.statCard}>
          <p className={styles.statLabel}>Today's Appointments</p>
          <h2 className={styles.statValue}>{dashboardData?.appointments?.today || '0'}</h2>
        </div>

        <div className={styles.statCard}>
          <p className={styles.statLabel}>Monthly Revenue</p>
          <h2 className={styles.statValue}>${dashboardData?.revenue?.this_month?.toLocaleString() || '0'}</h2>
        </div>

        <div className={styles.statCard}>
          <p className={styles.statLabel}>Total Services</p>
          <h2 className={styles.statValue}>{dashboardData?.treatments?.total?.toLocaleString() || '0'}</h2>
        </div>
      </div>

      {/* ===== Main Content Grid ===== */}
      <div className={styles.mainGrid}>
        
        {/* Recent Appointments */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h3>Recent Appointments</h3>
          </div>

          <ul className={styles.list}>
            {dashboardData?.recent_activities?.recent_appointments?.map((appointment, index) => (
              <li key={index} className={styles.listItem}>
                <span>{appointment.patientName}</span>
                <span className={styles.muted}>{appointment.time}</span>
              </li>
            )) || (
              <li className={styles.listItem}>
                <span>No appointments found</span>
              </li>
            )}
          </ul>
        </div>

        {/* System Overview */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h3>System Overview</h3>
          </div>

          <div className={styles.systemStats}>
            <div>
              <p className={styles.statSmall}>Active Services</p>
              <h4>{dashboardData?.recent_activities?.system_overview?.activeServices || '0'}</h4>
            </div>
            <div>
              <p className={styles.statSmall}>Pending Reports</p>
              <h4>{dashboardData?.recent_activities?.system_overview?.pendingReports || '0'}</h4>
            </div>
            <div>
              <p className={styles.statSmall}>System Status</p>
              <h4 className={styles.success}>{dashboardData?.recent_activities?.system_overview?.systemStatus || 'Unknown'}</h4>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
