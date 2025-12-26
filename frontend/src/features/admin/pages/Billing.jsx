import React, { useState } from "react";
import styles from "./Billing.module.css";

const MOCK_INVOICES = [
  {
    id: 1,
    patient: "Ahmed Mohamed",
    doctor: "Dr. Ahmed Hassan",
    date: "2025-12-18",
    total: 1200,
    status: "pending",
    paymentStatus: "unpaid",
    services: [
      { name: "Dental Checkup", price: 300 },
      { name: "X-Ray", price: 200 },
      { name: "Root Canal", price: 700 },
    ],
  },
  {
    id: 2,
    patient: "Sara Ali",
    doctor: "Dr. Mona Ali",
    date: "2025-12-17",
    total: 450,
    status: "approved",
    paymentStatus: "paid",
    services: [
      { name: "Consultation", price: 250 },
      { name: "Cleaning", price: 200 },
    ],
  },
];

export default function AdminInvoices() {
  const [view, setView] = useState("invoices"); // invoices | billing
  const [invoices, setInvoices] = useState(MOCK_INVOICES);

  const updateInvoiceStatus = (id, status) => {
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === id ? { ...inv, status } : inv
      )
    );
  };

  const updatePaymentStatus = (id, paymentStatus) => {
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === id ? { ...inv, paymentStatus } : inv
      )
    );
  };

  const visibleInvoices =
    view === "billing"
      ? invoices.filter((i) => i.status === "approved")
      : invoices;

  return (
    <div className={styles.container}>
      {/* HEADER */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Invoices & Billing</h1>
          <p className={styles.subtitle}>
            Manage approvals and payments
          </p>
        </div>

        {/* TOGGLE */}
        <div className={styles.toggle}>
          <button
            className={`${styles.toggleBtn} ${
              view === "invoices" ? styles.active : ""
            }`}
            onClick={() => setView("invoices")}
          >
            Invoices
          </button>
          <button
            className={`${styles.toggleBtn} ${
              view === "billing" ? styles.active : ""
            }`}
            onClick={() => setView("billing")}
          >
            Billing
          </button>
        </div>
      </div>

      {/* LIST */}
      <div className={styles.list}>
        {visibleInvoices.map((inv) => (
          <div key={inv.id} className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <h3>{inv.patient}</h3>
                <p>
                  {inv.doctor} • {inv.date}
                </p>
              </div>

              {view === "invoices" ? (
                <span className={`${styles.status} ${styles[inv.status]}`}>
                  {inv.status}
                </span>
              ) : (
                <span
                  className={`${styles.status} ${
                    styles[inv.paymentStatus]
                  }`}
                >
                  {inv.paymentStatus}
                </span>
              )}
            </div>

            {/* SERVICES */}
            <div className={styles.services}>
              {inv.services.map((s, i) => (
                <div key={i} className={styles.serviceRow}>
                  <span>{s.name}</span>
                  <strong>{s.price} EGP</strong>
                </div>
              ))}
            </div>

            {/* TOTAL */}
            <div className={styles.total}>
              <span>Total</span>
              <strong>{inv.total} EGP</strong>
            </div>

            {/* ACTIONS */}
            {view === "invoices" && inv.status === "pending" && (
              <div className={styles.actions}>
                <button
                  className={styles.approve}
                  onClick={() =>
                    updateInvoiceStatus(inv.id, "approved")
                  }
                >
                  Approve
                </button>
                <button
                  className={styles.reject}
                  onClick={() =>
                    updateInvoiceStatus(inv.id, "rejected")
                  }
                >
                  Reject
                </button>
              </div>
            )}

            {view === "billing" && (
              <div className={styles.actions}>
                {inv.paymentStatus === "unpaid" ? (
                  <button
                    className={styles.approve}
                    onClick={() =>
                      updatePaymentStatus(inv.id, "paid")
                    }
                  >
                    Mark as Paid
                  </button>
                ) : (
                  <button
                    className={styles.reject}
                    onClick={() =>
                      updatePaymentStatus(inv.id, "unpaid")
                    }
                  >
                    Mark as Unpaid
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
