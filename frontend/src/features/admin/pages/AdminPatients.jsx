import React, { useState } from "react";
import styles from "./AdminPatients.module.css";
import { Link } from "react-router-dom";

/* ===== MOCK DATA (frontend only) ===== */
const MOCK_PATIENTS = [
  {
    patient_id: 1,
    full_name: "John Doe",
    email: "john.doe@email.com",
    phone: "01012345678",
  },
  {
    patient_id: 2,
    full_name: "Sarah Ahmed",
    email: "sarah.ahmed@email.com",
    phone: "01198765432",
  },
  {
    patient_id: 3,
    full_name: "Michael Smith",
    email: "michael.smith@email.com",
    phone: null,
  },
];

export default function AdminPatients() {
  const [search, setSearch] = useState("");

  const filteredPatients = MOCK_PATIENTS.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.full_name.toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q) ||
      (p.phone && p.phone.includes(search))
    );
  });

  const getInitials = (name = "") => {
    const parts = name.trim().split(" ");
    return parts.length > 1
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : parts[0]?.[0]?.toUpperCase() || "?";
  };

  return (
    <div className={styles.container}>
      {/* ===== HEADER ===== */}
      <div className={styles.header}>
        <h1 className={styles.title}>All Patients</h1>

        <input
          className={styles.search}
          placeholder="Search by name, email, or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* ===== GRID ===== */}
      {filteredPatients.length === 0 ? (
        <div className={styles.empty}>No patients found</div>
      ) : (
        <div className={styles.grid}>
          {filteredPatients.map((p) => (
            <Link
              key={p.patient_id}
              to={`/admin/patients/${p.patient_id}`} // can be placeholder route
              className={styles.card}
            >
              <div className={styles.avatar}>
                {getInitials(p.full_name)}
              </div>

              <div className={styles.info}>
                <h3>{p.full_name}</h3>
                <p>{p.email}</p>
                <span>{p.phone || "No phone number"}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
