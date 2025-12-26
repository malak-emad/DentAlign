import React from "react";
import styles from "./AppointmentsFilters.module.css";

export default function AppointmentsFilters({ filters, setFilters }) {
  return (
    <div className={styles.filters}>
      <input
        type="text"
        placeholder="Search patient or doctor..."
        value={filters.search}
        onChange={(e) =>
          setFilters({ ...filters, search: e.target.value })
        }
      />

      <select
        value={filters.status}
        onChange={(e) =>
          setFilters({ ...filters, status: e.target.value })
        }
      >
        <option value="all">All Statuses</option>
        <option value="scheduled">Scheduled</option>
        <option value="completed">Completed</option>
        <option value="cancelled">Cancelled</option>
      </select>

      <input
        type="date"
        value={filters.date}
        onChange={(e) =>
          setFilters({ ...filters, date: e.target.value })
        }
      />
    </div>
  );
}
