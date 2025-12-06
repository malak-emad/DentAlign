import React from "react";
import styles from "./Contact.module.css";

export default function Contact() {
  return (
    <div className={styles.container}>

      {/* Top banner section */}
      <section className={styles.headerSection}>
        <h1>Contact Us</h1>
        <p>Email: example@gmail.com</p>
        <p>Phone: +201836xx</p>
      </section>

      <section className={styles.middleSection}>
        {/* <p>We are here to help you anytime.</p> */}
      </section>

      {/* Bottom blue section */}
      <section className={styles.bottomSection}>
        <p>We are here to help you anytime.</p>
      </section>

    </div>
  );
}
