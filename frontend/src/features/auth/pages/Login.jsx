import React, { useState } from 'react';
import InputField from '../../../components/ui/Input';
import styles from './Login.module.css';

import loginImg from '../../../assets/images/login.png'

export default function Login() {
  const [role, setRole] = useState("Nurse");
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    alert(`Logging in as ${role}\nID: ${id}\nPassword length: ${password.length}`);
  }

  return (
    <div className={styles.app}>
      <div className={styles['left-illustration']}>
        <img src={loginImg} alt="illustration" />
      </div>

      <div className={styles['right-panel']}>
        <div className={styles.card}>
          <h1 className={styles['card-title']}>Login</h1>

          <div className={styles.avatar}>
            <div className={styles['avatar-circle']}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="8" r="3" stroke="#2f2f2f" strokeWidth="1.2" />
                <path d="M4 20c0-4 4-6 8-6s8 2 8 6" stroke="#2f2f2f" strokeWidth="1.2" fill="none"/>
              </svg>
            </div>
          </div>

          <form className={styles['login-form']} onSubmit={handleSubmit}>
            <label className={styles['field-label']}>{role} ID</label>
            <InputField
              value={id}
              onChange={(v) => setId(v)}
              placeholder={`Enter ${role} ID`}
            />

            <label className={styles['field-label']}>Password</label>
            <InputField
              type="password"
              value={password}
              onChange={(v) => setPassword(v)}
              placeholder="Enter password"
            />

            <div className={styles.forgot}>
              <a href="#">Forgot Password?</a>
            </div>

            <button type="submit" className={styles['submit-btn']}>Submit</button>

            <div className={styles['signup-link']}>
              Don't have an account? <a href="#">Sign Up!</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}