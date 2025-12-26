import React from "react";
import styles from "./AppointmentsTable.module.css";
import AppointmentStatusBadge from "./AppointmentStatusBadge";

export default function AppointmentsTable({ appointments, onRowClick }) {
  if (appointments.length === 0) {
    return <div className={styles.empty}>No appointments found</div>;
  }

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Patient</th>
            <th>Doctor</th>
            <th>Service</th>
            <th>Date</th>
            <th>Time</th>
            <th>Status</th>
            <th>Payment</th>
          </tr>
        </thead>

        <tbody>
          {appointments.map((a) => (
            <tr
              key={a.id}
              className={styles.row}
              onClick={() => onRowClick(a)}
            >
              <td>{a.patient}</td>
              <td>{a.doctor}</td>
              <td>{a.service}</td>
              <td>{a.date}</td>
              <td>{a.time}</td>
              <td>
                <AppointmentStatusBadge status={a.status} />
              </td>
              <td>
                <span className={
                  a.payment_status?.toLowerCase() === 'paid' ? styles.paid :
                  a.payment_status?.toLowerCase() === 'pending' ? styles.pending :
                  styles.unpaid
                }>
                  {a.payment_status || 'Unpaid'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
