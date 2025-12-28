import React, { useState, useEffect } from "react";
import styles from "./StaffReports.module.css";
import { staffApi } from "../api/staffApi";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

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

      <div className={styles.chartSection}>
        <h3>Monthly Appointments</h3>
        <div className={styles.chartBox}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="appointments" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
