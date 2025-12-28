import React, { useState, useEffect } from "react";
import styles from "./PrescriptionModal.module.css";
import ServiceSelector from "./ServiceSelector";
import { staffApi } from "../api/staffApi";

export default function PrescriptionModal({ patient, duration, onClose }) {
  const [notes, setNotes] = useState("");
  const [outcome, setOutcome] = useState("");
  const [radiologyNeeded, setRadiologyNeeded] = useState(false);
  const [selectedNurse, setSelectedNurse] = useState("");
  const [medications, setMedications] = useState([""]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [nurses, setNurses] = useState([]);

  useEffect(() => {
    const fetchNurses = async () => {
      try {
        const nursesData = await staffApi.getNurses();
        setNurses(nursesData.results || nursesData); // Handle paginated response
      } catch (error) {
        console.error('Failed to fetch nurses:', error);
        setNurses([]); // Set empty array on error
      }
    };
    fetchNurses();
  }, []);

  const addMedication = () => {
    setMedications((prev) => [...prev, ""]);
  };

  const updateMedication = (index, value) => {
    setMedications((prev) =>
      prev.map((m, i) => (i === index ? value : m))
    );
  };

  const handleServiceSelection = (services) => {
    setSelectedServices(services);
  };

  const submit = async () => {
    try {
      // 1. Create treatments for selected services
      for (const serviceId of selectedServices) {
        await staffApi.createTreatment({
          appointment: patient.raw.appointment_id,
          service: serviceId,
          actual_cost: null, // Use default price
        });
      }

      // 1.5. Recalculate invoice total based on actual treatments
      await staffApi.recalculateInvoiceTotal(patient.raw.appointment_id);

      // 2. Create medical record
      const medicalRecordData = {
        patient: patient.raw.patient,
        staff: patient.raw.staff,
        created_by: patient.raw.staff,
        appointment: patient.raw.appointment_id,
        notes: notes,
        radiology_needed: radiologyNeeded,
        outcome: outcome,
      };
      
      console.log('Creating medical record with data:', medicalRecordData);
      
      const medicalRecord = await staffApi.createMedicalRecord(medicalRecordData);

      // 3. Update appointment to link the medical record and nurse
      await staffApi.updateAppointment(patient.raw.appointment_id, {
        medical_record: medicalRecord.record_id,
        nurse: selectedNurse || null,
      });

      // 4. Create diagnoses for medications
      for (const medication of medications.filter(m => m.trim())) {
        await staffApi.createDiagnosis({
          record: medicalRecord.record_id,
          notes: medication,
        });
      }

      console.log('Prescription saved successfully');
      onClose();
    } catch (error) {
      console.error('Failed to save prescription:', error);
      // Still close for now
      onClose();
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {/* HEADER */}
        <div className={styles.header}>
          <h2>Prescription</h2>
          <p>
            {patient.name} • Visit time: {Math.floor(duration / 60)} min
          </p>
        </div>

        {/* SERVICES */}
        <div className={styles.section}>
          <h4>Services Performed</h4>
          <ServiceSelector onSelectionChange={handleServiceSelection} />
        </div>

        {/* MEDICATIONS */}
        <div className={styles.section}>
          <h4>Medications</h4>

          {medications.map((med, index) => (
            <input
              key={index}
              type="text"
              className={styles.input}
              placeholder="Medication name & instructions"
              value={med}
              onChange={(e) =>
                updateMedication(index, e.target.value)
              }
            />
          ))}

          <button
            type="button"
            className={styles.addBtn}
            onClick={addMedication}
          >
            + Add medication
          </button>
        </div>

        {/* RADIOLOGY */}
        <div className={styles.section}>
          <h4>Radiology Required?</h4>
          <label>
            <input
              type="checkbox"
              checked={radiologyNeeded}
              onChange={(e) => setRadiologyNeeded(e.target.checked)}
            />
            Radiology / X-Ray required
          </label>
        </div>

        {/* NURSE */}
        <div className={styles.section}>
          <h4>Assisting Nurse</h4>
          <select
            value={selectedNurse}
            onChange={(e) => setSelectedNurse(e.target.value)}
            className={styles.input}
          >
            <option value="">Select Nurse (Optional)</option>
            {Array.isArray(nurses) && nurses.map((nurse) => (
              <option key={nurse.staff_id} value={nurse.staff_id}>
                {nurse.first_name} {nurse.last_name}
              </option>
            ))}
          </select>
        </div>

        {/* NOTES */}
        <div className={styles.section}>
          <h4>Doctor Diagnosis and Notes</h4>
          <textarea
            placeholder="Diagnosis and additional notes..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className={styles.textarea}
          />
        </div>

        {/* OUTCOME */}
        <div className={styles.section}>
          <h4>Outcome</h4>
          <textarea
            placeholder="Treatment outcome and follow-up instructions..."
            value={outcome}
            onChange={(e) => setOutcome(e.target.value)}
            className={styles.textarea}
          />
        </div>

        {/* ACTIONS */}
        <div className={styles.actions}>
          <button className={styles.cancel} onClick={onClose}>
            Cancel
          </button>
          <button className={styles.submit} onClick={submit}>
            Save Prescription
          </button>
        </div>
      </div>
    </div>
  );
}
