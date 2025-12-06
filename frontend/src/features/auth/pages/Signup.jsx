import React, { useState } from 'react';
import InputField from '../../../components/ui/Input';
import styles from './Signup.module.css'; 

// Import the same illustration image
import loginImg from '../../../assets/images/signup.png'

export default function Signup() {
  // State for the new fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    // Dummy submission logic
    alert(`Signing up:\nName: ${name}\nEmail: ${email}\nPassword length: ${password.length}`);
  }

  return (
    <div className={styles.app}>
      {/* Left Panel - Same as Login */}
      <div className={styles['left-illustration']}>
        <img src={loginImg} alt="illustration" />
      </div>

      <div className={styles['right-panel']}>
        <div className={styles.card}>
          {/* Changed Title */}
          <h1 className={styles['card-title']}>Sign up</h1>

          {/* Avatar - Same as Login
          <div className={styles.avatar}>
            <div className={styles['avatar-circle']}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="8" r="3" stroke="#2f2f2f" strokeWidth="1.2" />
                <path d="M4 20c0-4 4-6 8-6s8 2 8 6" stroke="#2f2f2f" strokeWidth="1.2" fill="none"/>
              </svg>
            </div>
          </div> */}

          <form className={styles['login-form']} onSubmit={handleSubmit}>
            {/* Name Field */}
            <label className={styles['field-label']}>Full Name</label>
            <InputField
              value={name}
              onChange={(v) => setName(v)}
              placeholder="Enter your full name"
            />

            {/* Email Field */}
            <label className={styles['field-label']}>Email</label>
            <InputField
              type="email"
              value={email}
              onChange={(v) => setEmail(v)}
              placeholder="Enter your email"
            />

            {/* Password Field */}
            <label className={styles['field-label']}>Password</label>
            <InputField
              type="password"
              value={password}
              onChange={(v) => setPassword(v)}
              placeholder="Create a password"
            />

            {/* Removed "Forgot Password" link */}

            <button type="submit" className={styles['submit-btn']}>Sign up</button>

            {/* Changed link text and target */}
            <div className={styles['signup-link']}>
              Already have an account? <a href="/login">Sign In!</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}