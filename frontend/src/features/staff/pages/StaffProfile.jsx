import React, { useState, useEffect } from "react";
import { staffApi } from "../api/staffApi";
import styles from "./StaffProfile.module.css";

export default function DoctorProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await staffApi.getProfile();
        setProfile(data);
        setFormData({
          first_name: data.first_name,
          last_name: data.last_name,
          phone: data.phone,
          department: data.department,
        });
        setError(null);
      } catch (err) {
        console.error('Failed to fetch profile:', err);
        setError('Failed to load profile. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data to original profile data
    setFormData({
      first_name: profile.first_name,
      last_name: profile.last_name,
      phone: profile.phone,
      department: profile.department,
    });
  };

  const handleSave = async () => {
    try {
      await staffApi.updateProfile(formData);
      // Refresh profile data
      const updatedProfile = await staffApi.getProfile();
      setProfile(updatedProfile);
      setIsEditing(false);
      setError(null);
    } catch (err) {
      console.error('Failed to update profile:', err);
      setError('Failed to update profile. Please try again.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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
          <button onClick={() => window.location.reload()} className={styles.retryButton}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <p>Profile not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>

      {/* Header */}
      <div className={styles.header}>
        <div className={styles.avatarContainer}>
          <div className={styles.avatar}>
            {profile.first_name && profile.last_name 
              ? `${profile.first_name[0]}${profile.last_name[0]}` 
              : profile.email[0].toUpperCase()
            }
          </div>
        </div>

        <div className={styles.info}>
          <h2>{profile.full_name}</h2>
          <p className={styles.role}>
            {profile.role} {profile.specialty && `• ${profile.specialty}`}
          </p>
          <p className={styles.department}>
            Department: {profile.department || 'Not specified'}
          </p>
        </div>

        <div className={styles.actions}>
          {!isEditing ? (
            <button onClick={handleEdit} className={styles.editButton}>
              Edit Profile
            </button>
          ) : (
            <div className={styles.editActions}>
              <button onClick={handleSave} className={styles.saveButton}>
                Save
              </button>
              <button onClick={handleCancel} className={styles.cancelButton}>
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content Cards */}
      <div className={styles.cards}>
        <div className={styles.card}>
          <h3>Personal Information</h3>
          {!isEditing ? (
            <>
              <p><strong>Full Name:</strong> {profile.full_name}</p>
              <p><strong>Email:</strong> {profile.email}</p>
              <p><strong>Phone:</strong> {profile.phone || 'Not provided'}</p>
              <p><strong>Role:</strong> {profile.role}</p>
              <p><strong>Department:</strong> {profile.department || 'Not specified'}</p>
            </>
          ) : (
            <div className={styles.editForm}>
              <div className={styles.formGroup}>
                <label><strong>First Name:</strong></label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name || ''}
                  onChange={handleInputChange}
                  className={styles.input}
                />
              </div>
              <div className={styles.formGroup}>
                <label><strong>Last Name:</strong></label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name || ''}
                  onChange={handleInputChange}
                  className={styles.input}
                />
              </div>
              <div className={styles.formGroup}>
                <label><strong>Phone:</strong></label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone || ''}
                  onChange={handleInputChange}
                  className={styles.input}
                />
              </div>
              <div className={styles.formGroup}>
                <label><strong>Department:</strong></label>
                <input
                  type="text"
                  name="department"
                  value={formData.department || ''}
                  onChange={handleInputChange}
                  className={styles.input}
                />
              </div>
              <p><strong>Email:</strong> {profile.email} <span className={styles.note}>(Cannot be changed)</span></p>
              <p><strong>Role:</strong> {profile.role} <span className={styles.note}>(Cannot be changed)</span></p>
            </div>
          )}
        </div>

        <div className={styles.card}>
          <h3>Professional Information</h3>
          <p><strong>Staff ID:</strong> {profile.staff_id.slice(0, 8)}...</p>
          <p><strong>Hire Date:</strong> {profile.hire_date || 'Not specified'}</p>
          <p><strong>Experience:</strong> {profile.experience_years || 'Not specified'}</p>
          <p><strong>License:</strong> {profile.license_number || 'Not specified'}</p>
          <p><strong>Status:</strong> {profile.is_active ? 'Active' : 'Inactive'}</p>
        </div>

        {profile.address && (
          <div className={styles.card}>
            <h3>Address</h3>
            <p>{profile.address}</p>
          </div>
        )}

        {profile.bio && (
          <div className={styles.card}>
            <h3>Biography</h3>
            <p>{profile.bio}</p>
          </div>
        )}
      </div>
    </div>
  );
}
