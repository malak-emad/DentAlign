import React, { useState, useEffect, useCallback } from "react";
import styles from "./ClinicSession.module.css";
import PatientsTable from "../components/PatientsTable";
import CurrentPatientCard from "../components/CurrentPatientCard";
import VisitTimer from "../components/VisitTimer";
import PrescriptionModal from "../components/PrescriptionModal";
import { staffApi } from "../api/staffApi";

export default function ClinicSession() {
  const [currentPatient, setCurrentPatient] = useState(null);
  const [showPrescription, setShowPrescription] = useState(false);

  // ✅ ADDED (medical history popup)
  const [showMedicalHistory, setShowMedicalHistory] = useState(false);

  const [visitDuration, setVisitDuration] = useState(0);
  const [upcoming, setUpcoming] = useState([]);
  const [seenToday, setSeenToday] = useState([]);
  const [treatmentsMap, setTreatmentsMap] = useState({});
  const [visitStartTime, setVisitStartTime] = useState(null);

  // =========================
  // MOCKED MEDICAL HISTORY
  // =========================
  const mockMedicalHistory = {
    conditions: ["Hypertension", "Type 2 Diabetes"],
    allergies: ["Penicillin", "Peanuts"],
    medications: [
      { name: "Metformin", dose: "500 mg", frequency: "Twice daily" },
      { name: "Amlodipine", dose: "5 mg", frequency: "Once daily" }
    ],
    surgeries: [{ name: "Appendectomy", year: 2018 }],
    familyHistory: ["Heart Disease (Father)", "Diabetes (Mother)"],
    lifestyle: {
      smoking: "Non-smoker",
      alcohol: "Occasional",
      exercise: "Moderate"
    },
    notes: "Patient advised regular blood sugar monitoring.",
    lastUpdated: "2024-11-12"
  };

  const handleTick = useCallback((seconds) => {
    setVisitDuration(seconds);
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        // Get staff_id safely
        let staffId = localStorage.getItem("staff_id");
        console.log("ClinicSession: initial staffId from localStorage =", staffId);

        if (!staffId || staffId === "null" || staffId === "undefined") {
          const user = JSON.parse(localStorage.getItem("user") || "{}");
          staffId = user?.staff_id;
          console.log("ClinicSession: staffId from user object =", staffId);
        }

        if (!staffId || staffId === "null" || staffId === "undefined") {
          try {
            const profile = await staffApi.getProfile();
            if (profile?.staff_id) {
              staffId = profile.staff_id;
              localStorage.setItem("staff_id", staffId);
              console.log("ClinicSession: staffId from profile =", staffId);
            }
          } catch (err) {
            console.error("Failed to fetch profile for staff_id", err);
          }
        }

        if (!staffId) {
          console.error("No staff_id found — cannot fetch appointments");
          return;
        }

        const nowISO = new Date().toISOString();
        console.log("Fetching appointments with staff:", staffId, "start_time__gte:", nowISO);

        let resp;
        try {
          resp = await staffApi.getAppointments({
            staff: staffId,
            start_time__gte: nowISO
          });
        } catch (err) {
          console.error("Error fetching appointments:", err);
          setUpcoming([]);
          setSeenToday([]);
          return;
        }

        const appointmentsList = Array.isArray(resp)
          ? resp
          : resp.results || [];

        console.log("Raw appointments response:", resp);
        console.log("appointmentsList length:", appointmentsList.length);

        const formatTime = (a) => {
          const dt = a.appointment_date || a.start_time || null;
          if (!dt) return "Time TBD";
          try {
            const d = new Date(dt);
            if (isNaN(d.getTime())) return "Time TBD";
            if (d.getUTCHours() === 0 && d.getUTCMinutes() === 0) {
              return "Time TBD";
            }
            return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
          } catch {
            return "Time TBD";
          }
        };

        let localTreatmentsMap = {};
        if (appointmentsList.length > 0) {
          try {
            const treatmentsResp = await staffApi.getTreatments({});
            let treatments = [];

            if (Array.isArray(treatmentsResp)) {
              treatments = treatmentsResp;
            } else if (treatmentsResp?.results) {
              treatments = treatmentsResp.results;
            }

            treatments.forEach(t => {
              let aptId = t.appointment_id || t.appointment;
              if (typeof aptId === "string" && aptId.includes("/")) {
                const parts = aptId.split("/");
                aptId = parts[parts.length - 2];
              }
              if (aptId && appointmentsList.some(a => a.appointment_id === aptId)) {
                if (!localTreatmentsMap[aptId]) localTreatmentsMap[aptId] = [];
                localTreatmentsMap[aptId].push(t);
              }
            });

            setTreatmentsMap(localTreatmentsMap);
          } catch (err) {
            console.error("Failed to load treatments:", err);
          }
        }

        const upcomingList = appointmentsList
          .filter(a => ["scheduled", "confirmed"].includes(a.status))
          .map(a => ({
            id: a.appointment_id,
            name: a.patient_name || "Unknown Patient",
            time: formatTime(a),
            services: a.reason || "General Consultation",
            raw: a
          }));

        const seenList = appointmentsList
          .filter(a => ["completed", "in_progress"].includes(a.status))
          .map(a => ({
            id: a.appointment_id,
            name: a.patient_name || "Unknown Patient",
            time: formatTime(a),
            services:
              (localTreatmentsMap[a.appointment_id] || [])
                .map(t => t.service_name || t.description || "Service")
                .filter(Boolean)
                .join(", ") || "No services recorded",
            raw: a
          }));

        setUpcoming(upcomingList);
        setSeenToday(seenList);
      } catch (err) {
        console.error("Unexpected error in fetchData:", err);
        setUpcoming([]);
        setSeenToday([]);
      }
    }

    fetchData();
  }, []);

  const startVisit = (patient) => {
    setCurrentPatient(patient);
    setUpcoming(prev => prev.filter(p => p.id !== patient.id));
    setVisitDuration(0);
    setVisitStartTime(new Date());
  };

  const endVisit = async () => {
    if (!currentPatient) return;
    try {
      await staffApi.updateAppointment(currentPatient.raw.appointment_id, {
        status: "completed",
        end_time: new Date().toISOString()
      });
      setShowPrescription(true);
    } catch (error) {
      console.error("Failed to end visit:", error);
      setShowPrescription(true);
    }
  };

  const closePrescription = () => {
    if (currentPatient) {
      setSeenToday(prev => [...prev, currentPatient]);
    }
    setShowPrescription(false);
    setCurrentPatient(null);
  };

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Clinic Session</h1>

      <div className={styles.layout}>
        <div className={styles.leftColumn}>
          <div className={styles.section}>
            <PatientsTable
              title="Upcoming Patients"
              patients={upcoming}
              type="action"
              onAction={startVisit}
              onShowMedicalHistory={() => setShowMedicalHistory(true)}
            />
          </div>

          <div className={styles.section}>
            <PatientsTable
              title="Patients Seen Today"
              patients={seenToday}
              type="view"
              onShowMedicalHistory={() => setShowMedicalHistory(true)}
            />
          </div>
        </div>

        <div className={styles.rightColumn}>
          {currentPatient ? (
            <>
              <CurrentPatientCard
                patient={currentPatient}
                onEndVisit={endVisit}
                startTime={visitStartTime}
                onShowMedicalHistory={() => setShowMedicalHistory(true)} // ✅ ONLY ADDITION
              />
              <VisitTimer onTick={handleTick} />
            </>
          ) : (
            <div className={styles.emptyState}>
              Select a patient to start the visit
            </div>
          )}
        </div>
      </div>

      {/* ================= MEDICAL HISTORY MODAL ================= */}
      {showMedicalHistory && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2>Medical History</h2>

            <section>
              <strong>Conditions</strong>
              <ul>
                {mockMedicalHistory.conditions.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </section>

            <section>
              <strong>Allergies</strong>
              <ul>
                {mockMedicalHistory.allergies.map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </ul>
            </section>

            <section>
              <strong>Medications</strong>
              <ul>
                {mockMedicalHistory.medications.map((m, i) => (
                  <li key={i}>
                    {m.name} – {m.dose} ({m.frequency})
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <strong>Clinical Notes</strong>
              <p>{mockMedicalHistory.notes}</p>
            </section>

            <button onClick={() => setShowMedicalHistory(false)}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* ================= PRESCRIPTION MODAL ================= */}
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
