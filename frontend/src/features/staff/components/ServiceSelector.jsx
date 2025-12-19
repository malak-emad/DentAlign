import React, { useState } from "react";
import styles from "./ServiceSelector.module.css";

const services = [
  "Consultation",
  "Dental Cleaning",
  "Filling",
  "Extraction",
  "Root Canal",
  "Whitening",
];

export default function ServiceSelector() {
  const [selected, setSelected] = useState([]);

  const toggle = (service) => {
    setSelected((prev) =>
      prev.includes(service)
        ? prev.filter((s) => s !== service)
        : [...prev, service]
    );
  };

  return (
    <div className={styles.box}>

      <div className={styles.grid}>
        {services.map((s) => {
          const isActive = selected.includes(s);

          return (
            <div
              key={s}
              className={`${styles.item} ${
                isActive ? styles.active : ""
              }`}
              onClick={() => toggle(s)}
            >
              <input
                type="checkbox"
                checked={isActive}
                onChange={() => toggle(s)}
                onClick={(e) => e.stopPropagation()}
              />
              <span className={styles.labelText}>{s}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
