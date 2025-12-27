import React from "react";
import styles from "./LogoutConfirmModal.module.css";

export default function LogoutConfirmModal({ onConfirm, onCancel }) {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h3>Confirm Logout</h3>
        <p>Are you sure you want to logout?</p>

        <div className={styles.actions}>
          <button className={styles.noBtn} onClick={onCancel}>
            No
          </button>
          <button className={styles.yesBtn} onClick={onConfirm}>
            Yes
          </button>
        </div>
      </div>
    </div>
  );
}
