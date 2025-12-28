import React, { useState, useEffect } from "react";
import { adminApi } from "../api/adminApi";
import styles from "./Reporting.module.css";

export default function AdminReports() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    paidInvoices: 0,
    unpaidInvoices: 0,
    totalVisits: 0,
    activeDoctors: 0,
    activeNurses: 0,
  });

  const [revenue, setRevenue] = useState({
    today: 0,
    month: 0,
    avgInvoice: 0,
  });

  const [invoiceStats, setInvoiceStats] = useState([]);
  const [doctorStats, setDoctorStats] = useState([]);
  const [nurseStats, setNurseStats] = useState([]); // ✅ NEW

  useEffect(() => {
    fetchReportsData();
  }, []);

  const fetchReportsData = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getReports();

      setMetrics(data.metrics || metrics);
      setRevenue(data.revenue || revenue);
      setInvoiceStats(data.invoiceStats || []);
      setDoctorStats(data.doctorStats || []);
      setNurseStats(data.nurseStats || []); // ✅ NEW
      setError(null);
    } catch (err) {
      console.error("Error fetching reports:", err);
      setError("Failed to load reports data");
    } finally {
      setLoading(false);
    }
  };

  const printReport = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Reports & Metrics</h1>
          <p>Loading reports data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Reports & Metrics</h1>
          <p style={{ color: "red" }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* ===== HEADER ===== */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Reports & Metrics</h1>
          <p className={styles.subtitle}>
            Overview of clinic performance and financial insights
          </p>
        </div>

        <button className={styles.printBtn} onClick={printReport}>
          Print Report
        </button>
      </div>

      {/* ===== METRIC CARDS ===== */}
      <div className={styles.cards}>
        <MetricCard label="Total Revenue" value={`${metrics.totalRevenue} EGP`} />
        <MetricCard label="Paid Invoices" value={metrics.paidInvoices} />
        <MetricCard label="Unpaid Invoices" value={metrics.unpaidInvoices} />
        <MetricCard label="Total Visits" value={metrics.totalVisits} />
        <MetricCard label="Active Doctors" value={metrics.activeDoctors} />
        <MetricCard label="Active Nurses" value={metrics.activeNurses} />
      </div>

      {/* ===== REVENUE ===== */}
      <div className={styles.section}>
        <h3>Revenue Overview</h3>
        <div className={styles.row}>
          <StatBox label="Today" value={`${revenue.today} EGP`} />
          <StatBox label="This Month" value={`${revenue.month} EGP`} />
          <StatBox label="Avg. Invoice" value={`${revenue.avgInvoice} EGP`} />
        </div>
      </div>

      {/* ===== INVOICE STATUS ===== */}
      <div className={styles.section}>
        <h3>Invoice Status</h3>
        <div className={styles.invoiceStats}>
          {invoiceStats.map((s, i) => (
            <div key={i} className={styles.invoiceItem}>
              <span>{s.label}</span>
              <strong>{s.value}</strong>
            </div>
          ))}
        </div>
      </div>

      {/* ===== DOCTOR PERFORMANCE ===== */}
      <div className={styles.section}>
        <h3>Doctor Performance</h3>

        <div className={styles.table}>
          <div className={styles.tableHeader}>
            <span>Doctor</span>
            <span>Visits</span>
            <span>Revenue</span>
          </div>

          {doctorStats.length > 0 ? (
            doctorStats.map((d, i) => (
              <div key={i} className={styles.tableRow}>
                <span>{d.name}</span>
                <span>{d.visits}</span>
                <strong>{d.revenue} EGP</strong>
              </div>
            ))
          ) : (
            <div className={styles.tableRow}>
              <span>No doctor data available</span>
            </div>
          )}
        </div>
      </div>

      {/* ===== NURSE PERFORMANCE ===== */}
      <div className={styles.section}>
        <h3>Nurse Performance</h3>

        <div className={styles.table}>
          <div className={styles.tableHeader}>
            <span>Nurse</span>
            <span>Visits</span>
          </div>

          {nurseStats.length > 0 ? (
            nurseStats.map((n, i) => (
              <div key={i} className={styles.tableRow}>
                <span>{n.name}</span>
                <span>{n.visits}</span>
              </div>
            ))
          ) : (
            <div className={styles.tableRow}>
              <span>No nurse data available</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ===== SMALL COMPONENTS ===== */

function MetricCard({ label, value }) {
  return (
    <div className={styles.card}>
      <p>{label}</p>
      <h2>{value}</h2>
    </div>
  );
}

function StatBox({ label, value }) {
  return (
    <div className={styles.statBox}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
