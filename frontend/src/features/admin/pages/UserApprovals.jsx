import React, { useState } from "react";
import styles from "./UserApprovals.module.css";

/* ===== MOCK REQUESTS ===== */
const MOCK_REQUESTS = [
  {
    id: 1,
    full_name: "Dr. Karim Samy",
    email: "karim.samy@gmail.com",
    role: "doctor",
    licenseNumber: "DENT-458912",
    createdAt: "2025-12-18",
    isApproved: false,
  },
  {
    id: 2,
    full_name: "Nour Ali",
    email: "nour.ali@gmail.com",
    role: "nurse",
    licenseNumber: null,
    createdAt: "2025-12-19",
    isApproved: false,
  },
];

export default function AdminUserApprovals() {
  const [filter, setFilter] = useState("all");
  const [requests, setRequests] = useState(MOCK_REQUESTS);

  const approveUser = (id) => {
    setRequests((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, isApproved: true } : u
      )
    );
  };

  const rejectUser = (id) => {
    setRequests((prev) => prev.filter((u) => u.id !== id));
  };

  const filteredRequests =
    filter === "all"
      ? requests.filter((r) => !r.isApproved)
      : requests.filter(
          (r) => r.role === filter && !r.isApproved
        );

  return (
    <div className={styles.container}>
      {/* ===== HEADER ===== */}
      <div className={styles.header}>
        <div>
          <h1>User Approval Requests</h1>
          <p>Approve doctors and nurses before system access</p>
        </div>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All</option>
          <option value="doctor">Doctors</option>
          <option value="nurse">Nurses</option>
        </select>
      </div>

      {/* ===== TABLE ===== */}
      {filteredRequests.length === 0 ? (
        <div className={styles.empty}>
          No pending approval requests
        </div>
      ) : (
        <div className={styles.table}>
          <div className={styles.tableHeader}>
            <span>Name</span>
            <span>Role</span>
            <span>Email</span>
            <span>License</span>
            <span>Requested At</span>
            <span>Actions</span>
          </div>

          {filteredRequests.map((u) => (
            <div key={u.id} className={styles.row}>
              <span>{u.full_name}</span>
              <span className={styles.role}>{u.role}</span>
              <span>{u.email}</span>
              <span>
                {u.role === "doctor"
                  ? u.licenseNumber
                  : "—"}
              </span>
              <span>{u.createdAt}</span>

              <div className={styles.actions}>
                <button
                  className={styles.approve}
                  onClick={() => approveUser(u.id)}
                >
                  Approve
                </button>
                <button
                  className={styles.reject}
                  onClick={() => rejectUser(u.id)}
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
