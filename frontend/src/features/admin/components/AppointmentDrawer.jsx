import React, { useState } from "react";
import styles from "./AppointmentDrawer.module.css";

export default function AppointmentDrawer({ appointment, onClose, onSave }) {
  const [form, setForm] = useState({ ...appointment });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  return (
    <div className={styles.overlay}>
      <aside className={styles.drawer}>
        <header className={styles.header}>
          <h2>Appointment Details</h2>
          <button onClick={onClose}>✕</button>
        </header>

        <div className={styles.body}>
          <label>
            Patient
            <input value={form.patient} disabled />
          </label>

          <label>
            Doctor
            <input value={form.doctor} disabled />
          </label>

          <label>
            Service
            <input value={form.service} disabled />
          </label>

          <label>
            Date
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
            />
          </label>

          <label>
            Cost
            <input
              type="number"
              name="cost"
              value={form.cost}
              onChange={handleChange}
            />
          </label>

          <label>
            Status
            <select name="status" value={form.status} onChange={handleChange}>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </label>

          <label className={styles.checkbox}>
            <input
              type="checkbox"
              name="paid"
              checked={form.paid}
              onChange={handleChange}
            />
            Mark as paid
          </label>
        </div>

        <footer className={styles.footer}>
          <button className={styles.cancel} onClick={onClose}>
            Cancel
          </button>
          <button className={styles.save} onClick={() => onSave(form)}>
            Save Changes
          </button>
        </footer>
      </aside>
    </div>
  );
}
