import React, { useState } from "react";
import { Link } from "react-router-dom";
import styles from "./AdminDoctors.module.css";

/* ===== MOCK DATA ===== */
const MOCK_DOCTORS = [
  {
    id: 1,
    full_name: "Dr. Ahmed Hassan",
    specialty: "Dentistry",
    email: "ahmed.hassan@clinic.com",
    phone: "01011112222",
    status: "active",
    role: "doctor",
  },
  {
    id: 2,
    full_name: "Dr. Mona Ali",
    specialty: "Orthodontics",
    email: "mona.ali@clinic.com",
    phone: "01133334444",
    status: "on_leave",
    role: "doctor",
  },
];

const MOCK_NURSES = [
  {
    id: 101,
    full_name: "Nurse Salma Ibrahim",
    specialty: "Assistant Nurse",
    email: "salma.ibrahim@clinic.com",
    phone: "01055556666",
    status: "active",
    role: "nurse",
  },
  {
    id: 102,
    full_name: "Nurse Omar Adel",
    specialty: "Senior Nurse",
    email: "omar.adel@clinic.com",
    phone: null,
    status: "inactive",
    role: "nurse",
  },
];

export default function AdminDoctors() {
  const [role, setRole] = useState("doctor"); // doctor | nurse
  const [search, setSearch] = useState("");

  const data = role === "doctor" ? MOCK_DOCTORS : MOCK_NURSES;

  const filteredData = data.filter((item) => {
    const q = search.toLowerCase();
    return (
      item.full_name.toLowerCase().includes(q) ||
      item.specialty.toLowerCase().includes(q) ||
      item.email.toLowerCase().includes(q)
    );
  });

  const getInitials = (name = "") => {
    const clean = name.replace("Dr.", "").replace("Nurse", "").trim();
    const parts = clean.split(" ");
    return parts.length > 1
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : parts[0]?.[0]?.toUpperCase() || "?";
  };

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
                <p className={styles.specialty}>{item.specialty}</p>
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
