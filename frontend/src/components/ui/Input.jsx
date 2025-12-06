import React from 'react';
import styles from './Input.module.css';

export default function Input({ value, onChange, placeholder = "", type = "text", className = "" }) {
  return (
    <input
      className={`${styles.input} ${className}`}
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}