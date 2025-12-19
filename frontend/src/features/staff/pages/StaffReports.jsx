import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import styles from "./StaffReports.module.css";

export default function StaffReports() {
  const stats = [
    { label: "Total Patients", value: 128 },
    { label: "Appointments This Month", value: 34 },
    { label: "Completed Appointments", value: 29 },
    { label: "Most Common Treatment", value: "Teeth Alignment" },
  ];

  const monthlyData = [
    { month: "Jan", appointments: 20 },
    { month: "Feb", appointments: 25 },
    { month: "Mar", appointments: 30 },
    { month: "Apr", appointments: 34 },
    { month: "May", appointments: 28 },
  ];

  const handlePrint = () => window.print();

  return (
    <div className={styles.reportsPage}>
      {/* Header */}
      <div className={styles.header}>
        <h2>Reports & Metrics</h2>
        <button onClick={handlePrint} className={styles.printBtn}>
          Print Report
        </button>
      </div>

      {/* Stats */}
      <div className={styles.statsGrid}>
        {stats.map((item, index) => (
          <div key={index} className={styles.statCard}>
            <p className={styles.statLabel}>{item.label}</p>
            <h3 className={styles.statValue}>{item.value}</h3>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className={styles.chartSection}>
        <h3>Appointments Overview</h3>

        {/* IMPORTANT: fixed height */}
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={monthlyData}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="appointments" fill="#0A345C" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
