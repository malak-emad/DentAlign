// src/features/patient/pages/Booking.jsx
import React, { useMemo, useState, useEffect } from "react";
import styles from "./Booking.module.css";
import { patientApi } from "../api/patientApi";

export default function Booking() {
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [bookingData, setBookingData] = useState(null);

  const [services, setServices] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [doctorsLoading, setDoctorsLoading] = useState(false);
  const [bookingInProgress, setBookingInProgress] = useState(false);
  const [error, setError] = useState(null);

  const totalCost = selectedServices.reduce((sum, s) => sum + parseFloat(s.price || 0), 0);

  /* ---------------- Fetch services ---------------- */
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setServicesLoading(true);
        const response = await patientApi.getAvailableServices();
        setServices(response || []);
      } catch (err) {
        console.error('Error fetching services:', err);
        setError("Failed to load services");
      } finally {
        setServicesLoading(false);
      }
    };

    fetchServices();
  }, []);

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
    setSelectedServices([]);
    setSelectedDoctor(null);
    setDate("");
    setSlot("");
    setConfirmed(false);
    setBookingData(null);
    setError(null);
  }

  const handleConfirm = async () => {
    if (selectedServices.length === 0 || !selectedDoctor || !date || !slot) {
      setError("Please complete all fields");
      return;
    }

    try {
      setBookingInProgress(true);

      const response = await patientApi.bookAppointment({
        service_ids: selectedServices.map(s => s.id),
        doctor_id: selectedDoctor.id,
        date,
        time: slot,
        reason: selectedServices.map(s => s.title).join(', '),
      });

      setBookingData({
        service: response.appointment.services.join(', '),
        doctor: response.appointment.doctor_name,
        date: response.appointment.date,
        time: response.appointment.time,
        totalCost,
        message: response.message,
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
            <h2 className={styles.sectionTitle}>1. Choose services</h2>
            {servicesLoading ? (
              <p>Loading services...</p>
            ) : (
              <div className={styles.servicesGrid}>
                {services.map((s) => (
                  <div
                    key={s.id}
                    className={`${styles.serviceCard} ${selectedServices.some(sel => sel.id === s.id) ? styles.selectedCard : ""}`}
                    onClick={() => {
                      if (selectedServices.some(sel => sel.id === s.id)) {
                        setSelectedServices(selectedServices.filter(sel => sel.id !== s.id));
                      } else {
                        setSelectedServices([...selectedServices, s]);
                      }
                    }}
                  >
                    <div className={styles.serviceTitle}>{s.title}</div>
                    <div className={styles.serviceSubtitle}>{s.subtitle}</div>
                    <div className={styles.serviceDuration}>
                      {s.duration_mins} min
                    </div>
                    <div className={styles.servicePrice}>
                      ${parseFloat(s.price).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            )}
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
              <strong>{selectedServices.length > 0 ? selectedServices.map(s => s.title).join(', ') : "—"}</strong>
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
            <div className={styles.summaryRow}>
              <span>Total Cost</span>
              <strong>${totalCost.toFixed(2)}</strong>
            </div>

            <div className={styles.controls}>
              <button
                className={styles.confirmBtn}
                onClick={handleConfirm}
                disabled={
                  selectedServices.length === 0 || !selectedDoctor || !date || !slot ||
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
                <strong>{bookingData.message}</strong>
                <div>Service: {bookingData.service}</div>
                <div>Doctor: {bookingData.doctor}</div>
                <div>
                  Date: {bookingData.date} at {bookingData.time}
                </div>
                <div>Total: ${bookingData.totalCost.toFixed(2)}</div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
