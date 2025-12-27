import React, { useState, useEffect } from "react";
import styles from "./ServiceSelector.module.css";
import { staffApi } from "../api/staffApi";

export default function ServiceSelector({ onSelectionChange }) {
  const [services, setServices] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await staffApi.getServices();
        const servicesList = Array.isArray(response) ? response : (response.results || []);
        setServices(servicesList);
      } catch (error) {
        console.error('Failed to fetch services:', error);
        setServices([]);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  const toggle = (service) => {
    const newSelected = selected.includes(service.service_id)
      ? selected.filter((s) => s !== service.service_id)
      : [...selected, service.service_id];
    setSelected(newSelected);
    if (onSelectionChange) {
      onSelectionChange(newSelected);
    }
  };

  if (loading) {
    return <div>Loading services...</div>;
  }

  return (
    <div className={styles.box}>
      <div className={styles.grid}>
        {services.map((service) => {
          const isActive = selected.includes(service.service_id);

          return (
            <div
              key={service.service_id}
              className={`${styles.item} ${
                isActive ? styles.active : ""
              }`}
              onClick={() => toggle(service)}
            >
              <input
                type="checkbox"
                checked={isActive}
                onChange={() => toggle(service)}
                onClick={(e) => e.stopPropagation()}
              />
              <span className={styles.labelText}>{service.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
