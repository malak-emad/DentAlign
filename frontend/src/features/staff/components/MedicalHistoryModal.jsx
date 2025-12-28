import React, { useState, useEffect } from "react";
import styles from "./MedicalHistoryModal.module.css";
import { staffApi } from "../api/staffApi";

export default function MedicalHistoryModal({ patient, onClose }) {
  const [medicalHistory, setMedicalHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMedicalHistory = async () => {
      // Handle different patient object structures
      const patientId = patient?.raw?.patient || patient?.patient_id;
      
      if (!patientId) {
        console.log('No patient ID found');
        console.log('Patient object:', patient);
        return;
      }

      console.log('Fetching medical history for patient:', patientId);
      console.log('Patient object:', patient);

      try {
        setLoading(true);
        console.log('Patient ID being used:', patientId, typeof patientId);

        // Fetch medical history data
        const [chronicConditions, allergies, pastSurgeries, appointments, diagnoses, allTreatments] = await Promise.all([
          staffApi.getChronicConditions(patientId),
          staffApi.getAllergies(patientId),
          staffApi.getPastSurgeries(patientId),
          staffApi.getAppointments({ patient: patientId }),
          staffApi.getDiagnoses({ patient_id: patientId }),
          staffApi.getTreatments({ patient_id: patientId })
        ]);

        console.log('Raw API responses:', {
          chronicConditions,
          allergies,
          pastSurgeries,
          appointments,
          diagnoses,
          allTreatments
        });

        console.log('API responses:', {
          chronicConditions: chronicConditions?.length || 0,
          allergies: allergies?.length || 0,
          pastSurgeries: pastSurgeries?.length || 0,
          appointments: appointments?.length || 0,
          diagnoses: diagnoses?.length || 0,
          allTreatments: allTreatments?.length || 0
        });

        // Handle API response format for all medical history data
        let conditionsArray = [];
        if (Array.isArray(chronicConditions)) {
          conditionsArray = chronicConditions;
        } else if (chronicConditions?.results) {
          conditionsArray = chronicConditions.results;
        }

        let allergiesArray = [];
        if (Array.isArray(allergies)) {
          allergiesArray = allergies;
        } else if (allergies?.results) {
          allergiesArray = allergies.results;
        }

        let surgeriesArray = [];
        if (Array.isArray(pastSurgeries)) {
          surgeriesArray = pastSurgeries;
        } else if (pastSurgeries?.results) {
          surgeriesArray = pastSurgeries.results;
        }

        let appointmentsArray = [];
        if (Array.isArray(appointments)) {
          appointmentsArray = appointments;
        } else if (appointments?.results) {
          appointmentsArray = appointments.results;
        }

        let diagnosesArray = [];
        if (Array.isArray(diagnoses)) {
          diagnosesArray = diagnoses;
        } else if (diagnoses?.results) {
          diagnosesArray = diagnoses.results;
        }

        let treatmentsArray = [];
        if (Array.isArray(allTreatments)) {
          treatmentsArray = allTreatments;
        } else if (allTreatments?.results) {
          treatmentsArray = allTreatments.results;
        }

        // Extract medications from diagnoses notes
        const medications = diagnosesArray
          .filter(diagnosis => diagnosis.notes && diagnosis.notes.trim())
          .map(diagnosis => diagnosis.notes.trim())
          .filter(note => note.length > 0);

        // Get recent procedures from appointments and treatments
        const recentProcedures = [];
        const appointmentMap = new Map(appointmentsArray.map(apt => [apt.appointment_id, apt]));

        // Group treatments by appointment
        const treatmentsByAppointment = {};
        treatmentsArray.forEach(treatment => {
          const aptId = treatment.appointment;
          if (!treatmentsByAppointment[aptId]) {
            treatmentsByAppointment[aptId] = [];
          }
          treatmentsByAppointment[aptId].push(treatment);
        });

        // Get recent procedures (last 10 appointments with treatments)
        Object.entries(treatmentsByAppointment)
          .sort(([, a], [, b]) => {
            const dateA = new Date(a[0]?.appointment_date || a[0]?.start_time || '1970-01-01');
            const dateB = new Date(b[0]?.appointment_date || b[0]?.start_time || '1970-01-01');
            return dateB - dateA;
          })
          .slice(0, 10)
          .forEach(([aptId, treatments]) => {
            const appointment = appointmentMap.get(aptId);
            if (appointment) {
              treatments.forEach(treatment => {
                if (treatment.service_name) {
                  recentProcedures.push({
                    date: appointment.appointment_date || appointment.start_time,
                    procedure: treatment.service_name,
                    notes: treatment.notes || ''
                  });
                } else if (treatment.service && treatment.service.name) {
                  recentProcedures.push({
                    date: appointment.appointment_date || appointment.start_time,
                    procedure: treatment.service.name,
                    notes: treatment.notes || ''
                  });
                }
              });
            }
          });

        setMedicalHistory({
          conditions: conditionsArray,
          allergies: allergiesArray,
          pastSurgeries: surgeriesArray,
          medications: medications,
          recentProcedures: recentProcedures
        });
        setError(null);
      } catch (err) {
        console.error('Error fetching medical history:', err);
        setError('Failed to load medical history');
      } finally {
        setLoading(false);
      }
    };

    fetchMedicalHistory();
  }, [patient]);

  if (loading) {
    return (
      <div className={styles.overlay}>
        <div className={styles.modal}>
          <div className={styles.header}>
            <h2>Medical History - {patient?.name}</h2>
            <button className={styles.closeBtn} onClick={onClose}>×</button>
          </div>
          <div className={styles.content}>
            <p>Loading medical history...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.overlay}>
        <div className={styles.modal}>
          <div className={styles.header}>
            <h2>Medical History - {patient?.name}</h2>
            <button className={styles.closeBtn} onClick={onClose}>×</button>
          </div>
          <div className={styles.content}>
            <p className={styles.error}>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>Medical History - {patient?.name}</h2>
          <button className={styles.closeBtn} onClick={onClose}>×</button>
        </div>

        <div className={styles.content}>
          {/* Conditions */}
          <div className={styles.section}>
            <h3>Conditions</h3>
            <ul className={styles.list}>
              {medicalHistory?.conditions?.length > 0 ? (
                medicalHistory.conditions.map((condition, index) => (
                  <li key={index}>{condition.condition_name || condition.name}</li>
                ))
              ) : (
                <li>No chronic conditions recorded</li>
              )}
            </ul>
          </div>

          {/* Allergies & Past Surgeries */}
          <div className={styles.section}>
            <h3>Allergies</h3>
            <ul className={styles.list}>
              {medicalHistory?.allergies?.length > 0 ? (
                medicalHistory.allergies.map((allergy, index) => (
                  <li key={index}>{allergy.allergen_name || allergy.name}</li>
                ))
              ) : (
                <li>No allergies recorded</li>
              )}
            </ul>

            <h3>Past Surgeries</h3>
            <ul className={styles.list}>
              {medicalHistory?.pastSurgeries?.length > 0 ? (
                medicalHistory.pastSurgeries.map((surgery, index) => (
                  <li key={index}>
                    {surgery.procedure_name || surgery.name} - {surgery.surgery_date || 'Date not specified'}
                  </li>
                ))
              ) : (
                <li>No past surgeries recorded</li>
              )}
            </ul>
          </div>

          {/* Recent Procedures */}
          <div className={styles.section}>
            <h3>Recent Procedures</h3>
            <ul className={styles.list}>
              {medicalHistory?.recentProcedures?.length > 0 ? (
                medicalHistory.recentProcedures.map((procedure, index) => (
                  <li key={index}>
                    {procedure.procedure} - {new Date(procedure.date).toLocaleDateString()}
                    {procedure.notes && ` (${procedure.notes})`}
                  </li>
                ))
              ) : (
                <li>No recent procedures recorded</li>
              )}
            </ul>
          </div>

          {/* Medications */}
          <div className={styles.section}>
            <h3>Medications</h3>
            <ul className={styles.list}>
              {medicalHistory?.medications?.length > 0 ? (
                medicalHistory.medications.map((medication, index) => (
                  <li key={index}>{medication}</li>
                ))
              ) : (
                <li>No medications recorded</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}