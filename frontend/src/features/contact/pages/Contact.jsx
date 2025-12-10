import React from "react";
import styles from "./Contact.module.css";

export default function Contact() {
  return (
    <div className={styles.container}>

      {/* HERO / HEADER */}
      <section className={styles.hero}>
        <h1>Contact Us</h1>
        <p>We are here to assist you anytime.</p>
      </section>

      {/* CONTACT INFO BLOCK */}
      <section className={styles.infoSection}>
        <div className={styles.infoCard}>
          <h2>Get in Touch</h2>

          <p><strong>Email:</strong> example@gmail.com</p>
          <p><strong>Phone:</strong> +20 18 36 XX</p>
          <p><strong>Address:</strong> Cairo, Egypt</p>

          <div className={styles.line}></div>

          <p className={styles.smallText}>
            Our support team responds within 24 hours.
          </p>
        </div>
      </section>

      {/* FOOTER STRIP */}
      <section className={styles.footerStrip}>
        <p>Your health and comfort matter to us.</p>
      </section>

    </div>
  );
}
