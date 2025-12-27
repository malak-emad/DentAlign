import React, { useEffect, useState } from "react";
import { patientApi } from "../api/patientApi";
import styles from "./PatientProfile.module.css";

export default function PatientProfile() {
  const [patient, setPatient] = useState(null);
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await patientApi.getProfile();
        setPatient(data);
        setFormData(data);
        setError(null);
      } catch (err) {
        console.error(err);
        setError("Failed to load profile data.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEdit = () => setEditing(true);

  const handleCancel = () => {
    setFormData(patient);
    setEditing(false);
  };

  const handleSave = async () => {
    try {
      const updated = await patientApi.updateProfile(formData);
      setPatient(updated);
      setFormData(updated);
      setEditing(false);
    } catch (err) {
      console.error(err);
      setError("Failed to update profile.");
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  if (!patient) return null;

  return (
    <div className={styles.container}>
      {/* ===== HEADER ===== */}
      <div className={styles.header}>
        <div className={styles.avatar}>
          {patient.name
            ?.split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()}
        </div>

        <div className={styles.info}>
          <h2>{patient.name}</h2>
          <p className={styles.role}>Patient</p>
        </div>

        {editing ? (
          <div className={styles.editActions}>
            <button className={styles.saveBtn} onClick={handleSave}>
              Save
            </button>
            <button className={styles.cancelBtn} onClick={handleCancel}>
              Cancel
            </button>
          </div>
        ) : (
          <button className={styles.editBtn} onClick={handleEdit}>
            Edit Profile
          </button>
        )}
      </div>

      {/* ===== WARNING ===== */}
      {(!patient.phone ||
        !patient.address ||
        !patient.gender ||
        !patient.birthdate) && (
        <div className={styles.warningBanner}>
          <strong>⚠️ Complete your profile</strong>
          <p>
            Please complete your information before booking appointments.
          </p>
        </div>
      )}

      {/* ===== CARDS ===== */}
      <div className={styles.cards}>
        {/* CONTACT */}
        <div className={styles.card}>
          <h3>Contact Information</h3>

          {editing ? (
            <>
              <div className={styles.formGroup}>
                <label>Email</label>
                <input
                  className={styles.input}
                  value={formData.email || ""}
                  onChange={(e) =>
                    handleChange("email", e.target.value)
                  }
                />
              </div>

              <div className={styles.formGroup}>
                <label>Phone</label>
                <input
                  className={styles.input}
                  value={formData.phone || ""}
                  onChange={(e) =>
                    handleChange("phone", e.target.value)
                  }
                />
              </div>
            </>
          ) : (
            <>
              <p><strong>Email:</strong> {patient.email}</p>
              <p><strong>Phone:</strong> {patient.phone || "Not specified"}</p>
            </>
          )}
        </div>

        {/* PERSONAL */}
        <div className={styles.card}>
          <h3>Personal Details</h3>

          {editing ? (
            <>
              <div className={styles.formGroup}>
                <label>Gender</label>
                <select
                  className={styles.input}
                  value={formData.gender || ""}
                  onChange={(e) =>
                    handleChange("gender", e.target.value)
                  }
                >
                  <option value="">Select</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Birth Date</label>
                <input
                  type="date"
                  className={styles.input}
                  value={formData.birthdate || ""}
                  onChange={(e) =>
                    handleChange("birthdate", e.target.value)
                  }
                />
              </div>

              <div className={styles.formGroup}>
                <label>Blood Type</label>
                <select
                  className={styles.input}
                  value={formData.blood_type || ""}
                  onChange={(e) =>
                    handleChange("blood_type", e.target.value)
                  }
                >
                  <option value="">Select</option>
                  <option>A+</option>
                  <option>A-</option>
                  <option>B+</option>
                  <option>B-</option>
                  <option>O+</option>
                  <option>O-</option>
                  <option>AB+</option>
                  <option>AB-</option>
                </select>
              </div>
            </>
          ) : (
            <>
              <p><strong>Gender:</strong> {patient.gender || "Not specified"}</p>
              <p><strong>Birthdate:</strong> {patient.birthdate || "Not specified"}</p>
              <p><strong>Blood Type:</strong> {patient.blood_type || "Not specified"}</p>
            </>
          )}
        </div>

        {/* ADDRESS */}
        <div className={styles.card}>
          <h3>Address</h3>

          {editing ? (
            <textarea
              className={styles.textarea}
              rows="3"
              value={formData.address || ""}
              onChange={(e) =>
                handleChange("address", e.target.value)
              }
            />
          ) : (
            <p>{patient.address || "No address on file"}</p>
          )}
        </div>

        {/* MEDICAL */}
        <div className={styles.card}>
          <h3>Medical History</h3>

          {editing ? (
            <textarea
              className={styles.textarea}
              rows="4"
              value={formData.medical_history || ""}
              onChange={(e) =>
                handleChange("medical_history", e.target.value)
              }
            />
          ) : (
            <p>{patient.medical_history || "No medical history on file"}</p>
          )}
        </div>
      </div>
    </div>
  );
}
