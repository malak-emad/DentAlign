const API_BASE_URL = 'http://127.0.0.1:8000/api/patients';

// Helper function to get auth token from localStorage
const getAuthToken = () => {
  const token = localStorage.getItem('token');
  console.log('🔍 Checking for auth token:', token ? '✅ Token found' : '❌ No token');
  return token ? `Token ${token}` : null;
};

// Helper function to make public requests (no auth)
const makePublicRequest = async (url, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || errorData.error || `HTTP ${response.status}`);
  }

  return response.json();
};

// Helper function to make authenticated requests
const makeAuthenticatedRequest = async (url, options = {}) => {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': token,
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw new Error('Authentication failed');
    }
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
};

// Patient API
export const patientApi = {
  // Get dashboard statistics
  getDashboardStats: async () => {
    try {
      return await makeAuthenticatedRequest('/dashboard/stats/');
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      throw error;
    }
  },

  // Get patient profile
  getProfile: async () => {
    try {
      return await makeAuthenticatedRequest('/profile/');
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      throw error;
    }
  },

  // Update patient profile
  updateProfile: async (profileData) => {
    try {
      return await makeAuthenticatedRequest('/profile/', {
        method: 'PUT',
        body: JSON.stringify(profileData),
      });
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  },

  // Get appointments
  getAppointments: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    
    try {
      return await makeAuthenticatedRequest(`/appointments/${queryString}`);
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
      throw error;
    }
  },

  // Book new appointment
  bookAppointment: async (appointmentData) => {
    try {
      return await makeAuthenticatedRequest('/appointments/book/', {
        method: 'POST',
        body: JSON.stringify(appointmentData),
      });
    } catch (error) {
      console.error('Failed to book appointment:', error);
      throw error;
    }
  },

  // Get available services for booking
  getAvailableServices: async () => {
    try {
      const response = await makePublicRequest('/services/');
      const servicesList = Array.isArray(response.services) ? response.services : [];
      return servicesList;
    } catch (error) {
      console.error('Failed to fetch services:', error);
      throw error;
    }
  },

  // Get available doctors (optionally filtered by service)
  getAvailableDoctors: async (serviceId = null) => {
    const params = serviceId ? `?service=${serviceId}` : '';
    try {
      return await makeAuthenticatedRequest(`/doctors/${params}`);
    } catch (error) {
      console.error('Failed to fetch doctors:', error);
      throw error;
    }
  },

  // Get available time slots for a specific doctor and date
  getAvailableSlots: async (doctorId, date) => {
    try {
      return await makeAuthenticatedRequest(`/slots/?doctor_id=${doctorId}&date=${date}`);
    } catch (error) {
      console.error('Failed to fetch available slots:', error);
      throw error;
    }
  },

  // Get treatments/prescriptions
  getTreatments: async () => {
    try {
      return await makeAuthenticatedRequest('/treatments/');
    } catch (error) {
      console.error('Failed to fetch treatments:', error);
      throw error;
    }
  },

  // Get invoices/bills
  getInvoices: async () => {
    try {
      return await makeAuthenticatedRequest('/invoices/');
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
      throw error;
    }
  },

  // Get medical history
  getMedicalHistory: async () => {
    try {
      return await makeAuthenticatedRequest('/medical-history/');
    } catch (error) {
      console.error('Failed to fetch medical history:', error);
      throw error;
    }
  },
};