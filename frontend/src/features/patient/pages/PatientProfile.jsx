import React, { useState, useEffect } from "react";
import { patientApi } from "../api/patientApi";
import styles from "./PatientProfile.module.css";

export default function PatientProfile() {
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await patientApi.getProfile();
        setPatient(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch profile:', err);
        setError('Failed to load profile data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleEdit = () => {
    setEditing(true);
  };

  const handleSave = async () => {
    try {
      const updatedData = await patientApi.updateProfile(patient);
      setPatient(updatedData);
      setEditing(false);
      setError(null);
    } catch (err) {
      console.error('Failed to update profile:', err);
      setError('Failed to update profile. Please try again.');
    }
  };

  const handleCancel = () => {
    setEditing(false);
    // Reload the profile data to reset any unsaved changes
    window.location.reload();
  };

  const handleInputChange = (field, value) => {
    setPatient(prev => ({
      ...prev,
      [field]: value
    }));
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

  if (!patient) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <p>No profile data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      
      {/* ------ HEADER CARD ------ */}
      <div className={styles.header}>
        <div className={styles.avatar}>
          {patient.name.split(' ').map(n => n[0]).join('').toUpperCase()}
        </div>

        <div className={styles.info}>
          <h2>{patient.name}</h2>
          <p className={styles.role}>Patient</p>
        </div>

        {/* EDIT BUTTON */}
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

      {/* Error display */}
      {error && (
        <div className={styles.errorBanner}>
          {error}
        </div>
      )}

      {/* Profile completion warning - show if essential fields are missing */}
      {patient && (!patient.phone || !patient.address || !patient.birthdate || !patient.gender) && (
        <div className={styles.warningBanner}>
          <strong>⚠️ Please complete your profile information before booking appointments.</strong>
          <p>Update your contact details, address, and medical history to ensure we can provide the best care.</p>
        </div>
      )}

      {/* ------ DETAILS CARDS ------ */}
      <div className={styles.cards}>

        <div className={styles.card}>
          <h3>Contact Information</h3>
          {editing ? (
            <>
              <div className={styles.formGroup}>
                <label>Email:</label>
                <input
                  type="email"
                  value={patient.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={styles.input}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Phone:</label>
                <input
                  type="tel"
                  value={patient.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={styles.input}
                />
              </div>
            </>
          ) : (
            <>
              <p><strong>Email:</strong> {patient.email}</p>
              <p><strong>Phone:</strong> {patient.phone || 'Not specified'}</p>
            </>
          )}
        </div>

        <div className={styles.card}>
          <h3>Personal Details</h3>
          {editing ? (
            <>
              <div className={styles.formGroup}>
                <label>Gender:</label>
                <select
                  value={patient.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  className={styles.input}
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Birth Date:</label>
                <input
                  type="date"
                  value={patient.birthdate}
                  onChange={(e) => handleInputChange('birthdate', e.target.value)}
                  className={styles.input}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Blood Type:</label>
                <select
                  value={patient.blood_type}
                  onChange={(e) => handleInputChange('blood_type', e.target.value)}
                  className={styles.input}
                >
                  <option value="">Select blood type</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>
            </>
          ) : (
            <>
              <p><strong>Gender:</strong> {patient.gender || 'Not specified'}</p>
              <p><strong>Birthdate:</strong> {patient.birthdate || 'Not specified'}</p>
              <p><strong>Blood Type:</strong> {patient.blood_type || 'Not specified'}</p>
            </>
          )}
        </div>

        <div className={styles.card}>
          <h3>Address</h3>
          {editing ? (
            <div className={styles.formGroup}>
              <label>Address:</label>
              <textarea
                value={patient.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className={styles.textarea}
                rows="3"
              />
            </div>
          ) : (
            <p>{patient.address || 'No address on file'}</p>
          )}
        </div>

        <div className={styles.card}>
          <h3>Medical History</h3>
          {editing ? (
            <div className={styles.formGroup}>
              <label>Medical History:</label>
              <textarea
                value={patient.medical_history}
                onChange={(e) => handleInputChange('medical_history', e.target.value)}
                className={styles.textarea}
                rows="4"
                placeholder="Enter medical history, allergies, medications, etc."
              />
            </div>
          ) : (
            <p>{patient.medical_history || 'No medical history on file'}</p>
          )}
        </div>

        <div className={styles.card}>
          <h3>Emergency Contact</h3>
          <p><strong>Name:</strong> {patient.emergency_contact?.name || 'Not specified'}</p>
          <p><strong>Phone:</strong> {patient.emergency_contact?.phone || 'Not specified'}</p>
          <p><strong>Relationship:</strong> {patient.emergency_contact?.relationship || 'Not specified'}</p>
        </div>

      </div>
    </div>
  );
}
