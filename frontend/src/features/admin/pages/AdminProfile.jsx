import React, { useState } from "react";
import styles from "./AdminProfile.module.css";

export default function AdminProfile() {
  const [isEditing, setIsEditing] = useState(false);

  const [profile, setProfile] = useState({
    first_name: "Sarah",
    last_name: "Ahmed",
    full_name: "Sarah Ahmed",
    email: "admin@dentalign.com",
    phone: "+20 100 123 4567",
    role: "System Administrator",
    department: "Administration",
    admin_id: "ADM-982374",
    hire_date: "2021-06-15",
    status: "Active",
    bio: "Responsible for managing system users, permissions, and clinic operations.",
  });

  const [formData, setFormData] = useState({ ...profile });

  const handleEdit = () => setIsEditing(true);

  const handleCancel = () => {
    setFormData({ ...profile });
    setIsEditing(false);
  };

  const handleSave = () => {
    setProfile({ ...formData, full_name: `${formData.first_name} ${formData.last_name}` });
    setIsEditing(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className={styles.container}>
      {/* ===== HEADER ===== */}
      <div className={styles.header}>
        <div className={styles.avatar}>
          {profile.first_name[0]}
          {profile.last_name[0]}
        </div>

        <div className={styles.info}>
          <h2>{profile.full_name}</h2>
          <p className={styles.role}>{profile.role}</p>
          <p className={styles.department}>{profile.department}</p>
        </div>

        <div className={styles.actions}>
          {!isEditing ? (
            <button onClick={handleEdit} className={styles.editBtn}>
              Edit Profile
            </button>
          ) : (
            <div className={styles.editActions}>
              <button onClick={handleSave} className={styles.saveBtn}>
                Save
              </button>
              <button onClick={handleCancel} className={styles.cancelBtn}>
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ===== CARDS ===== */}
      <div className={styles.cards}>
        <div className={styles.card}>
          <h3>Personal Information</h3>

          {!isEditing ? (
            <>
              <p><strong>Full Name:</strong> {profile.full_name}</p>
              <p><strong>Email:</strong> {profile.email}</p>
              <p><strong>Phone:</strong> {profile.phone}</p>
              <p><strong>Role:</strong> {profile.role}</p>
              <p><strong>Department:</strong> {profile.department}</p>
            </>
          ) : (
            <div className={styles.form}>
              <input
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                placeholder="First Name"
              />
              <input
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                placeholder="Last Name"
              />
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Phone"
              />
              <input
                name="department"
                value={formData.department}
                onChange={handleChange}
                placeholder="Department"
              />
              <p className={styles.locked}>Email: {profile.email} (locked)</p>
              <p className={styles.locked}>Role: {profile.role} (locked)</p>
            </div>
          )}
        </div>

        <div className={styles.card}>
          <h3>Admin Details</h3>
          <p><strong>Admin ID:</strong> {profile.admin_id}</p>
          <p><strong>Hire Date:</strong> {profile.hire_date}</p>
          <p><strong>Status:</strong> {profile.status}</p>
        </div>

        <div className={styles.card}>
          <h3>Biography</h3>
          <p>{profile.bio}</p>
        </div>
      </div>
    </div>
  );
}
