import React from "react";
import styles from "./PatientsTable.module.css";

export default function PatientsTable({ title, patients, type, onAction }) {
  return (
    <div className={styles.card}>
      <h3>{title}</h3>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Patient</th>
            <th>Time</th>
            <th>Services</th>
            <th>Nurse</th>
            {type === "action" && <th>Action</th>}
          </tr>
        </thead>
        <tbody>
          {patients.map((p) => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td>{p.time}</td>
              <td>{p.services}</td>
              <td>{p.nurse || "-"}</td>
              {type === "action" && (
                <td>
                  <button
                    className={styles.btn}
                    onClick={() => onAction(p)}
                  >
                    Start Visit
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
