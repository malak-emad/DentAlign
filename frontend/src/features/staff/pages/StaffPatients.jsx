import React, { useState, useEffect } from "react";
import styles from "./StaffPatients.module.css";
import { Link } from "react-router-dom";
import { staffApi } from "../api/staffApi";

export default function PatientsPage() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPatients, setFilteredPatients] = useState([]);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        const response = await staffApi.getPatients();
        // Handle paginated response
        const patientsData = response.results || response;
        setPatients(patientsData);
        setFilteredPatients(patientsData);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch patients:', err);
        setError('Failed to load patients. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  // Filter patients based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredPatients(patients);
    } else {
      const filtered = patients.filter(patient => 
        patient.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.phone.includes(searchTerm)
      );
      setFilteredPatients(filtered);
    }
  }, [searchTerm, patients]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Helper function to get initials from full name
  const getInitials = (fullName) => {
    if (!fullName) return '?';
    const names = fullName.trim().split(' ');
    if (names.length === 1) return names[0][0].toUpperCase();
    return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
  };

  // Helper function to format last appointment date
  const formatLastAppointment = (lastAppointment) => {
    if (!lastAppointment) return 'No previous visits';
    const date = new Date(lastAppointment);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading patients...</div>
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

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>Patients ({patients.length})</h1>
        
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search patients by name, email, or phone..."
            value={searchTerm}
            onChange={handleSearchChange}
            className={styles.searchInput}
          />
        </div>
      </div>

      {filteredPatients.length === 0 ? (
        <div className={styles.emptyState}>
          <p>{searchTerm ? 'No patients found matching your search.' : 'No patients found.'}</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {filteredPatients.map((patient) => (
            <Link
              to={`/staff/patient/${patient.patient_id}`}
              key={patient.patient_id}
              className={styles.card}
            >
              <div className={styles.patientAvatar}>
                {getInitials(patient.full_name)}
              </div>
              
              <div className={styles.patientInfo}>
                <h3 className={styles.patientName}>{patient.full_name}</h3>
                <p className={styles.patientAge}>Age: {patient.age || 'N/A'}</p>
                <p className={styles.patientEmail}>{patient.email}</p>
                <p className={styles.patientPhone}>{patient.phone || 'No phone'}</p>
                <p className={styles.lastAppointment}>
                  Last visit: {formatLastAppointment(patient.last_appointment)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
