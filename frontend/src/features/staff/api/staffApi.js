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
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    try {
      const errorData = await response.json();
      errorMessage += ` - ${JSON.stringify(errorData)}`;
    } catch (e) {
      // If not JSON, try text
      try {
        const errorText = await response.text();
        errorMessage += ` - ${errorText}`;
      } catch (e2) {
        // Ignore
      }
    }
    throw new Error(errorMessage);
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

  // Get staff reports
  getReports: async () => {
    try {
      return await makeAuthenticatedRequest('/reports/');
    } catch (error) {
      console.error('Failed to fetch reports:', error);
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
    // Remove null/undefined/'null'/'undefined' values so they don't become query params
    const cleanFilters = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== null && v !== undefined && v !== 'null' && v !== 'undefined' && v !== ''));
    const params = new URLSearchParams(cleanFilters);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    
    try {
      return await makeAuthenticatedRequest(`/appointments/${queryString}`);
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
      throw error;
    }
  },

  updateAppointment: async (appointmentId, updateData) => {
    try {
      return await makeAuthenticatedRequest(`/appointments/${appointmentId}/`, {
        method: 'PATCH',
        body: JSON.stringify(updateData),
      });
    } catch (error) {
      console.error('Failed to update appointment:', error);
      throw error;
    }
  },

  // Get nurses list
  getNurses: async () => {
    try {
      return await makeAuthenticatedRequest('/nurses/');
    } catch (error) {
      console.error('Failed to fetch nurses:', error);
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

  createTreatment: async (treatmentData) => {
    try {
      return await makeAuthenticatedRequest('/treatments/', {
        method: 'POST',
        body: JSON.stringify(treatmentData),
      });
    } catch (error) {
      console.error('Failed to create treatment:', error);
      throw error;
    }
  },

  // Medical record APIs
  createMedicalRecord: async (recordData) => {
    try {
      return await makeAuthenticatedRequest('/medical-records/', {
        method: 'POST',
        body: JSON.stringify(recordData),
      });
    } catch (error) {
      console.error('Failed to create medical record:', error);
      throw error;
    }
  },

  // Diagnosis APIs
  getDiagnoses: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    
    try {
      return await makeAuthenticatedRequest(`/diagnoses/${queryString}`);
    } catch (error) {
      console.error('Failed to fetch diagnoses:', error);
      throw error;
    }
  },

  createDiagnosis: async (diagnosisData) => {
    try {
      return await makeAuthenticatedRequest('/diagnoses/', {
        method: 'POST',
        body: JSON.stringify(diagnosisData),
      });
    } catch (error) {
      console.error('Failed to create diagnosis:', error);
      throw error;
    }
  },

  // Medical record APIs
  createMedicalRecord: async (recordData) => {
    try {
      return await makeAuthenticatedRequest('/medical-records/', {
        method: 'POST',
        body: JSON.stringify(recordData),
      });
    } catch (error) {
      console.error('Failed to create medical record:', error);
      throw error;
    }
  },

  // Diagnosis APIs
  createDiagnosis: async (diagnosisData) => {
    try {
      return await makeAuthenticatedRequest('/diagnoses/', {
        method: 'POST',
        body: JSON.stringify(diagnosisData),
      });
    } catch (error) {
      console.error('Failed to create diagnosis:', error);
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

  getInvoiceByAppointment: async (appointmentId) => {
    try {
      const invoices = await makeAuthenticatedRequest(`/invoices/?appointment=${appointmentId}`);
      return invoices.length > 0 ? invoices[0] : null;
    } catch (error) {
      console.error('Failed to fetch invoice by appointment:', error);
      throw error;
    }
  },

  updateInvoice: async (invoiceId, invoiceData) => {
    try {
      return await makeAuthenticatedRequest(`/invoices/${invoiceId}/`, {
        method: 'PATCH',
        body: JSON.stringify(invoiceData),
      });
    } catch (error) {
      console.error('Failed to update invoice:', error);
      throw error;
    }
  },

  recalculateInvoiceTotal: async (appointmentId) => {
    try {
      return await makeAuthenticatedRequest(`/appointments/${appointmentId}/recalculate-invoice/`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Failed to recalculate invoice total:', error);
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

  // Service APIs
  getServices: async () => {
    try {
      const response = await makeAuthenticatedRequest('/services/');
      // Handle both direct array and paginated { results: [...] }
      return Array.isArray(response) ? response : (response.results || []);
    } catch (error) {
      console.error('Failed to fetch services:', error);
      throw error;
    }
  },

  // Medical History APIs
  getChronicConditions: async (patientId) => {
    try {
      const queryString = patientId ? `?patient_id=${patientId}` : '';
      return await makeAuthenticatedRequest(`/chronic-conditions/${queryString}`);
    } catch (error) {
      console.error('Failed to fetch chronic conditions:', error);
      throw error;
    }
  },

  createChronicCondition: async (conditionData) => {
    try {
      return await makeAuthenticatedRequest('/chronic-conditions/', {
        method: 'POST',
        body: JSON.stringify(conditionData),
      });
    } catch (error) {
      console.error('Failed to create chronic condition:', error);
      throw error;
    }
  },

  updateChronicCondition: async (id, conditionData) => {
    try {
      return await makeAuthenticatedRequest(`/chronic-conditions/${id}/`, {
        method: 'PUT',
        body: JSON.stringify(conditionData),
      });
    } catch (error) {
      console.error('Failed to update chronic condition:', error);
      throw error;
    }
  },

  deleteChronicCondition: async (id) => {
    try {
      return await makeAuthenticatedRequest(`/chronic-conditions/${id}/`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Failed to delete chronic condition:', error);
      throw error;
    }
  },

  getAllergies: async (patientId) => {
    try {
      const queryString = patientId ? `?patient_id=${patientId}` : '';
      return await makeAuthenticatedRequest(`/allergies/${queryString}`);
    } catch (error) {
      console.error('Failed to fetch allergies:', error);
      throw error;
    }
  },

  createAllergy: async (allergyData) => {
    try {
      return await makeAuthenticatedRequest('/allergies/', {
        method: 'POST',
        body: JSON.stringify(allergyData),
      });
    } catch (error) {
      console.error('Failed to create allergy:', error);
      throw error;
    }
  },

  updateAllergy: async (id, allergyData) => {
    try {
      return await makeAuthenticatedRequest(`/allergies/${id}/`, {
        method: 'PUT',
        body: JSON.stringify(allergyData),
      });
    } catch (error) {
      console.error('Failed to update allergy:', error);
      throw error;
    }
  },

  deleteAllergy: async (id) => {
    try {
      return await makeAuthenticatedRequest(`/allergies/${id}/`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Failed to delete allergy:', error);
      throw error;
    }
  },

  getPastSurgeries: async (patientId) => {
    try {
      const queryString = patientId ? `?patient_id=${patientId}` : '';
      return await makeAuthenticatedRequest(`/past-surgeries/${queryString}`);
    } catch (error) {
      console.error('Failed to fetch past surgeries:', error);
      throw error;
    }
  },

  createPastSurgery: async (surgeryData) => {
    try {
      return await makeAuthenticatedRequest('/past-surgeries/', {
        method: 'POST',
        body: JSON.stringify(surgeryData),
      });
    } catch (error) {
      console.error('Failed to create past surgery:', error);
      throw error;
    }
  },

  updatePastSurgery: async (id, surgeryData) => {
    try {
      return await makeAuthenticatedRequest(`/past-surgeries/${id}/`, {
        method: 'PUT',
        body: JSON.stringify(surgeryData),
      });
    } catch (error) {
      console.error('Failed to update past surgery:', error);
      throw error;
    }
  },

  deletePastSurgery: async (id) => {
    try {
      return await makeAuthenticatedRequest(`/past-surgeries/${id}/`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Failed to delete past surgery:', error);
      throw error;
    }
  },

  // Reports APIs
  getReports: async () => {
    try {
      return await makeAuthenticatedRequest('/reports/');
    } catch (error) {
      console.error('Failed to fetch reports:', error);
      throw error;
    }
  },
};