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

  async getStaff() {
    try {
      return await makeAuthenticatedRequest('/staff/');
    } catch (error) {
      console.error('Error fetching admin staff data:', error);
      throw error;
    }
  }

  async getUserApprovals() {
    try {
      return await makeAuthenticatedRequest('/user-approvals/');
    } catch (error) {
      console.error('Error fetching user approvals data:', error);
      throw error;
    }
  }

  async approveUser(userId) {
    try {
      return await makeAuthenticatedRequest(`/user-approvals/${userId}/approve/`, {
        method: 'POST'
      });
    } catch (error) {
      console.error('Error approving user:', error);
      throw error;
    }
  }

  async rejectUser(userId) {
    try {
      return await makeAuthenticatedRequest(`/user-approvals/${userId}/reject/`, {
        method: 'POST'
      });
    } catch (error) {
      console.error('Error rejecting user:', error);
      throw error;
    }
  }

  async getPatients() {
    try {
      return await makeAuthenticatedRequest('/patients/');
    } catch (error) {
      console.error('Error fetching patients data:', error);
      throw error;
    }
  }

  async getPatientDetails(patientId) {
    try {
      return await makeAuthenticatedRequest(`/patients/${patientId}/`);
    } catch (error) {
      console.error('Error fetching patient details:', error);
      throw error;
    }
  }

  // Invoice/Billing management
  async getInvoices() {
    try {
      return await makeAuthenticatedRequest('/invoices/');
    } catch (error) {
      console.error('Error fetching invoices:', error);
      throw error;
    }
  }

  async getBilling() {
    try {
      return await makeAuthenticatedRequest('/billing/');
    } catch (error) {
      console.error('Error fetching billing data:', error);
      throw error;
    }
  }

  async approveInvoice(invoiceId) {
    try {
      return await makeAuthenticatedRequest(`/invoices/${invoiceId}/approve/`, {
        method: 'POST'
      });
    } catch (error) {
      console.error('Error approving invoice:', error);
      throw error;
    }
  }

  async rejectInvoice(invoiceId) {
    try {
      return await makeAuthenticatedRequest(`/invoices/${invoiceId}/reject/`, {
        method: 'POST'
      });
    } catch (error) {
      console.error('Error rejecting invoice:', error);
      throw error;
    }
  }

  async updatePaymentStatus(invoiceId, status) {
    try {
      return await makeAuthenticatedRequest(`/invoices/${invoiceId}/payment/`, {
        method: 'POST',
        body: JSON.stringify({ status })
      });
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw error;
    }
  }
}

export const adminApi = new AdminApi();