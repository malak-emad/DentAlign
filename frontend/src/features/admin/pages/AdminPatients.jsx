import React, { useState, useEffect } from "react";
import styles from "./AdminPatients.module.css";
import { Link } from "react-router-dom";
import { adminApi } from "../api/adminApi.js";

export default function AdminPatients() {
  const [search, setSearch] = useState("");
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        const response = await adminApi.getPatients();
        setPatients(response.patients || []);
        setError(null);
      } catch (err) {
        setError('Failed to load patients data');
        console.error('Error fetching patients:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  const filteredPatients = patients.filter((p) => {
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

  if (loading) {
    return <div className={styles.container}>Loading patients data...</div>;
  }

  if (error) {
    return <div className={styles.container}>Error: {error}</div>;
  }

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
                <span>{p.phone !== 'N/A' ? p.phone : "No phone number"}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
