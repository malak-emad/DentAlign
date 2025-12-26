import React from "react";
import styles from "./Reporting.module.css";

/* ===== MOCK METRICS ===== */
const METRICS = {
  totalRevenue: 24500,
  paidInvoices: 38,
  unpaidInvoices: 12,
  totalVisits: 64,
  activeDoctors: 7,
};

const REVENUE = {
  today: 1800,
  month: 24500,
  avgInvoice: 520,
};

const INVOICE_STATS = [
  { label: "Pending", value: 6 },
  { label: "Approved", value: 18 },
  { label: "Paid", value: 38 },
  { label: "Unpaid", value: 12 },
];

const DOCTOR_STATS = [
  { name: "Dr. Ahmed Hassan", visits: 18, revenue: 6200 },
  { name: "Dr. Mona Ali", visits: 14, revenue: 4800 },
  { name: "Dr. Karim Samy", visits: 11, revenue: 3900 },
];

export default function AdminReports() {
  const printReport = () => {
    window.print();
  };

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
        <MetricCard label="Total Revenue" value={`${METRICS.totalRevenue} EGP`} />
        <MetricCard label="Paid Invoices" value={METRICS.paidInvoices} />
        <MetricCard label="Unpaid Invoices" value={METRICS.unpaidInvoices} />
        <MetricCard label="Total Visits" value={METRICS.totalVisits} />
        <MetricCard label="Active Doctors" value={METRICS.activeDoctors} />
      </div>

      {/* ===== REVENUE ===== */}
      <div className={styles.section}>
        <h3>Revenue Overview</h3>
        <div className={styles.row}>
          <StatBox label="Today" value={`${REVENUE.today} EGP`} />
          <StatBox label="This Month" value={`${REVENUE.month} EGP`} />
          <StatBox label="Avg. Invoice" value={`${REVENUE.avgInvoice} EGP`} />
        </div>
      </div>

      {/* ===== INVOICE STATUS ===== */}
      <div className={styles.section}>
        <h3>Invoice Status</h3>
        <div className={styles.invoiceStats}>
          {INVOICE_STATS.map((s, i) => (
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

          {DOCTOR_STATS.map((d, i) => (
            <div key={i} className={styles.tableRow}>
              <span>{d.name}</span>
              <span>{d.visits}</span>
              <strong>{d.revenue} EGP</strong>
            </div>
          ))}
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
