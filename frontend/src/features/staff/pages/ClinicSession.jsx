import React, { useState, useEffect } from "react";
import styles from "./ClinicSession.module.css";
import PatientsTable from "../components/PatientsTable";  // Adjust path if needed
import CurrentPatientCard from "../components/CurrentPatientCard";
import VisitTimer from "../components/VisitTimer";
import PrescriptionModal from "../components/PrescriptionModal";
import { staffApi } from "../api/staffApi";

export default function ClinicSession() {
  const [currentPatient, setCurrentPatient] = useState(null);
  const [showPrescription, setShowPrescription] = useState(false);
  const [visitDuration, setVisitDuration] = useState(0);
  const [upcoming, setUpcoming] = useState([]);
  const [seenToday, setSeenToday] = useState([]);
  const [treatmentsMap, setTreatmentsMap] = useState({});

  useEffect(() => {
    async function fetchData() {
      try {
        // Get staff_id safely
        let staffId = localStorage.getItem('staff_id');
        console.log('ClinicSession: initial staffId from localStorage =', staffId);

        if (!staffId || staffId === 'null' || staffId === 'undefined') {
          const user = JSON.parse(localStorage.getItem('user') || '{}');
          staffId = user?.staff_id;
          console.log('ClinicSession: staffId from user object =', staffId);
        }

        if (!staffId || staffId === 'null' || staffId === 'undefined') {
          try {
            const profile = await staffApi.getProfile();
            if (profile?.staff_id) {
              staffId = profile.staff_id;
              localStorage.setItem('staff_id', staffId);
              console.log('ClinicSession: staffId from profile =', staffId);
            }
          } catch (err) {
            console.error('Failed to fetch profile for staff_id', err);
          }
        }

        if (!staffId) {
          console.error('No staff_id found — cannot fetch appointments');
          return;
        }

        const nowISO = new Date().toISOString();
        console.log('Fetching appointments with staff:', staffId, 'start_time__gte:', nowISO);

        let resp;
        try {
          resp = await staffApi.getAppointments({ staff: staffId, start_time__gte: nowISO });
        } catch (err) {
          console.error('Error fetching appointments:', err);
          setUpcoming([]);
          setSeenToday([]);
          return;
        }

        const appointmentsList = Array.isArray(resp) ? resp : (resp.results || []);
        console.log('Raw appointments response:', resp);
        console.log('appointmentsList length:', appointmentsList.length);

        // ==================== SAFE DEBUG MAPPING (REPLACES EVERYTHING BELOW) ====================
                // RESTORED FUNCTIONALITY - SAFE VERSION
        console.log('Raw appointmentsList:', appointmentsList);

        // Helper to safely format time
        const formatTime = (a) => {
          const dt = a.appointment_date || a.start_time || null;
          if (!dt) return 'Time TBD';

          try {
            const d = new Date(dt);
            if (isNaN(d.getTime())) return 'Time TBD';

            // If time is midnight and likely date-only, show TBD
            if (d.getUTCHours() === 0 && d.getUTCMinutes() === 0) {
              return 'Time TBD';
            }
            return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          } catch (err) {
            console.warn('Time formatting error:', err, dt);
            return 'Time TBD';
          }
        };

        // Fetch treatments safely (only if there are appointments)
                // Fetch treatments safely
        let treatmentsMap = {};
        if (appointmentsList.length > 0) {
          try {
            // Remove any query params for now — just fetch all treatments (safe fallback)
            const treatmentsResp = await staffApi.getTreatments({});

            // Handle both direct array and paginated { results: [...] }
            let treatments = [];
            if (Array.isArray(treatmentsResp)) {
              treatments = treatmentsResp;
            } else if (treatmentsResp && Array.isArray(treatmentsResp.results)) {
              treatments = treatmentsResp.results;
            }

            console.log('Treatments fetched:', treatments);

            treatmentsMap = {};
            treatments.forEach(t => {
              let aptId = t.appointment_id || t.appointment;

              // If appointment is a URL, extract UUID
              if (typeof aptId === 'string' && aptId.includes('/')) {
                const parts = aptId.split('/');
                aptId = parts[parts.length - 2];  // second last part is UUID
              }

              if (aptId && appointmentsList.some(a => a.appointment_id === aptId)) {
                if (!treatmentsMap[aptId]) treatmentsMap[aptId] = [];
                treatmentsMap[aptId].push(t);
              }
            });

            console.log('Built treatmentsMap:', treatmentsMap);
            setTreatmentsMap(treatmentsMap);
          } catch (err) {
            console.error('Failed to load treatments:', err);
          }
        }

        const upcomingList = appointmentsList
          .filter(a => ['scheduled', 'confirmed'].includes(a.status))
          .map(a => ({
            id: a.appointment_id,
            name: a.patient_name || 'Unknown Patient',
            time: formatTime(a),
            nurse: a.nurse_name || '-',
            services: (treatmentsMap[a.appointment_id] || [])
              .map(t => t.description || t.treatment_code || 'Service')
              .filter(s => s && s !== 'Service')
              .join(', ') || 'Consultation',
            raw: a
          }));

        const seenList = appointmentsList
          .filter(a => ['completed', 'in_progress'].includes(a.status))
          .map(a => ({
            id: a.appointment_id,
            name: a.patient_name || 'Unknown Patient',
            time: formatTime(a),
            nurse: a.nurse_name || '-',
            services: (treatmentsMap[a.appointment_id] || [])
              .map(t => t.description || t.treatment_code || 'Service')
              .filter(s => s && s !== 'Service')
              .join(', ') || 'No services recorded',
            raw: a
          }));

        console.log('Final upcomingList:', upcomingList);
        console.log('Final seenList:', seenList);

        setUpcoming(upcomingList);
        setSeenToday(seenList);
        setTreatmentsMap(treatmentsMap);
        // =====================================================================================

      } catch (err) {
        console.error('Unexpected error in fetchData:', err);
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
  };

  const endVisit = () => {
    setShowPrescription(true);
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
        {/* LEFT SIDE */}
        <div className={styles.leftColumn}>
          <div className={styles.section}>
            <PatientsTable
              title="Upcoming Patients"
              patients={upcoming}
              type="action"
              onAction={startVisit}
            />
            {/* Debug output */}
            <pre style={{ background: '#f7f7f9', padding: 12, borderRadius: 8, marginTop: 12, maxHeight: 200, overflow: 'auto' }}>
              {JSON.stringify(upcoming, null, 2)}
            </pre>
          </div>

          <div className={styles.section}>
            <PatientsTable
              title="Patients Seen Today"
              patients={seenToday}
              type="view"
            />
            <pre style={{ background: '#f7f7f9', padding: 12, borderRadius: 8, marginTop: 12, maxHeight: 200, overflow: 'auto' }}>
              {JSON.stringify(seenToday, null, 2)}
            </pre>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className={styles.rightColumn}>
          {currentPatient ? (
            <>
              <CurrentPatientCard patient={currentPatient} onEndVisit={endVisit} />
              <VisitTimer onTick={(seconds) => setVisitDuration(seconds)} />
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