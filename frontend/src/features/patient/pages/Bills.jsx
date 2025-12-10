// src/features/patient/pages/Bills.jsx
import React, { useState, useMemo } from "react";
import styles from "./Bills.module.css";

const MOCK_BILLS = [
  {
    id: "b1",
    title: "Dental Cleaning",
    doctor: "Dr. Omar Khaled",
    date: "2026-01-15",
    status: "Paid",
    total: 450,
    items: [
      { name: "Scaling", price: 300 },
      { name: "Polishing", price: 150 },
    ],
  },
  {
    id: "b2",
    title: "Tooth Extraction",
    doctor: "Dr. Sarah Ahmed",
    date: "2025-12-02",
    status: "Unpaid",
    total: 900,
    items: [{ name: "Extraction", price: 900 }],
  },
  {
    id: "b3",
    title: "Chest X‑Ray",
    doctor: "Dr. Lina Hassan",
    date: "2025-10-10",
    status: "Paid",
    total: 300,
    items: [{ name: "X‑Ray Scan", price: 300 }],
  },
];

export default function Bills() {
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");

  const filteredBills = useMemo(() => {
    return MOCK_BILLS.filter((b) => {
      if (statusFilter && b.status !== statusFilter) return false;

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
  }, [statusFilter, search]);

  // Mock handlers
  const handleView = (bill) => {
    alert("Viewing bill: " + bill.title);
  };

  const handleDownload = (bill) => {
    alert("Downloading PDF for " + bill.title);
  };

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
