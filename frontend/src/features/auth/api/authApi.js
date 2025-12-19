/**
 * Auth API Service - Handles all authentication-related API calls
 * 
 * This file contains functions that communicate with our Django backend
 * Each function returns a Promise that resolves with the API response
 */

// Base URL for our Django API
const API_BASE_URL = 'http://127.0.0.1:8000/api';

/**
 * Makes an HTTP request to our Django API
 * @param {string} endpoint - API endpoint (e.g., '/auth/signup/')
 * @param {object} options - Fetch options (method, headers, body)
 * @returns {Promise} - Promise that resolves with parsed JSON response
 */
async function makeApiRequest(endpoint, options = {}) {
  try {
    // Create full URL
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Default headers for JSON communication
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };
    
    // Merge default options with provided options
    const requestOptions = {
      method: 'GET',  // Default method
      headers: defaultHeaders,
      ...options,  // Override defaults with provided options
    };
    
    console.log(`🌐 Making ${requestOptions.method} request to: ${url}`);
    
    // Make the actual HTTP request
    const response = await fetch(url, requestOptions);
    
    // Parse JSON response
    const data = await response.json();
    
    // Check if request was successful
    if (response.ok) {
      console.log(`✅ Success:`, data);
      return { success: true, data };
    } else {
      console.log(`❌ Error:`, data);
      return { success: false, error: data };
    }
    
  } catch (error) {
    console.error('🔥 Network Error:', error);
    return { 
      success: false, 
      error: { message: 'Network error. Please check your connection.' } 
    };
  }
}

/**
 * Register a new patient
 * @param {object} patientData - Patient registration data
 * @param {string} patientData.name - Full name
 * @param {string} patientData.email - Email address
 * @param {string} patientData.password - Password
 * @param {string} patientData.confirm_password - Password confirmation
 * @returns {Promise} - API response
 */
export async function signupPatient(patientData) {
  console.log('🔍 Signup API called with:', patientData);
  
  const result = await makeApiRequest('/auth/signup/', {
    method: 'POST',
    body: JSON.stringify(patientData)
  });
  
  console.log('🔍 Signup API response:', result);
  
  // If signup is successful, store the token and user data like login does
  // Note: result.data contains the actual API response due to makeApiRequest wrapping
  if (result.success && result.data && result.data.token) {
    console.log('🔍 Storing new user token:', result.data.token);
    console.log('🔍 Storing new user data:', result.data.user);
    
    // Clear any existing auth data first
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Store new auth data
    localStorage.setItem('token', result.data.token);
    localStorage.setItem('user', JSON.stringify(result.data.user));
    
    console.log('🔐 New user token stored successfully');
  } else {
    console.error('❌ Signup failed or missing token:', result);
  }
  
  return result;
}

/**
 * Register a new doctor
 * @param {object} doctorData - Doctor registration data  
 * @param {string} doctorData.name - Full name
 * @param {string} doctorData.email - Email address
 * @param {string} doctorData.password - Password
 * @param {string} doctorData.confirm_password - Password confirmation
 * @param {string} doctorData.medical_license_number - Medical license number
 * @returns {Promise} - API response
 */
export async function signupDoctor(doctorData) {
  return makeApiRequest('/auth/signup/doctor/', {
    method: 'POST', 
    body: JSON.stringify(doctorData)
  });
}

/**
 * Register a new nurse
 * @param {object} nurseData - Nurse registration data  
 * @param {string} nurseData.name - Full name
 * @param {string} nurseData.email - Email address
 * @param {string} nurseData.password - Password
 * @param {string} nurseData.confirm_password - Password confirmation
 * @param {string} nurseData.nursing_license_number - Nursing license number (optional)
 * @returns {Promise} - API response
 */
export async function signupNurse(nurseData) {
  return makeApiRequest('/auth/signup/nurse/', {
    method: 'POST', 
    body: JSON.stringify(nurseData)
  });
}

/**
 * User login with role-based authentication
 * @param {object} loginData - Login credentials
 * @param {string} loginData.email - User email address
 * @param {string} loginData.password - User password
 * @returns {Promise} - API response with user data and role information
 */
export async function login(loginData) {
  const result = await makeApiRequest('/auth/login/', {
    method: 'POST',
    body: JSON.stringify(loginData)
  });
  
  // If login is successful, store the token and user data
  if (result.success && result.data.token) {
    localStorage.setItem('token', result.data.token);
    localStorage.setItem('user', JSON.stringify(result.data.user));
    console.log('🔐 Token stored successfully');
  }
  
  return result;
}

/**
 * Check API health
 * @returns {Promise} - API health status
 */
export async function checkHealth() {
  return makeApiRequest('/health/');
}
