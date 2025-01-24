import axios from 'axios';
import { store } from '../store';
import { logout } from '../store/slices/authSlice';

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
  login: async (email: string, password: string) => {
    // Create form data
    const formData = new URLSearchParams();
    formData.append('username', email); // Backend expects 'username' field
    formData.append('password', password);
    
    const response = await axiosInstance.post('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    if (response.data.access_token) {
      // Store the token
      const token = response.data.access_token;
      localStorage.setItem('token', token);
      
      // Fetch user data
      const userResponse = await axiosInstance.get('/users/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      return {
        user: userResponse.data,
        token: token,
      };
    }
    return response.data;
  },
  register: async (email: string, password: string, name: string) => {
    const response = await axiosInstance.post('/auth/register', { email, password, name });
    return response.data;
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
      // Add fields in the correct order
      formData.append('name', file.name);
      formData.append('description', 'CSV file upload');
      formData.append('file', file);

      console.log('Uploading file:', file.name);
      console.log('Form data entries:');
      for (let [key, value] of formData.entries()) {
        console.log(key, ':', value);
      }

      // Simple post request with FormData
      const response = await axiosInstance.post('/datasets/upload', formData);
      console.log('Upload successful:', response.data);
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
  list: async () => {
    const response = await axiosInstance.get('/analyses');
    return response.data;
  },
  create: async (request: { dataset_id: string; analysis_type: string; config: any }) => {
    const response = await axiosInstance.post('/analyses', request);
    return response.data;
  },
  getResults: async (datasetId: string, analysisType: string, config: any) => {
    const response = await axiosInstance.get(`/analyses/${datasetId}/results`, {
      params: { type: analysisType, ...config },
    });
    return response.data;
  },
  delete: async (analysisId: string) => {
    await axiosInstance.delete(`/analyses/${analysisId}`);
  },
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