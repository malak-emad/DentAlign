import React, { useState, useEffect } from "react";
import styles from "./StaffReports.module.css";
import { staffApi } from "../api/staffApi";

export default function StaffReports() {
  const [stats, setStats] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const response = await staffApi.getReports();
        console.log('Reports response:', response); // Debug log
        setStats(response.stats || []);
        setMonthlyData(response.monthlyData || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching reports:', err);
        setError('Failed to load reports data');
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  if (loading) {
    return <div className={styles.reportsPage}>Loading reports...</div>;
  }

  if (error) {
    return <div className={styles.reportsPage}>Error: {error}</div>;
  }

  return (
    <div className={styles.reportsPage}>
      <div className={styles.header}>
        <h2>Reports & Metrics</h2>
      </div>

      <div className={styles.statsGrid}>
        {stats.map((item, index) => (
          <div key={index} className={styles.statCard}>
            <p className={styles.statLabel}>{item.label}</p>
            <h3 className={styles.statValue}>{item.value}</h3>
          </div>
        ))}
      </div>

      <div>
        <h3>Monthly Appointments</h3>
        <ul>
          {monthlyData.map((item, index) => (
            <li key={index}>{item.month}: {item.appointments} appointments</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
