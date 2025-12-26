import React, { useState } from "react";
import AdminNavbar from "./AdminNavbar";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import styles from "./AdminLayout.module.css";

export default function AdminLayout({ children }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={styles.wrapper}>
      <AdminNavbar onMenuToggle={() => setOpen(!open)} />
      <AdminSidebar open={open} onClose={() => setOpen(false)} />
      <AdminHeader />
      <main className={styles.content}>{children}</main>
    </div>
  );
}
