// src/features/patient/pages/Bills.jsx
import React, { useState, useMemo, useEffect } from "react";
import { patientApi } from "../api/patientApi";
import styles from "./Bills.module.css";

export default function Bills() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      setLoading(true);
      const data = await patientApi.getInvoices();
      setBills(data.bills || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching bills:', err);
      setError('Failed to load bills. Please try again.');
      setBills([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredBills = useMemo(() => {
    return bills.filter((b) => {
      // Status filter: map "Paid"/"Unpaid" to match status values
      if (statusFilter) {
        if (statusFilter === "Paid" && b.status !== "Paid") return false;
        if (statusFilter === "Unpaid" && b.status === "Paid") return false;
      }

      // Search filter
      if (search) {
        const q = search.toLowerCase();
        if (
          !b.title.toLowerCase().includes(q) &&
          !b.doctor.toLowerCase().includes(q)
        )
          return false;
      }

      return true;
    });
  }, [bills, statusFilter, search]);

  const handleView = (bill) => {
    // TODO: Implement view bill details modal/page
    alert("Viewing bill: " + bill.title);
  };

  const handleDownload = (bill) => {
    // TODO: Implement PDF download
    alert("Downloading PDF for " + bill.title);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Bills & Payments</h1>
        <p>Loading bills...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Bills & Payments</h1>
        <p style={{ color: 'red' }}>{error}</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Bills & Payments</h1>

      {/* Filters */}
      <div className={styles.filters}>
        <input
          type="text"
          placeholder="Search bills..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.search}
        />

        <select
          className={styles.select}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Payments</option>
          <option value="Paid">Paid</option>
          <option value="Unpaid">Unpaid</option>
        </select>
      </div>

      {/* Bill Cards */}
      <div className={styles.grid}>
        {filteredBills.length === 0 && (
          <div className={styles.empty}>No bills found.</div>
        )}

        {filteredBills.map((bill) => (
          <div key={bill.id} className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.billTitle}>{bill.title}</h3>
              <span
                className={`${styles.status} ${
                  bill.status === "Paid"
                    ? styles.statusPaid
                    : styles.statusUnpaid
                }`}
              >
                {bill.status}
              </span>
            </div>

            <p className={styles.meta}>
              <strong>Doctor:</strong> {bill.doctor}
            </p>
            <p className={styles.meta}>
              <strong>Date:</strong>{" "}
              {new Date(bill.date).toLocaleDateString()}
            </p>

            <div className={styles.itemList}>
              {bill.items.map((item, i) => (
                <div key={i} className={styles.item}>
                  <span>{item.name}</span>
                  <span className={styles.price}>EGP {item.price}</span>
                </div>
              ))}
            </div>

            <div className={styles.totalRow}>
              <span>Total</span>
              <span className={styles.totalPrice}>EGP {bill.total}</span>
            </div>

            {/* NEW BUTTONS */}
            <div className={styles.actions}>
              <button
                className={styles.viewBtn}
                onClick={() => handleView(bill)}
              >
                View
              </button>

              <button
                className={styles.viewBtn}
                onClick={() => handleDownload(bill)}
              >
                Download
              </button>

              {bill.status === "Unpaid" && (
                <button className={styles.payBtn}>Pay Now</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
