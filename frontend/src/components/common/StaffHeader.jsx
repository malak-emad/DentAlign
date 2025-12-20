import React, { useState, useEffect } from "react";
import styles from "./StaffHeader.module.css";

// Get staff name from localStorage
export default function StaffHeader() {
  const [staffName, setStaffName] = useState("Staff Member");

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        // Use first_name and last_name from user data, with "Dr." prefix if role is Doctor
        const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
        const isDoctor = user.role && (user.role.name === 'Doctor' || user.role === 'Doctor');
        const displayName = fullName || user.email || 'Staff Member';
        setStaffName(isDoctor && !displayName.startsWith('Dr.') ? `Dr. ${displayName}` : displayName);
      } catch (error) {
        console.error('Failed to parse user data:', error);
      }
    }
  }, []);

  return (
    <div className={styles.header}>
      <h2 className={styles.text}>Welcome, {staffName}</h2>
    </div>
  );
}
