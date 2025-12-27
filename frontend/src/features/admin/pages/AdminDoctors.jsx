import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styles from "./AdminDoctors.module.css";
import { adminApi } from "../api/adminApi.js";

export default function AdminDoctors() {
  const [role, setRole] = useState("doctor"); // doctor | nurse
  const [search, setSearch] = useState("");
  const [staffData, setStaffData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStaffData = async () => {
      try {
        setLoading(true);
        const response = await adminApi.getStaff();
        setStaffData(response.staff || []);
        setError(null);
      } catch (err) {
        setError('Failed to load staff data');
        console.error('Error fetching staff data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStaffData();
  }, []);

  const filteredData = staffData.filter((item) => {
    const q = search.toLowerCase();
    const roleMatch = role === "doctor" 
      ? item.role_title.toLowerCase().includes('doctor') 
      : item.role_title.toLowerCase().includes('nurse');
    
    const searchMatch = (
      item.full_name.toLowerCase().includes(q) ||
      item.specialization.toLowerCase().includes(q) ||
      item.email.toLowerCase().includes(q)
    );
    
    return roleMatch && searchMatch;
  });

  const getInitials = (name = "") => {
    const clean = name.replace("Dr.", "").replace("Nurse", "").trim();
    const parts = clean.split(" ");
    return parts.length > 1
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : parts[0]?.[0]?.toUpperCase() || "?";
  };

  if (loading) {
    return <div className={styles.container}>Loading staff data...</div>;
  }

  if (error) {
    return <div className={styles.container}>Error: {error}</div>;
  }

  return (
    <div className={styles.container}>
      {/* ===== HEADER ===== */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>
            {role === "doctor" ? "Doctors" : "Nurses"}
          </h1>
          <p className={styles.subtitle}>
            Manage clinic staff and availability
          </p>
        </div>

        <input
          className={styles.search}
          placeholder={`Search ${role}s...`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* ===== ROLE TABS ===== */}
      <div className={styles.tabs}>
        <button
          className={role === "doctor" ? styles.activeTab : ""}
          onClick={() => setRole("doctor")}
        >
          Doctors
        </button>
        <button
          className={role === "nurse" ? styles.activeTab : ""}
          onClick={() => setRole("nurse")}
        >
          Nurses
        </button>
      </div>

      {/* ===== GRID ===== */}
      {filteredData.length === 0 ? (
        <div className={styles.empty}>No {role}s found</div>
      ) : (
        <div className={styles.grid}>
          {filteredData.map((item) => (
            <Link
              key={item.id}
            //   to={`/admin/${role}s/${item.id}`}
              to={`/admin/staff/${item.role}/${item.id}`}

              className={styles.card}
            >
              <div className={styles.avatar}>
                {getInitials(item.full_name)}
              </div>

              <div className={styles.info}>
                <h3>{item.full_name}</h3>
                <p className={styles.specialty}>{item.specialization}</p>
                <p className={styles.license}>License: {item.license_number}</p>
                <p>{item.email}</p>
                <span>{item.phone || "No phone number"}</span>

                <span className={`${styles.status} ${styles[item.status]}`}>
                  {item.status.replace("_", " ")}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
