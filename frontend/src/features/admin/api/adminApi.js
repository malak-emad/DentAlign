import { API_BASE_URL } from '../../../utils/constants.js';

// Helper function to get auth token from localStorage
const getAuthToken = () => {
  const token = localStorage.getItem('token');
  console.log('🔍 Admin checking for auth token:', token ? '✅ Token found' : '❌ No token');
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

  const response = await fetch(`${API_BASE_URL}/api/admin${url}`, {
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

class AdminApi {
  async getDashboardData() {
    try {
      return await makeAuthenticatedRequest('/dashboard/stats/');
    } catch (error) {
      console.error('Error fetching admin dashboard data:', error);
      throw error;
    }
  }

  async getServices() {
    try {
      return await makeAuthenticatedRequest('/services/');
    } catch (error) {
      console.error('Error fetching admin services data:', error);
      throw error;
    }
  }

  async addService(serviceData) {
    try {
      return await makeAuthenticatedRequest('/services/add/', {
        method: 'POST',
        body: JSON.stringify(serviceData)
      });
    } catch (error) {
      console.error('Error adding service:', error);
      throw error;
    }
  }

  async getSchedules() {
    try {
      return await makeAuthenticatedRequest('/schedules/');
    } catch (error) {
      console.error('Error fetching admin schedules data:', error);
      throw error;
    }
  }
}

export const adminApi = new AdminApi();