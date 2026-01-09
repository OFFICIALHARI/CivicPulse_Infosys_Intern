// Backend API Service for CivicPulse
// This service handles all HTTP requests to the Spring Boot backend

const API_BASE_URL = 'http://localhost:8080/api';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

// Helper function to make API calls
const apiCall = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

// Authentication APIs
export const authApi = {
  login: async (email: string, role: string) => {
    return apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, role }),
    });
  },

  register: async (name: string, email: string, role: string, department?: string) => {
    return apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, role, department, password: 'password' }),
    });
  },
};

// User APIs
export const userApi = {
  getAllUsers: async () => {
    return apiCall('/users', { method: 'GET' });
  },

  getUserById: async (id: string) => {
    return apiCall(`/users/${id}`, { method: 'GET' });
  },

  getUsersByRole: async (role: string) => {
    return apiCall(`/users/role/${role}`, { method: 'GET' });
  },
};

// Grievance APIs
export const grievanceApi = {
  createGrievance: async (data: any, userId: string) => {
    return apiCall('/grievances', {
      method: 'POST',
      headers: { 'User-Id': userId },
      body: JSON.stringify(data),
    });
  },

  getAllGrievances: async () => {
    return apiCall('/grievances', { method: 'GET' });
  },

  getGrievanceById: async (id: string) => {
    return apiCall(`/grievances/${id}`, { method: 'GET' });
  },

  getGrievancesByUser: async (userId: string) => {
    return apiCall(`/grievances/user/${userId}`, { method: 'GET' });
  },

  getGrievancesByOfficer: async (officerId: string) => {
    return apiCall(`/grievances/officer/${officerId}`, { method: 'GET' });
  },

  getGrievancesByStatus: async (status: string) => {
    return apiCall(`/grievances/status/${status}`, { method: 'GET' });
  },

  updateGrievance: async (id: string, updates: any, userId: string) => {
    return apiCall(`/grievances/${id}`, {
      method: 'PATCH',
      headers: { 'User-Id': userId },
      body: JSON.stringify(updates),
    });
  },
};

// Export all APIs
export const backendApi = {
  auth: authApi,
  users: userApi,
  grievances: grievanceApi,
};

export default backendApi;
