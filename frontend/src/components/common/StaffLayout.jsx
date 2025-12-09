import React, { useState } from "react";
import StaffNavbar from "./StaffNavbar";
import Sidebar from "./Sidebar";
import StaffHeader from "./StaffHeader";   
import styles from "./StaffLayout.module.css";

export default function StaffLayout({ children }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={styles.wrapper}>
      <StaffNavbar onMenuToggle={() => setOpen(!open)} />
      <Sidebar open={open} onClose={() => setOpen(false)} />

      {/* NEW: Welcome Header */}
      <StaffHeader />

      <main className={styles.content}>{children}</main>
    </div>
  );
}
