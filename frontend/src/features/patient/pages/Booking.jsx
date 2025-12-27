// src/features/patient/pages/Booking.jsx
import React, { useMemo, useState, useEffect } from "react";
import styles from "./Booking.module.css";
import { patientApi } from "../api/patientApi";

const SERVICES = [
  { id: "orthodontics", title: "Orthodontics", subtitle: "Braces, aligners & adjustments", duration_mins: 30 },
  { id: "cleaning", title: "Dental Cleaning", subtitle: "Scale & polish", duration_mins: 45 },
  { id: "consultation", title: "Consultation", subtitle: "New patient consult / exam", duration_mins: 20 },
  { id: "root_canal", title: "Root Canal", subtitle: "Endodontic treatment", duration_mins: 60 },
  { id: "radiology", title: "Radiology (X‑Ray)", subtitle: "In‑house imaging", duration_mins: 15 },
];

export default function Booking() {
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [bookingData, setBookingData] = useState(null);

  const [doctors, setDoctors] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [doctorsLoading, setDoctorsLoading] = useState(false);
  const [bookingInProgress, setBookingInProgress] = useState(false);
  const [error, setError] = useState(null);

  /* ---------------- Fetch doctors ---------------- */
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setDoctorsLoading(true);
        const response = await patientApi.getAvailableDoctors();
        setDoctors(response.doctors || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load doctors");
      } finally {
        setDoctorsLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  /* ---------------- Fetch slots ---------------- */
  useEffect(() => {
    const fetchSlots = async () => {
      if (!selectedDoctor || !date) {
        setAvailableSlots([]);
        return;
      }

      try {
        const response = await patientApi.getAvailableSlots(
          selectedDoctor.id,
          date
        );
        setAvailableSlots(response.slots || []);
        setSlot("");
      } catch (err) {
        console.error(err);
        setAvailableSlots([]);
      }
    };

    fetchSlots();
  }, [selectedDoctor, date]);

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
      setError("Please complete all fields");
      return;
    }

    try {
      setBookingInProgress(true);

      await patientApi.bookAppointment({
        service: selectedService.id,
        doctor_id: selectedDoctor.id,
        date,
        time: slot,
        reason: selectedService.title,
      });

      setBookingData({
        service: selectedService.title,
        doctor: selectedDoctor.name,
        date,
        time: slot,
      });

      setConfirmed(true);
    } catch (err) {
      console.error(err);
      setError("Failed to book appointment");
    } finally {
      setBookingInProgress(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Book Appointment</h1>

      {error && (
        <div className={styles.errorBanner}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {doctorsLoading && (
        <div className={styles.loadingIndicator}>Loading doctors...</div>
      )}

      <div className={styles.layout}>
        {/* LEFT */}
        <section className={styles.left}>
          {/* 1. Service */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>1. Choose service</h2>
            <div className={styles.servicesGrid}>
              {SERVICES.map((s) => (
                <button
                  key={s.id}
                  className={`${styles.serviceCard} ${
                    selectedService?.id === s.id ? styles.selectedCard : ""
                  }`}
                  onClick={() => setSelectedService(s)}
                >
                  <div className={styles.serviceTitle}>{s.title}</div>
                  <div className={styles.serviceSubtitle}>{s.subtitle}</div>
                  <div className={styles.serviceDuration}>
                    {s.duration_mins} min
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Doctor */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>2. Choose doctor</h2>
            <ul className={styles.doctorList}>
              {doctors.map((doc) => (
                <li key={doc.id} className={styles.doctorRow}>
                  <button
                    className={`${styles.doctorBtn} ${
                      selectedDoctor?.id === doc.id
                        ? styles.selectedDoctor
                        : ""
                    }`}
                    onClick={() => setSelectedDoctor(doc)}
                  >
                    <div className={styles.avatar}>
                      {doc.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </div>
                    <div className={styles.doctorInfo}>
                      <div className={styles.doctorName}>{doc.name}</div>
                      <div className={styles.doctorSpec}>{doc.specialty}</div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* 3. Date */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>3. Choose date</h2>
            <input
              type="date"
              className={styles.dateInput}
              value={date}
              min={new Date().toISOString().slice(0, 10)}
              onChange={(e) => {
                setDate(e.target.value);
                setSlot("");
              }}
            />
          </div>

          {/* 4. Time */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>4. Choose time</h2>
            {availableSlots.length === 0 && (
              <p className={styles.hint}>No available slots</p>
            )}
            <div className={styles.slots}>
              {availableSlots.map((t) => (
                <button
                  key={t}
                  className={`${styles.slotBtn} ${
                    slot === t ? styles.slotSelected : ""
                  }`}
                  onClick={() => setSlot(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* RIGHT */}
        <aside className={styles.right}>
          <div className={styles.summary}>
            <h3 className={styles.summaryTitle}>Appointment Summary</h3>

            <div className={styles.summaryRow}>
              <span>Service</span>
              <strong>{selectedService?.title || "—"}</strong>
            </div>
            <div className={styles.summaryRow}>
              <span>Doctor</span>
              <strong>{selectedDoctor?.name || "—"}</strong>
            </div>
            <div className={styles.summaryRow}>
              <span>Date</span>
              <strong>{date || "—"}</strong>
            </div>
            <div className={styles.summaryRow}>
              <span>Time</span>
              <strong>{slot || "—"}</strong>
            </div>

            <div className={styles.controls}>
              <button
                className={styles.confirmBtn}
                onClick={handleConfirm}
                disabled={
                  !(selectedService && selectedDoctor && date && slot) ||
                  bookingInProgress
                }
              >
                {bookingInProgress ? "Booking..." : "Confirm Appointment"}
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
                <div>
                  Date: {bookingData.date} at {bookingData.time}
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
