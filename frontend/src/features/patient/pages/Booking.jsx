// src/features/patient/pages/Booking.jsx
import React, { useMemo, useState, useEffect } from "react";
import styles from "./Booking.module.css";
import { patientApi } from "../api/patientApi";

/**
 * Notes:
 * - Uses hardcoded services with real backend API for doctors and booking
 * - This component expects to be rendered inside PatientLayout (so navbar/sidebar/header already present).
 */

const SERVICES = [
  { id: "orthodontics", title: "Orthodontics", subtitle: "Braces, aligners & adjustments", duration_mins: 30 },
  { id: "cleaning", title: "Dental Cleaning", subtitle: "Scale & polish", duration_mins: 45 },
  { id: "consultation", title: "Consultation", subtitle: "New patient consult / exam", duration_mins: 20 },
  { id: "root_canal", title: "Root Canal", subtitle: "Endodontic treatment", duration_mins: 60 },
  { id: "radiology", title: "Radiology (X‑Ray)", subtitle: "In‑house imaging", duration_mins: 15 },
];

export default function Booking() {
  const [mode, setMode] = useState("service"); // "service" | "doctor"
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [bookingData, setBookingData] = useState(null);

  // API data state
  const [doctors, setDoctors] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [doctorsLoading, setDoctorsLoading] = useState(false);
  const [bookingInProgress, setBookingInProgress] = useState(false);
  const [error, setError] = useState(null);

  // Fetch doctors when component mounts or mode/service changes
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setDoctorsLoading(true);
        // Don't filter by service for now - just get all doctors
        const response = await patientApi.getAvailableDoctors();
        setDoctors(response.doctors || []);
        setError(null);
      } catch (err) {
        setError('Failed to load doctors');
        console.error('Error fetching doctors:', err);
        setDoctors([]); // Set empty array on error
      } finally {
        setDoctorsLoading(false);
      }
    };

    fetchDoctors();
  }, []); // Only fetch once on mount, don't refetch on service change

  // Fetch available slots when doctor and date are selected
  useEffect(() => {
    const fetchSlots = async () => {
      if (!selectedDoctor || !date) {
        setAvailableSlots([]);
        return;
      }

      try {
        const response = await patientApi.getAvailableSlots(selectedDoctor.id, date);
        setAvailableSlots(response.slots || []);
        setSlot(""); // Reset selected slot
        setError(null);
      } catch (err) {
        console.error('Error fetching slots:', err);
        setAvailableSlots([]);
        // Don't show error for slots, just log it
      }
    };

    fetchSlots();
  }, [selectedDoctor, date]);

  // available doctors filtered by selected service (when booking by service)
  const filteredDoctors = useMemo(() => {
    // For now, show all doctors for all services since we haven't implemented doctor-service mapping
    return doctors;
  }, [doctors]);

  function resetBooking() {
    setSelectedService(null);
    setSelectedDoctor(null);
    setDate("");
    setSlot("");
    setConfirmed(false);
    setBookingData(null);
    setError(null);
  }

  const handleConfirm = async () => {
    if (!selectedService || !selectedDoctor || !date || !slot) {
      setError('Please select all required fields');
      return;
    }

    try {
      setBookingInProgress(true);
      setError(null);

      const appointmentData = {
        service: selectedService.id,
        doctor_id: selectedDoctor.id, 
        date: date,
        time: slot,
        reason: selectedService.title
      };

      const response = await patientApi.bookAppointment(appointmentData);

      // Success - show confirmation
      setBookingData({
        mode,
        service: selectedService.title,
        doctor: selectedDoctor.name,
        date,
        time: slot,
      });
      setConfirmed(true);
      setError(null);
      
    } catch (err) {
      setError(err.message || 'Failed to book appointment. Please try again.');
      console.error('Booking error:', err);
    } finally {
      setBookingInProgress(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Book Appointment</h1>

      {/* Error message */}
      {error && (
        <div className={styles.errorBanner}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Loading indicator */}
      {doctorsLoading && (
        <div className={styles.loadingIndicator}>
          Loading doctors...
        </div>
      )}

      {/* Mode Tabs */}
      <div className={styles.tabs} role="tablist">
        <button
          className={`${styles.tab} ${mode === "service" ? styles.activeTab : ""}`}
          onClick={() => setMode("service")}
          aria-pressed={mode === "service"}
        >
          By Service
        </button>
        <button
          className={`${styles.tab} ${mode === "doctor" ? styles.activeTab : ""}`}
          onClick={() => setMode("doctor")}
          aria-pressed={mode === "doctor"}
        >
          By Doctor
        </button>
      </div>

      <div className={styles.layout}>

        {/* LEFT: selection flow */}
        <section className={styles.left}>

          {/* STEP 1: Select Service (always visible - required for defaults) */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>1. Choose service</h2>
            <div className={styles.servicesGrid}>
              {SERVICES.map(s => {
                const selected = selectedService?.id === s.id;
                return (
                  <button
                    key={s.id}
                    className={`${styles.serviceCard} ${selected ? styles.selectedCard : ""}`}
                    onClick={() => { 
                      setSelectedService(s); 
                      // No need to reset doctor since all doctors can handle all services for now
                    }}
                    aria-pressed={selected}
                  >
                    <div className={styles.serviceTitle}>{s.title}</div>
                    <div className={styles.serviceSubtitle}>{s.subtitle}</div>
                    <div className={styles.serviceDuration}>{s.duration_mins} min</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 2: Select Doctor (depends on mode) */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>2. Choose doctor</h2>

            {mode === "service" && (
              <>
                <p className={styles.hint}>Doctors who handle {selectedService ? `"${selectedService.title}"` : "this service"}:</p>
                <ul className={styles.doctorList}>
                  {filteredDoctors.map(doc => (
                    <li key={doc.id} className={styles.doctorRow}>
                      <button
                        className={`${styles.doctorBtn} ${selectedDoctor?.id === doc.id ? styles.selectedDoctor : ""}`}
                        onClick={() => setSelectedDoctor(doc)}
                        disabled={doctorsLoading}
                      >
                        <div className={styles.avatar}>
                          {doc.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </div>
                        <div className={styles.doctorInfo}>
                          <div className={styles.doctorName}>{doc.name}</div>
                          <div className={styles.doctorSpec}>{doc.specialty}</div>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}

            {mode === "doctor" && (
              <>
                <p className={styles.hint}>Select a specific doctor (service will auto-filter).</p>
                <ul className={styles.doctorList}>
                  {doctors.map(doc => (
                    <li key={doc.id} className={styles.doctorRow}>
                      <button
                        className={`${styles.doctorBtn} ${selectedDoctor?.id === doc.id ? styles.selectedDoctor : ""}`}
                        onClick={() => { 
                          setSelectedDoctor(doc); 
                          // Auto-select first service if no service is selected
                          if (!selectedService && SERVICES.length > 0) {
                            setSelectedService(SERVICES[0]);
                          }
                        }}
                        disabled={doctorsLoading}
                      >
                        <div className={styles.avatar}>
                          {doc.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </div>
                        <div className={styles.doctorInfo}>
                          <div className={styles.doctorName}>{doc.name}</div>
                          <div className={styles.doctorSpec}>{doc.specialty}</div>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          {/* STEP 3: Date */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>3. Choose date</h2>
            <input
              type="date"
              className={styles.dateInput}
              value={date}
              onChange={(e) => { setDate(e.target.value); setSlot(""); }}
              min={new Date().toISOString().slice(0,10)} // block past dates
            />
            <p className={styles.hint}>Available times will appear after you choose a date.</p>
          </div>

          {/* STEP 4: Time slot */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>4. Choose time</h2>
            {!date && <p className={styles.hint}>Pick a date to see available time slots.</p>}
            {date && !selectedDoctor && <p className={styles.hint}>Pick a doctor to see available time slots.</p>}
            {date && selectedDoctor && (
              <div className={styles.slots}>
                {availableSlots.length === 0 && <div className={styles.hint}>No slots available for selected date</div>}
                {availableSlots.map(t => (
                  <button
                    key={t}
                    onClick={() => setSlot(t)}
                    className={`${styles.slotBtn} ${slot === t ? styles.slotSelected : ""}`}
                    aria-pressed={slot === t}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* RIGHT: Summary & confirm */}
        <aside className={styles.right}>
          <div className={styles.summary}>
            <h3 className={styles.summaryTitle}>Appointment Summary</h3>

            <div className={styles.summaryRow}><span>Mode</span><strong>{mode === "service" ? "By service" : "By doctor"}</strong></div>
            <div className={styles.summaryRow}><span>Service</span><strong>{selectedService ? selectedService.title : "—"}</strong></div>
            <div className={styles.summaryRow}><span>Doctor</span><strong>{selectedDoctor ? selectedDoctor.name : "—"}</strong></div>
            <div className={styles.summaryRow}><span>Date</span><strong>{date || "—"}</strong></div>
            <div className={styles.summaryRow}><span>Time</span><strong>{slot || "—"}</strong></div>

            <div className={styles.controls}>
              <button
                className={styles.confirmBtn}
                onClick={handleConfirm}
                disabled={!(selectedService && selectedDoctor && date && slot) || bookingInProgress}
                title={!(selectedService && selectedDoctor && date && slot) ? "Select service, doctor, date and time" : "Confirm appointment"}
              >
                {bookingInProgress ? 'Booking...' : 'Confirm Appointment'}
              </button>

              <button className={styles.resetBtn} onClick={resetBooking}>
                Reset
              </button>
            </div>

            {confirmed && bookingData && (
              <div className={styles.toast}>
                <strong>Confirmed!</strong>
                <div>Service: {bookingData.service}</div>
                <div>Doctor: {bookingData.doctor}</div>
                <div>Date: {bookingData.date} at {bookingData.time}</div>
                <div className={styles.successNote}>Your appointment has been successfully booked!</div>
              </div>
            )}
          </div>

          {/* Small help panel */}
          <div className={styles.infoBox}>
            <h4>Need help?</h4>
            <p>If you can't find a slot, try another date or choose "Book by doctor" if you prefer a specific clinician.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
