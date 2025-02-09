import axios from 'axios';
import { store } from '../store';
import { logout } from '../store/slices/authSlice';
import { AnalysisRequest } from '../types/analysis';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001/api/v1';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
axiosInstance.interceptors.request.use((config) => {
  const state = store.getState();
  const token = state.auth.token || localStorage.getItem('token');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Handle file uploads
  if (config.data instanceof FormData) {
    // For FormData, remove any content-type header to let the browser handle it
    delete config.headers['Content-Type'];
    // Ensure we don't transform the FormData
    config.transformRequest = [(data) => data];
  }

  return config;
});

// Add response interceptor for debugging
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
    });
    
    if (error.response?.status === 401) {
      // Dispatch logout action to clear Redux state
      store.dispatch(logout());
      // Clear local storage
      localStorage.removeItem('token');
      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  register: async (data: { email: string; password: string; name: string }) => {
    const formData = new FormData();
    formData.append('username', data.email); // Backend expects 'username'
    formData.append('password', data.password);
    formData.append('name', data.name);
    
    const response = await axiosInstance.post('/auth/register', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  login: async (email: string, password: string) => {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);
    
    const response = await axiosInstance.post('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    if (response.data.access_token) {
      // Get user data after successful login
      const token = response.data.access_token;
      
      // Set token in axios instance
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Get user data
      const userResponse = await axiosInstance.get('/users/me');
      
      return {
        token: token,
        user: userResponse.data,
      };
    }
    
    throw new Error('Login failed: No access token received');
  },
};

export const datasetService = {
  uploadDataset: async (file: File) => {
    try {
      // Validate file type
      if (!file.name.toLowerCase().endsWith('.csv')) {
        throw new Error('Only CSV files are supported');
      }

      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', file.name);
      formData.append('description', 'CSV file upload');

      // Upload request
      const response = await axiosInstance.post('/datasets/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error: any) {
      console.error('Upload error:', error.response?.data || error.message);
      throw error;
    }
  },
  getDatasets: async () => {
    const response = await axiosInstance.get('/datasets');
    return response.data;
  },
  getDatasetInfo: async (id: string) => {
    const response = await axiosInstance.get(`/datasets/${id}`);
    return response.data;
  },
};

export const analysisService = {
  create: async (request: AnalysisRequest) => {
    const response = await axiosInstance.post('/analysis', request);
    return response.data;
  },

  getAnalysis: async (analysisId: number) => {
    const response = await axiosInstance.get(`/analysis/${analysisId}`);
    return response.data;
  },

  list: async () => {
    const response = await axiosInstance.get('/analysis');
    return response.data;
  },

  delete: async (analysisId: string) => {
    await axiosInstance.delete(`/analysis/${analysisId}`);
  }
};

export const reportService = {
  createReport: async (analysisId: string, title: string, description: string) => {
    const response = await axiosInstance.post('/reports', {
      analysis_id: analysisId,
      title,
      description,
    });
    return response.data;
  },
  getReports: async () => {
    const response = await axiosInstance.get('/reports');
    return response.data;
  },
  getReport: async (id: string) => {
    const response = await axiosInstance.get(`/reports/${id}`);
    return response.data;
  },
}; 