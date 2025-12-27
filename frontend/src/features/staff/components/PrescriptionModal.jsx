import React, { useState } from "react";
import styles from "./PrescriptionModal.module.css";
import ServiceSelector from "./ServiceSelector";
import { staffApi } from "../api/staffApi";

export default function PrescriptionModal({ patient, duration, onClose }) {
  const [notes, setNotes] = useState("");
  const [radiology, setRadiology] = useState("no");
  const [medications, setMedications] = useState([""]);
  const [selectedServices, setSelectedServices] = useState([]);

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

      // 2. Create medical record
      const medicalRecord = await staffApi.createMedicalRecord({
        patient: patient.raw.patient,
        created_by: patient.raw.staff,
        notes: notes,
      });

      // 3. Update appointment to link the medical record
      await staffApi.updateAppointment(patient.raw.appointment_id, {
        medical_record: medicalRecord.record_id,
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
          <h4>Radiology / X‑Ray</h4>

          <div className={styles.radioGroup}>
            <label>
              <input
                type="radio"
                name="radiology"
                checked={radiology === "no"}
                onChange={() => setRadiology("no")}
              />
              Not required
            </label>

            <label>
              <input
                type="radio"
                name="radiology"
                checked={radiology === "yes"}
                onChange={() => setRadiology("yes")}
              />
              Required
            </label>
          </div>
        </div>

        {/* NOTES */}
        <div className={styles.section}>
          <h4>Doctor Notes</h4>
          <textarea
            placeholder="Additional notes or instructions..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
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
