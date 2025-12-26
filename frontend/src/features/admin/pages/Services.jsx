import React, { useState } from "react";
import styles from "./Services.module.css";

/* ===== MOCK SERVICES ===== */
const INITIAL_SERVICES = [
  {
    id: 1,
    name: "Dental Checkup",
    price: 300,
    active: true,
  },
  {
    id: 2,
    name: "Teeth Cleaning",
    price: 600,
    active: true,
  },
  {
    id: 3,
    name: "X-Ray",
    price: 250,
    active: false,
  },
];

export default function Services() {
  const [services, setServices] = useState(INITIAL_SERVICES);
  const [newService, setNewService] = useState({ name: "", price: "" });

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

  const addService = () => {
    if (!newService.name || !newService.price) return;

    setServices((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: newService.name,
        price: Number(newService.price),
        active: true,
      },
    ]);

    setNewService({ name: "", price: "" });
  };

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
      </div>
    </div>
  );
}
