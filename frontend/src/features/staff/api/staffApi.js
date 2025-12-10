const API_BASE_URL = 'http://127.0.0.1:8000/api/staff';

// Helper function to get auth token from localStorage
const getAuthToken = () => {
  const token = localStorage.getItem('token');
  console.log('🔍 Checking for auth token:', token ? '✅ Token found' : '❌ No token');
  return token ? `Token ${token}` : null;
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

// Dashboard API
export const staffApi = {
  // Get dashboard statistics
  getDashboardStats: async () => {
    try {
      return await makeAuthenticatedRequest('/dashboard/stats/');
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      throw error;
    }
  },

  // Get staff profile
  getProfile: async () => {
    try {
      return await makeAuthenticatedRequest('/profile/');
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      throw error;
    }
  },

  // Update staff profile
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

  // Patient APIs
  getPatients: async (searchParams = {}) => {
    const params = new URLSearchParams(searchParams);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    
    try {
      return await makeAuthenticatedRequest(`/patients/${queryString}`);
    } catch (error) {
      console.error('Failed to fetch patients:', error);
      throw error;
    }
  },

  getPatientDetails: async (patientId) => {
    try {
      return await makeAuthenticatedRequest(`/patients/${patientId}/`);
    } catch (error) {
      console.error('Failed to fetch patient details:', error);
      throw error;
    }
  },

  searchPatients: async (query) => {
    try {
      return await makeAuthenticatedRequest(`/patients/search/?q=${encodeURIComponent(query)}`);
    } catch (error) {
      console.error('Failed to search patients:', error);
      throw error;
    }
  },

  // Appointment APIs
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

  // Treatment APIs
  getTreatments: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    
    try {
      return await makeAuthenticatedRequest(`/treatments/${queryString}`);
    } catch (error) {
      console.error('Failed to fetch treatments:', error);
      throw error;
    }
  },

  // Invoice APIs
  getInvoices: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    
    try {
      return await makeAuthenticatedRequest(`/invoices/${queryString}`);
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
      throw error;
    }
  },

  // Payment APIs
  getPayments: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    
    try {
      return await makeAuthenticatedRequest(`/payments/${queryString}`);
    } catch (error) {
      console.error('Failed to fetch payments:', error);
      throw error;
    }
  },
};