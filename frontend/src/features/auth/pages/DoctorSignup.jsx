import React, { useState } from 'react';
import InputField from '../../../components/ui/Input';
import styles from './Signup.module.css'; // Reuse same styles

// Import the API function for doctor signup
import { signupDoctor } from '../api/authApi';

// Import the same illustration image
import loginImg from '../../../assets/images/signup.png'

export default function DoctorSignup() {
  // State for doctor-specific fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [medicalLicenseNumber, setMedicalLicenseNumber] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  function validateForm() {
    const newErrors = {};
    
    if (!name.trim()) newErrors.name = "Name is required";
    if (!email.trim()) newErrors.email = "Email is required";
    if (!password) newErrors.password = "Password is required";
    if (password.length < 6) newErrors.password = "Password must be at least 6 characters";
    if (password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    if (!medicalLicenseNumber.trim()) newErrors.medicalLicenseNumber = "Medical license number is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    // Clear previous messages
    setErrors({});
    setSuccessMessage('');
    
    // Validate form first
    if (!validateForm()) return;
    
    // Set loading state
    setIsLoading(true);
    
    try {
      // Prepare data for API (match Django field names)
      const doctorData = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: password,
        confirm_password: confirmPassword,
        medical_license_number: medicalLicenseNumber.trim()
      };
      
      console.log('📤 Sending doctor data:', doctorData);
      
      // Call our API
      const result = await signupDoctor(doctorData);
      
      if (result.success) {
        // Success! Show custom success message for doctors
        setSuccessMessage('Registration successful, pending verification');
        
        // Clear the form
        setName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setMedicalLicenseNumber('');
        
        console.log('✅ Doctor registration successful:', result.data);
      } else {
        // Handle API errors
        if (result.data && typeof result.data === 'object') {
          setErrors(result.data);
        } else {
          setErrors({ general: result.error || 'Registration failed. Please try again.' });
        }
        console.error('❌ Doctor registration failed:', result);
      }
    } catch (error) {
      console.error('💥 Doctor registration error:', error);
      setErrors({ general: 'Network error. Please check your connection and try again.' });
    } finally {
      // Always clear loading state
      setIsLoading(false);
    }
  }

  return (
    <div className={styles.app}>
      {/* Left Panel - Same as Login */}
      <div className={styles['left-illustration']}>
        <img src={loginImg} alt="illustration" />
      </div>

      <div className={styles['right-panel']}>
        <div className={styles.card}>
          {/* Doctor-specific Title */}
          <h1 className={styles['card-title']}>Doctor Registration</h1>
          <p style={{color: '#666', marginBottom: '24px', textAlign: 'center', fontSize: '14px'}}>
            Registration requires admin verification
          </p>

          <form className={styles['login-form']} onSubmit={handleSubmit}>
            {/* Name Field */}
            <label className={styles['field-label']}>Full Name</label>
            <InputField
              value={name}
              onChange={(v) => setName(v)}
              placeholder="Enter your full name"
            />
            {errors.name && <span className={styles.error}>{errors.name}</span>}

            {/* Email Field */}
            <label className={styles['field-label']}>Email</label>
            <InputField
              type="email"
              value={email}
              onChange={(v) => setEmail(v)}
              placeholder="Enter your email"
            />
            {errors.email && <span className={styles.error}>{errors.email}</span>}

            {/* Medical License Number Field */}
            <label className={styles['field-label']}>Medical License Number</label>
            <InputField
              value={medicalLicenseNumber}
              onChange={(v) => setMedicalLicenseNumber(v)}
              placeholder="Enter your medical license number"
            />
            {errors.medicalLicenseNumber && <span className={styles.error}>{errors.medicalLicenseNumber}</span>}

            {/* Password Field */}
            <label className={styles['field-label']}>Password</label>
            <InputField
              type="password"
              value={password}
              onChange={(v) => setPassword(v)}
              placeholder="Create a password (min. 6 characters)"
            />
            {errors.password && <span className={styles.error}>{errors.password}</span>}

            {/* Confirm Password Field */}
            <label className={styles['field-label']}>Confirm Password</label>
            <InputField
              type="password"
              value={confirmPassword}
              onChange={(v) => setConfirmPassword(v)}
              placeholder="Confirm your password"
            />
            {errors.confirmPassword && <span className={styles.error}>{errors.confirmPassword}</span>}

            {/* General Error Message */}
            {errors.general && (
              <div className={styles.error} style={{textAlign: 'center', marginTop: '16px'}}>
                {errors.general}
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div className={styles.success} style={{textAlign: 'center', marginTop: '16px'}}>
                {successMessage}
              </div>
            )}

            {/* Submit Button with Loading State */}
            <button 
              type="submit" 
              className={styles['submit-btn']}
              disabled={isLoading}
              style={{ 
                opacity: isLoading ? 0.6 : 1,
                cursor: isLoading ? 'not-allowed' : 'pointer'
              }}
            >
              {isLoading ? 'Creating Account...' : 'Register as Doctor'}
            </button>

            {/* Links */}
            <div className={styles['signup-link']}>
              Already have an account? <a href="/login">Sign In!</a>
            </div>
            <div className={styles['signup-link']}>
              Patient registration? <a href="/signup">Sign up as Patient!</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}