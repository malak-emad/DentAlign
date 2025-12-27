import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import InputField from '../../../components/ui/Input';
import styles from './Signup.module.css'; 

// Import our API function
import { signupPatient } from '../api/authApi';

// Import the same illustration image
import loginImg from '../../../assets/images/signup.png'

export default function Signup() {
  const navigate = useNavigate();
  
  // State for form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // State for UI feedback
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);  // NEW: Loading state
  const [successMessage, setSuccessMessage] = useState('');  // NEW: Success message

  function validateForm() {
    const newErrors = {};
    
    if (!name.trim()) newErrors.name = "Name is required";
    if (!email.trim()) newErrors.email = "Email is required";
    if (!password) newErrors.password = "Password is required";
    if (password.length < 6) newErrors.password = "Password must be at least 6 characters";
    if (password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  // NEW: Async function to handle API calls
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
      const patientData = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: password,
        confirm_password: confirmPassword
      };
      
      console.log('📤 Sending patient data:', patientData);
      
      // Call our API
      const result = await signupPatient(patientData);
      
      if (result.success) {
        // Success! Show success message and redirect to homepage
        setSuccessMessage('Account created successfully! Redirecting to homepage...');
        
        // Clear the form
        setName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        
        console.log('✅ Patient account created, redirecting to dashboard');
        
        // Redirect to patient dashboard after 2 seconds
        setTimeout(() => {
          navigate('/patient/dashboard');
        }, 2000);
        
      } else {
        // Handle API errors
        if (result.error.details) {
          // Django validation errors
          setErrors(result.error.details);
        } else {
          // General error
          setErrors({ general: result.error.error || 'Registration failed. Please try again.' });
        }
      }
      
    } catch (error) {
      console.error('🔥 Unexpected error:', error);
      setErrors({ general: 'Something went wrong. Please try again.' });
    } finally {
      // Always stop loading
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
              disabled={isLoading}  /* Disable button while loading */
              style={{ 
                opacity: isLoading ? 0.6 : 1,
                cursor: isLoading ? 'not-allowed' : 'pointer'
              }}
            >
              {isLoading ? 'Creating Account...' : 'Sign up'}
            </button>

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