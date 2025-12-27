import React, { useState, useEffect } from "react";
import styles from "./UserApprovals.module.css";
import { adminApi } from "../api/adminApi.js";

export default function AdminUserApprovals() {
  const [filter, setFilter] = useState("all");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserApprovals = async () => {
      try {
        setLoading(true);
        const response = await adminApi.getUserApprovals();
        setRequests(response.requests || []);
        setError(null);
      } catch (err) {
        setError('Failed to load user approval requests');
        console.error('Error fetching user approvals:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserApprovals();
  }, []);

  const approveUser = async (userId) => {
    try {
      await adminApi.approveUser(userId);
      // Update the local state
      setRequests((prev) =>
        prev.map((u) =>
          u.user_id === userId ? { ...u, is_verified: true } : u
        )
      );
    } catch (err) {
      console.error('Error approving user:', err);
      alert('Failed to approve user. Please try again.');
    }
  };

  const rejectUser = async (userId) => {
    try {
      await adminApi.rejectUser(userId);
      // Update the local state
      setRequests((prev) =>
        prev.map((u) =>
          u.user_id === userId ? { ...u, is_verified: false } : u
        )
      );
    } catch (err) {
      console.error('Error rejecting user:', err);
      alert('Failed to reject user. Please try again.');
    }
  };

  const filteredRequests = requests.filter((r) => {
    if (filter === "all") {
      return true; // Show all users (both verified and unverified)
    }
    return r.role.toLowerCase().includes(filter.toLowerCase());
  });

  if (loading) {
    return <div className={styles.container}>Loading user approval requests...</div>;
  }

  if (error) {
    return <div className={styles.container}>Error: {error}</div>;
  }

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
            <div key={u.user_id} className={styles.row}>
              <span>{u.full_name}</span>
              <span className={styles.role}>{u.role}</span>
              <span>{u.email}</span>
              <span>
                {u.license_number !== 'N/A' 
                  ? u.license_number
                  : "—"}
              </span>
              <span>{u.created_at}</span>

              <div className={styles.actions}>
                {u.is_verified ? (
                  <span className={styles.approved}>✓ Approved</span>
                ) : (
                  <>
                    <button
                      className={styles.approve}
                      onClick={() => approveUser(u.user_id)}
                    >
                      Approve
                    </button>
                    <button
                      className={styles.reject}
                      onClick={() => rejectUser(u.user_id)}
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
