// Backend API Service for CivicPulse
// This service handles all HTTP requests to the Spring Boot backend

const API_BASE_URL = 'http://localhost:8080/api';

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    department?: string;
  };
  message: string;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

// Helper function to get JWT token
const getToken = (): string | null => {
  return localStorage.getItem('cp_token');
};

// Helper function to make API calls with authentication
const apiCall = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T | AuthResponse> => {
  try {
    const token = getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    // Add Authorization header if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('API error:', data);
      throw new Error(data?.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

// Authentication APIs
export const authApi = {
  login: async (email: string, role: string): Promise<AuthResponse> => {
    const response = await apiCall<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, role }),
    });
    
    if ('token' in response) {
      localStorage.setItem('cp_token', response.token);
      localStorage.setItem('cp_user', JSON.stringify(response.user));
      return response;
    }
    throw new Error('Invalid response from server');
  },

  register: async (name: string, email: string, role: string, department?: string): Promise<AuthResponse> => {
    const response = await apiCall<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, role, department, password: 'password' }),
    });
    
    if ('token' in response) {
      localStorage.setItem('cp_token', response.token);
      localStorage.setItem('cp_user', JSON.stringify(response.user));
      return response;
    }
    throw new Error('Invalid response from server');
  },

  logout: () => {
    localStorage.removeItem('cp_token');
    localStorage.removeItem('cp_user');
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
  createGrievance: async (data: any) => {
    return apiCall('/grievances', {
      method: 'POST',
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

  updateGrievance: async (id: string, updates: any) => {
    return apiCall(`/grievances/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  submitFeedback: async (grievanceId: string, feedback: any) => {
    return apiCall(`/grievances/${grievanceId}/feedback`, {
      method: 'POST',
      body: JSON.stringify(feedback),
    });
  },

  getGrievanceFeedback: async (grievanceId: string) => {
    return apiCall(`/grievances/${grievanceId}/feedback`, { method: 'GET' });
  },

  getAnalyticsAll: async () => {
    return apiCall('/grievances/analytics/all', { method: 'GET' });
  },

  getOfficerAnalytics: async (officerId: string) => {
    return apiCall(`/grievances/analytics/officer/${officerId}`, { method: 'GET' });
  },

  getCompleteAnalytics: async () => {
    return apiCall('/grievances/analytics/complete', { method: 'GET' });
  },

  getZoneAnalytics: async () => {
    return apiCall('/grievances/analytics/zones', { method: 'GET' });
  },

  getSLAMetrics: async () => {
    return apiCall('/grievances/analytics/sla', { method: 'GET' });
  },

  getOfficerSLAMetrics: async (officerId: string) => {
    return apiCall(`/grievances/analytics/sla/officer/${officerId}`, { method: 'GET' });
  },

  getHeatMapData: async () => {
    return apiCall('/grievances/analytics/heatmap', { method: 'GET' });
  },

  getGrievanceAnalysis: async () => {
    return apiCall('/grievances/analytics/grievance-analysis', { method: 'GET' });
  },

  getGrievanceAnalysisForOfficer: async (officerId: string) => {
    return apiCall(`/grievances/analytics/grievance-analysis/officer/${officerId}`, { method: 'GET' });
  },

  uploadFile: async (grievanceId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const token = getToken();

    try {
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/grievances/${grievanceId}/upload`, {
        method: 'POST',
        body: formData,
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('File upload failed:', error);
      throw error;
    }
  },
};

// Export all APIs
export const backendApi = {
  auth: authApi,
  users: userApi,
  grievances: grievanceApi,
};

export default backendApi;

