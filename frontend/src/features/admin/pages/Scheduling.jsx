import React, { useState, useEffect } from "react";
import { adminApi } from "../api/adminApi";
import styles from "./Scheduling.module.css";
import AppointmentsFilters from "../components/AppointmentsFilters";
import AppointmentsTable from "../components/AppointmentsTable";
import AppointmentDrawer from "../components/AppointmentDrawer";

export default function Scheduling() {
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
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getSchedules();
      // Transform API data to match the existing component structure
      const transformedAppointments = data.schedules?.map(schedule => ({
        id: schedule.id,
        patient: schedule.patient_name,
        doctor: schedule.staff_name,
        service: schedule.service_name,
        date: schedule.date,
        time: schedule.time,
        status: schedule.status.toLowerCase(),
        paid: schedule.payment_status?.toLowerCase() === 'paid' || 
              schedule.payment_status?.toLowerCase() === 'completed',
        payment_status: schedule.payment_status,
        notes: schedule.notes,
        duration: schedule.duration
      })) || [];
      setAppointments(transformedAppointments);
      setError(null);
    } catch (err) {
      setError('Failed to load schedules data');
      console.error('Schedules error:', err);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Appointment Scheduling</h1>
          <p>Loading appointments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Appointment Scheduling</h1>
          <p style={{ color: 'red' }}>{error}</p>
          <button onClick={fetchSchedules}>Retry</button>
        </div>
      </div>
    );
  }

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

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Appointments</h1>
        <p>Manage and monitor all clinic appointments</p>
      </div>

      <AppointmentsFilters filters={filters} setFilters={setFilters} />

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
    </div>
  );
}
