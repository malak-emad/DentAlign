import React, { useState, useEffect } from "react";
import { adminApi } from "../api/adminApi";
import styles from "./Services.module.css";

export default function Services() {
  const [services, setServices] = useState([]);
  const [newService, setNewService] = useState({ name: "", price: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getServices();
      // Transform API data to match original UI structure
      const transformedServices = data.services?.map(service => ({
        id: service.id,
        name: service.service_name,
        price: service.price,
        active: true, // Assuming all services from treatments are active
        // Keep additional info for reference
        patient_name: service.patient_name,
        staff_name: service.staff_name,
        date: service.date
      })) || [];
      setServices(transformedServices);
      setError(null);
    } catch (err) {
      setError('Failed to load services data');
      console.error('Services error:', err);
      // Fallback to empty array if API fails
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = (id) => {
    setServices((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, active: !s.active } : s
      )
    );
  };

  const updatePrice = (id, price) => {
    setServices((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, price } : s
      )
    );
  };

  const addService = async () => {
    if (!newService.name || !newService.price) return;

    try {
      // Save to database via API
      const savedService = await adminApi.addService({
        name: newService.name,
        price: Number(newService.price)
      });

      // Add to frontend state (transform to match UI structure)
      setServices((prev) => [
        {
          id: savedService.id,
          name: savedService.service_name,
          price: savedService.price,
          active: true,
        },
        ...prev,
      ]);

      setNewService({ name: "", price: "" });
    } catch (error) {
      console.error('Failed to add service:', error);
      alert('Failed to add service. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Services & Pricing</h1>
          <p>Loading services data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* ===== HEADER ===== */}
      <div className={styles.header}>
        <h1>Services & Pricing</h1>
        <p>Manage clinic services and their prices</p>
      </div>

      {/* ===== ADD SERVICE ===== */}
      <div className={styles.addBox}>
        <input
          type="text"
          placeholder="Service name"
          value={newService.name}
          onChange={(e) =>
            setNewService({ ...newService, name: e.target.value })
          }
        />
        <input
          type="number"
          placeholder="Price (EGP)"
          value={newService.price}
          onChange={(e) =>
            setNewService({ ...newService, price: e.target.value })
          }
        />
        <button onClick={addService}>Add Service</button>
      </div>

      {/* ===== SERVICES LIST ===== */}
      <div className={styles.list}>
        {services.map((service) => (
          <div key={service.id} className={styles.card}>
            <div className={styles.info}>
              <h3>{service.name}</h3>

              <div className={styles.priceRow}>
                <label>Price</label>
                <input
                  type="number"
                  value={service.price}
                  onChange={(e) =>
                    updatePrice(service.id, Number(e.target.value))
                  }
                />
                <span>EGP</span>
              </div>
            </div>

            <div className={styles.actions}>
              <span
                className={`${styles.status} ${
                  service.active ? styles.active : styles.inactive
                }`}
              >
                {service.active ? "Active" : "Inactive"}
              </span>

              <button
                className={styles.toggle}
                onClick={() => toggleStatus(service.id)}
              >
                {service.active ? "Disable" : "Enable"}
              </button>
            </div>
          </div>
        ))}

        {services.length === 0 && (
          <div className={styles.emptyState}>
            <p>No services found</p>
            {error && <p style={{ color: 'red' }}>{error}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
