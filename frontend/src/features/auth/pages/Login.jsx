import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import InputField from '../../../components/ui/Input';
import styles from './Login.module.css';

// Import the login API function
import { login } from '../api/authApi';

import loginImg from '../../../assets/images/login.png'

export default function Login() {
  const navigate = useNavigate();
  // State for login form
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  function validateForm() {
    const newErrors = {};
    
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email";
    }
    
    if (!password) {
      newErrors.password = "Password is required";
    }
    
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
      // Prepare login data
      const loginData = {
        email: email.trim().toLowerCase(),
        password: password
      };
      
      console.log('🔐 Attempting login for:', email);
      
      // Call our login API
      const result = await login(loginData);
      
      if (result.success) {
        // Success! Handle different user roles
        const user = result.data.user;  // Backend response is wrapped in result.data
        console.log('✅ Login successful:', user);
        
        // Clear the form
        setEmail('');
        setPassword('');
        
        // Role-based redirect logic
        const userRole = user.role;
        console.log('👤 User role:', userRole);
        console.log('🔍 Verification status:', user.is_verified);
        
        if (userRole === 'Doctor') {
          // Doctor: Check verification status
          if (user.is_verified) {
            setSuccessMessage(`Welcome back, Dr. ${user.full_name}! Redirecting...`);
            setTimeout(() => {
              navigate('/staff/dashboard');
            }, 2000);
          } else {
            // This shouldn't happen due to backend validation, but just in case
            setErrors({ general: 'Account is not verified yet. Please contact administration.' });
            return;
          }
        } else if (userRole === 'Nurse') {
          // Nurse: Check verification status
          if (user.is_verified) {
            setSuccessMessage(`Welcome back, Nurse ${user.full_name}! Redirecting...`);
            setTimeout(() => {
              navigate('/staff/dashboard');
            }, 2000);
          } else {
            // This shouldn't happen due to backend validation, but just in case
            setErrors({ general: 'Account is not verified yet. Please contact administration.' });
            return;
          }
        } else if (userRole === 'Patient') {
          // Patient: Redirect to patient dashboard
          setSuccessMessage(`Welcome back, ${user.full_name}! Redirecting...`);
          setTimeout(() => {
            navigate('/patient/dashboard');
          }, 2000);
        } else if (userRole === 'Admin') {
          // Admin: Redirect to admin dashboard
          setSuccessMessage(`Welcome back, Admin ${user.full_name}! Redirecting...`);
          setTimeout(() => {
            navigate('/admin/dashboard');
          }, 2000);
        } else {
          // Unknown role: Still redirect but log for debugging
          console.warn('⚠️ Unknown user role:', userRole);
          setSuccessMessage(`Welcome back, ${user.full_name}! Redirecting...`);
          setTimeout(() => {
            navigate('/');
          }, 2000);
        }
        
      } else {
        // Handle different error types from backend
        const errorData = result.error;
        
        if (errorData && errorData.verification_required) {
          setErrors({ general: 'Account is not verified yet. Please contact administration.' });
        } else if (errorData && errorData.error) {
          setErrors({ general: errorData.error });
        } else {
          setErrors({ general: 'Login failed. Please try again.' });
        }
        console.error('❌ Login failed:', result);
      }
    } catch (error) {
      console.error('💥 Login error:', error);
      setErrors({ general: 'Network error. Please check your connection and try again.' });
    } finally {
      // Always clear loading state
      setIsLoading(false);
    }
  }

  return (
    <div className={styles.app}>
      <div className={styles['left-illustration']}>
        <img src={loginImg} alt="illustration" />
      </div>

      <div className={styles['right-panel']}>
        <div className={styles.card}>
          <h1 className={styles['card-title']}>Login</h1>

          {/* <div className={styles.avatar}>
            <div className={styles['avatar-circle']}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="8" r="3" stroke="#2f2f2f" strokeWidth="1.2" />
                <path d="M4 20c0-4 4-6 8-6s8 2 8 6" stroke="#2f2f2f" strokeWidth="1.2" fill="none"/>
              </svg>
            </div>
          </div> */}

          <form className={styles['login-form']} onSubmit={handleSubmit}>
            {/* Email Field */}
            <label className={styles['field-label']}>Email</label>
            <InputField
              type="email"
              value={email}
              onChange={(v) => setEmail(v)}
              placeholder="Enter your email address"
            />
            {errors.email && <span className={styles.error}>{errors.email}</span>}

            {/* Password Field */}
            <label className={styles['field-label']}>Password</label>
            <InputField
              type="password"
              value={password}
              onChange={(v) => setPassword(v)}
              placeholder="Enter your password"
            />
            {errors.password && <span className={styles.error}>{errors.password}</span>}

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

            <div className={styles.forgot}>
              <a href="#">Forgot Password?</a>
            </div>

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
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>

            <div className={styles['signup-link']}>
              Don't have an account? <a href="/signup">Sign Up!</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}