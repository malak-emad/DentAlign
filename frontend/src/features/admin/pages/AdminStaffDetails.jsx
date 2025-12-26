import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import styles from "./AdminStaffDetails.module.css";

/* ===== MOCK STAFF ===== */
const MOCK_STAFF = [
  {
    id: 1,
    full_name: "Dr. Ahmed Hassan",
    role: "doctor",
    specialty: "Dentistry",
    email: "ahmed.hassan@clinic.com",
    phone: "01011112222",
    status: "active",
  },
  {
    id: 2,
    full_name: "Mona Ali",
    role: "nurse",
    specialty: null,
    email: "mona.ali@clinic.com",
    phone: "01133334444",
    status: "suspended",
  },
];

export default function AdminStaffDetails() {
  const { id } = useParams();
  const staff = MOCK_STAFF.find((s) => s.id === Number(id));

  const [status, setStatus] = useState(staff?.status || "active");
  const [role, setRole] = useState(staff?.role || "doctor");
  const [tab, setTab] = useState("overview");

  if (!staff) {
    return <div className={styles.empty}>Staff member not found</div>;
  }

  const getInitials = (name) =>
    name
      .replace("Dr.", "")
      .trim()
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

  const toggleStatus = () => {
    setStatus((prev) => (prev === "active" ? "suspended" : "active"));
  };

  return (
    <div className={styles.container}>
      {/* ===== HEADER ===== */}
      <div className={styles.header}>
        <Link to="/admin/staff" className={styles.backBtn}>
          ←
        </Link>

        <div className={styles.avatar}>{getInitials(staff.full_name)}</div>

        <div className={styles.info}>
          <h2>{staff.full_name}</h2>
          <p>
            {role === "doctor" ? "Doctor" : "Nurse"}
            {staff.specialty && ` • ${staff.specialty}`}
          </p>
          <span className={`${styles.status} ${styles[status]}`}>
            {status}
          </span>
        </div>
      </div>

      {/* ===== ACTIONS ===== */}
      <div className={styles.actions}>
        <button
          className={status === "active" ? styles.suspend : styles.activate}
          onClick={toggleStatus}
        >
          {status === "active" ? "Suspend Access" : "Reactivate Access"}
        </button>

        <button
          className={styles.roleBtn}
          onClick={() =>
            setRole((r) => (r === "doctor" ? "nurse" : "doctor"))
          }
        >
          Change role to {role === "doctor" ? "Nurse" : "Doctor"}
        </button>
      </div>

      {/* ===== TABS ===== */}
      <div className={styles.tabs}>
        {["overview", "permissions"].map((t) => (
          <button
            key={t}
            className={tab === t ? styles.active : ""}
            onClick={() => setTab(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* ===== CONTENT ===== */}
      <div className={styles.content}>
        {tab === "overview" && (
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <strong>Email</strong>
              <span>{staff.email}</span>
            </div>
            <div className={styles.infoItem}>
              <strong>Phone</strong>
              <span>{staff.phone || "N/A"}</span>
            </div>
            <div className={styles.infoItem}>
              <strong>Role</strong>
              <span>{role}</span>
            </div>
            <div className={styles.infoItem}>
              <strong>Status</strong>
              <span>{status}</span>
            </div>
          </div>
        )}

        {tab === "permissions" && (
          <div className={styles.permissions}>
            <p>✔ View patients</p>
            <p>{role === "doctor" ? "✔ Diagnose patients" : "✖ Diagnose patients"}</p>
            <p>✔ View schedule</p>
            <p>{status === "active" ? "✔ System access" : "✖ System access"}</p>
          </div>
        )}
      </div>
    </div>
  );
}
