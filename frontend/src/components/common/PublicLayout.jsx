import React from 'react';
import Navbar from './Navbar';
import styles from './PublicLayout.module.css';

/**
 * @fileoverview Layout component for public-facing pages (Home, Login, Signup)
 * that wraps the content with the main Navbar.
 */
export default function PublicLayout({ children }) {
  return (
    <div className={styles.container}>
      {/* The Navbar is static/fixed on top */}
      <Navbar />
      
      {/* The main content area takes up the remaining vertical space */}
      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  );
}