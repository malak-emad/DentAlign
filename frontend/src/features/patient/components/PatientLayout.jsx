import React, { useState } from "react";
import PatientNavbar from "./PatientNavbar";
import PatientSidebar from "./PatientSidebar";
import PatientHeader from "./PatientHeader";
import styles from "./PatientLayout.module.css";

export default function PatientLayout({ children }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={styles.wrapper}>
      <PatientNavbar onMenuToggle={() => setOpen(!open)} />
      <PatientSidebar open={open} onClose={() => setOpen(false)} />

      <PatientHeader />

      <main className={styles.content}>{children}</main>
    </div>
  );
}
