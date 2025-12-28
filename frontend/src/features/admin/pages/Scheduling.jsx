import React, { useState, useEffect } from "react";
import { adminApi } from "../api/adminApi";
import styles from "./Scheduling.module.css";
import AppointmentsFilters from "../components/AppointmentsFilters";
import AppointmentsTable from "../components/AppointmentsTable";
import AppointmentDrawer from "../components/AppointmentDrawer";

export default function Scheduling() {
  const [activeTab, setActiveTab] = useState("patients"); // patients | doctors

  // ================= PATIENT SCHEDULING =================
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    date: "",
  });

  useEffect(() => {
    if (activeTab === "patients") {
      fetchSchedules();
    }
  }, [activeTab]);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getSchedules();

      const transformedAppointments =
        data.schedules?.map((schedule) => ({
          id: schedule.id,
          patient: schedule.patient_name,
          doctor: schedule.staff_name,
          service: schedule.service_name,
          date: schedule.date,
          time: schedule.time,
          status: schedule.status.toLowerCase(),
          paid:
            schedule.payment_status?.toLowerCase() === "paid" ||
            schedule.payment_status?.toLowerCase() === "completed",
          payment_status: schedule.payment_status,
          notes: schedule.notes,
          duration: schedule.duration,
        })) || [];

      setAppointments(transformedAppointments);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load schedules data");
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredAppointments = appointments.filter((a) => {
    const matchesSearch =
      a.patient.toLowerCase().includes(filters.search.toLowerCase()) ||
      a.doctor.toLowerCase().includes(filters.search.toLowerCase());

    const matchesStatus =
      filters.status === "all" || a.status === filters.status;

    const matchesDate = !filters.date || a.date === filters.date;

    return matchesSearch && matchesStatus && matchesDate;
  });

  const handleUpdateAppointment = (updated) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === updated.id ? updated : a))
    );
    setSelectedAppointment(null);
  };

  // ================= DOCTOR SCHEDULING =================
  const [doctors, setDoctors] = useState([
    {
      id: 1,
      name: "Dr. Ahmed Hassan",
      workingDays: ["Mon", "Tue", "Wed"],
      startTime: "09:00",
      endTime: "17:00",
      daysOff: ["Fri"],
    },
    {
      id: 2,
      name: "Dr. Sara Ali",
      workingDays: ["Sun", "Tue", "Thu"],
      startTime: "10:00",
      endTime: "16:00",
      daysOff: ["Sat"],
    },
  ]);

  const toggleDay = (doctorId, day) => {
    setDoctors((prev) =>
      prev.map((d) =>
        d.id === doctorId
          ? {
              ...d,
              workingDays: d.workingDays.includes(day)
                ? d.workingDays.filter((x) => x !== day)
                : [...d.workingDays, day],
            }
          : d
      )
    );
  };

  const updateTime = (doctorId, field, value) => {
    setDoctors((prev) =>
      prev.map((d) =>
        d.id === doctorId ? { ...d, [field]: value } : d
      )
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Scheduling</h1>
        <p>Manage patients and doctors schedules</p>
      </div>

      {/* ================= TABS ================= */}
      <div className={styles.tabs}>
        <button
          className={activeTab === "patients" ? styles.activeTab : ""}
          onClick={() => setActiveTab("patients")}
        >
          Patients
        </button>
        <button
          className={activeTab === "doctors" ? styles.activeTab : ""}
          onClick={() => setActiveTab("doctors")}
        >
          Doctors
        </button>
      </div>

      {/* ================= PATIENTS TAB ================= */}
      {activeTab === "patients" && (
        <>
          {loading && <p>Loading appointments...</p>}

          {error && (
            <div>
              <p style={{ color: "red" }}>{error}</p>
              <button onClick={fetchSchedules}>Retry</button>
            </div>
          )}

          {!loading && !error && (
            <>
              <AppointmentsFilters
                filters={filters}
                setFilters={setFilters}
              />

              <AppointmentsTable
                appointments={filteredAppointments}
                onRowClick={setSelectedAppointment}
              />

              {selectedAppointment && (
                <AppointmentDrawer
                  appointment={selectedAppointment}
                  onClose={() => setSelectedAppointment(null)}
                  onSave={handleUpdateAppointment}
                />
              )}
            </>
          )}
        </>
      )}

      {/* ================= DOCTORS TAB ================= */}
      {activeTab === "doctors" && (
        <div className={styles.doctorsPage}>
          {doctors.map((doctor) => (
            <div key={doctor.id} className={styles.doctorCard}>
              <h3>{doctor.name}</h3>

              <div className={styles.daysRow}>
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                  (day) => (
                    <button
                      key={day}
                      className={
                        doctor.workingDays.includes(day)
                          ? styles.dayActive
                          : styles.day
                      }
                      onClick={() => toggleDay(doctor.id, day)}
                    >
                      {day}
                    </button>
                  )
                )}
              </div>

              <div className={styles.timeRow}>
                <label>
                  Start:
                  <input
                    type="time"
                    value={doctor.startTime}
                    onChange={(e) =>
                      updateTime(
                        doctor.id,
                        "startTime",
                        e.target.value
                      )
                    }
                  />
                </label>

                <label>
                  End:
                  <input
                    type="time"
                    value={doctor.endTime}
                    onChange={(e) =>
                      updateTime(
                        doctor.id,
                        "endTime",
                        e.target.value
                      )
                    }
                  />
                </label>
              </div>

              <p>
                <strong>Days Off:</strong>{" "}
                {doctor.daysOff.join(", ")}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
