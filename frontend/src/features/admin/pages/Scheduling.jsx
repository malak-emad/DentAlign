import React, { useState } from "react";
import styles from "./Scheduling.module.css";
import AppointmentsFilters from "../components/AppointmentsFilters";
import AppointmentsTable from "../components/AppointmentsTable";
import AppointmentDrawer from "../components/AppointmentDrawer";

const MOCK_APPOINTMENTS = [
  {
    id: 1,
    patient: "John Doe",
    doctor: "Dr. Ahmed Hassan",
    service: "Dental Cleaning",
    date: "2025-12-21",
    time: "10:30 AM",
    status: "completed",
    paid: true,
  },
  {
    id: 2,
    patient: "Sarah Ahmed",
    doctor: "Dr. Mona Ali",
    service: "Consultation",
    date: "2025-12-21",
    time: "11:15 AM",
    status: "scheduled",
    paid: false,
  },
  {
    id: 3,
    patient: "Michael Smith",
    doctor: "Dr. Ahmed Hassan",
    service: "Root Canal",
    date: "2025-12-22",
    time: "01:00 PM",
    status: "cancelled",
    paid: false,
  },
];

export default function Scheduling() {
  const [appointments, setAppointments] = useState(MOCK_APPOINTMENTS);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    date: "",
  });

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
