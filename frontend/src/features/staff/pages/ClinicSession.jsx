import React, { useState } from "react";
import styles from "./ClinicSession.module.css";

import PatientsTable from "../components/PatientsTable";
import CurrentPatientCard from "../components/CurrentPatientCard";
import VisitTimer from "../components/VisitTimer";
import PrescriptionModal from "../components/PrescriptionModal";

export default function ClinicSession() {
  const [currentPatient, setCurrentPatient] = useState(null);
  const [showPrescription, setShowPrescription] = useState(false);
  const [visitDuration, setVisitDuration] = useState(0);

  // ✅ STATE (not constants)
  const [seenToday, setSeenToday] = useState([
    { id: 1, name: "Sara Mohamed", time: "09:00 AM" },
    { id: 2, name: "Ahmed Salah", time: "10:30 AM" }
  ]);

  const [upcoming, setUpcoming] = useState([
    { id: 3, name: "Omar Ali", time: "11:00 AM" },
    { id: 4, name: "Mona Adel", time: "11:30 AM" }
  ]);

  // ▶️ Start visit
  const startVisit = (patient) => {
    setCurrentPatient({
      ...patient,
      startTime: new Date().toLocaleTimeString()
    });

    //Remove from upcoming
    setUpcoming((prev) => prev.filter((p) => p.id !== patient.id));

    setVisitDuration(0);
  };

  //End visit → open prescription
  const endVisit = () => {
    setShowPrescription(true);
  };

  // Finish prescription → move to seen today
  const closePrescription = () => {
    if (currentPatient) {
      setSeenToday((prev) => [
        ...prev,
        {
          id: currentPatient.id,
          name: currentPatient.name,
          time: formatTimeWithoutSeconds(new Date())
        }
      ]);
    }

    setShowPrescription(false);
    setCurrentPatient(null);
  };

  const formatTimeWithoutSeconds = (date) => {
    return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    });
    };

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Clinic Session</h1>

      <div className={styles.layout}>
        {/* LEFT SIDE */}
        <div className={styles.leftColumn}>
          <div className={styles.section}>
            <PatientsTable
              title="Upcoming Patients"
              patients={upcoming}
              type="action"
              onAction={startVisit}
            />
          </div>

          <div className={styles.section}>
            <PatientsTable
              title="Patients Seen Today"
              patients={seenToday}
              type="view"
            />
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className={styles.rightColumn}>
          {currentPatient ? (
            <>
              <CurrentPatientCard
                patient={currentPatient}
                onEndVisit={endVisit}
              />

              <VisitTimer
                onTick={(seconds) => setVisitDuration(seconds)}
              />
            </>
          ) : (
            <div className={styles.emptyState}>
              Select a patient to start the visit
            </div>
          )}
        </div>
      </div>

      {/* PRESCRIPTION MODAL */}
      {showPrescription && (
        <PrescriptionModal
          patient={currentPatient}
          duration={visitDuration}
          onClose={closePrescription}
        />
      )}
    </div>
  );
}
