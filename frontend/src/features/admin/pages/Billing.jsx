import React, { useState, useEffect } from "react";
import { adminApi } from "../api/adminApi";
import styles from "./Billing.module.css";

export default function AdminInvoices() {
  const [view, setView] = useState("invoices"); // invoices | billing
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, [view]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = view === 'billing' ? await adminApi.getBilling() : await adminApi.getInvoices();
      setInvoices(data);
      setError('');
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(`Failed to load ${view} data. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const updateInvoiceStatus = async (id, status) => {
    try {
      if (status === 'approved') {
        await adminApi.approveInvoice(id);
      } else if (status === 'rejected') {
        await adminApi.rejectInvoice(id);
      }
      // Refresh data after update
      await fetchData();
    } catch (error) {
      console.error('Error updating invoice status:', error);
      setError('Failed to update invoice status');
    }
  };

  const updatePaymentStatus = async (id, paymentStatus) => {
    try {
      await adminApi.updatePaymentStatus(id, paymentStatus);
      // Refresh data after update
      await fetchData();
    } catch (error) {
      console.error('Error updating payment status:', error);
      setError('Failed to update payment status');
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading {view} data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>{error}</div>
      </div>
    );
  }

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
        {invoices.length > 0 ? (
          invoices.map((inv) => (
            <div key={inv.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <div>
                  <h3>{inv.patient}</h3>
                  <p>
                    {inv.doctor} • {inv.date}
                  </p>
                </div>

                {view === "invoices" ? (
                  <span className={`${styles.status} ${styles[inv.appointmentStatus]}`}>
                    {inv.appointmentStatus}
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
                {inv.services?.map((s, i) => (
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
                  {inv.paymentStatus === "pending" || inv.paymentStatus === "unpaid" ? (
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
          ))
        ) : (
          <div className={styles.noData}>No {view} found</div>
        )}
      </div>
    </div>
  );
}
