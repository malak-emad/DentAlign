// src/features/patient/pages/Booking.jsx
import React, { useMemo, useState } from "react";
import styles from "./Booking.module.css";

/**
 * Notes:
 * - Replace `SERVICES` and `DOCTORS` with API data when ready.
 * - This component expects to be rendered inside PatientLayout (so navbar/sidebar/header already present).
 */

const SERVICES = [
  { id: "orthodontics", title: "Orthodontics", subtitle: "Braces, aligners & adjustments", durationMins: 30 },
  { id: "cleaning", title: "Dental Cleaning", subtitle: "Scale & polish", durationMins: 45 },
  { id: "consultation", title: "Consultation", subtitle: "New patient consult / exam", durationMins: 20 },
  { id: "root_canal", title: "Root Canal", subtitle: "Endodontic treatment", durationMins: 60 },
  { id: "radiology", title: "Radiology (X‑Ray)", subtitle: "In‑house imaging", durationMins: 15 },
];

const DOCTORS = [
  { id: "d1", name: "Dr. Sarah Ahmed", specialty: "Orthodontist", services: ["orthodontics","consultation"], avatar: "/assets/doctors/dr1.jpg" },
  { id: "d2", name: "Dr. Mohamed Ali", specialty: "General Dentist", services: ["cleaning","consultation","root_canal"], avatar: "/assets/doctors/dr2.jpg" },
  { id: "d3", name: "Dr. Lina Hassan", specialty: "Radiologist", services: ["radiology"], avatar: "/assets/doctors/dr3.jpg" },
];

function generateSampleSlots(date) {
  // sample slots - in real app fetch available slots for doctor+date
  const base = ["08:30","09:00","09:30","10:00","10:45","11:30","13:00","14:30","15:15"];
  // pretend weekends have fewer slots
  const d = new Date(date);
  const isWeekend = [0,6].includes(d.getDay());
  return base.filter((_, i) => !isWeekend || i % 2 === 0);
}

export default function Booking() {
  const [mode, setMode] = useState("service"); // "service" | "doctor"
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [bookingData, setBookingData] = useState(null);

  // available doctors filtered by selected service (when booking by service)
  const filteredDoctors = useMemo(() => {
    if (!selectedService) return DOCTORS;
    return DOCTORS.filter(d => d.services.includes(selectedService.id));
  }, [selectedService]);

  const availableSlots = useMemo(() => {
    if (!date) return [];
    return generateSampleSlots(date);
  }, [date]);

  function resetBooking() {
    setSelectedService(null);
    setSelectedDoctor(null);
    setDate("");
    setSlot("");
    setConfirmed(false);
  }

  function handleConfirm() {
    // Basic front-end "confirm" — replace with API call to create appointment
    const payload = {
      mode,
      service: selectedService ? selectedService.title : null,
      doctor: selectedDoctor ? selectedDoctor.name : null,
      date,
      time: slot,
    };
    setBookingData(payload);
    setConfirmed(true);
    // Example: call API here and handle success/error
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Book Appointment</h1>

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
                    onClick={() => { setSelectedService(s); if (mode === "doctor") { /* keep doctor if assigned */ } }}
                    aria-pressed={selected}
                  >
                    <div className={styles.serviceTitle}>{s.title}</div>
                    <div className={styles.serviceSubtitle}>{s.subtitle}</div>
                    <div className={styles.serviceDuration}>{s.durationMins} min</div>
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
                      >
                        <img src={doc.avatar} alt={doc.name} className={styles.avatar}/>
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
                  {DOCTORS.map(doc => (
                    <li key={doc.id} className={styles.doctorRow}>
                      <button
                        className={`${styles.doctorBtn} ${selectedDoctor?.id === doc.id ? styles.selectedDoctor : ""}`}
                        onClick={() => { setSelectedDoctor(doc); /* optionally preselect a default service that doc supports */ setSelectedService(SERVICES.find(s => doc.services.includes(s.id)) || null); }}
                      >
                        <img src={doc.avatar} alt={doc.name} className={styles.avatar}/>
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
            {date && (
              <div className={styles.slots}>
                {availableSlots.length === 0 && <div className={styles.hint}>No slots found for selected date</div>}
                {availableSlots.map(t => (
                  <button
                    key={t}
                    onClick={() => setSlot(t)}
                    className={`${styles.slotBtn} ${slot === t ? styles.slotSelected : ""}`}
                    aria-pressed={slot === t}
                    disabled={!selectedDoctor && mode === "doctor"} // require doctor when booking by doctor
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
                disabled={!(selectedService && selectedDoctor && date && slot)}
                title={!(selectedService && selectedDoctor && date && slot) ? "Select service, doctor, date and time" : "Confirm appointment"}
              >
                Confirm Appointment
              </button>

              <button className={styles.resetBtn} onClick={resetBooking}>Reset</button>
            </div>

            {confirmed && bookingData && (
              <div className={styles.toast}>
                <strong>Confirmed!</strong>
                <div>Service: {bookingData.service}</div>
                <div>Doctor: {bookingData.doctor}</div>
                <div>Date: {bookingData.date} at {bookingData.time}</div>
                <div className={styles.successNote}>This is a demo confirmation (connect to backend to persist).</div>
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

  function handleConfirm() {
    const payload = {
      mode,
      service: selectedService?.title ?? null,
      doctor: selectedDoctor?.name ?? null,
      date,
      time: slot,
    };
    setBookingData(payload);
    setConfirmed(true);
    // TODO: call API (POST /appointments) then show server response / errors
  }
}
