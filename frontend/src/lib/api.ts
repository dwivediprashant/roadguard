import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirect based on current path
      const currentPath = window.location.pathname;
      if (currentPath.startsWith('/worker')) {
        window.location.href = '/worker-login';
      } else {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (userData: any) => api.post('/auth/register', userData),
  login: (credentials: any) => api.post('/auth/login', credentials),
  workerLogin: (credentials: any) => api.post('/auth/worker-login', credentials),
  userLogin: (credentials: any) => api.post('/auth/user-login', credentials),
  getCurrentUser: () => api.get('/auth/me'),
  updateProfile: (profileData: any) => api.put('/auth/profile', profileData),
  getAllUsers: () => api.get('/auth/users'),
  updateUserRole: (userId: string, userType: string) => api.put(`/auth/users/${userId}/role`, { userType }),
};

export const workerAPI = {
  getProfile: () => api.get('/worker/profile'),
  updateAvailability: (availability: string) => api.put('/worker/availability', { availability }),
  getTasks: (params?: any) => api.get('/worker/tasks', { params }),
  getTask: (id: string) => api.get(`/worker/tasks/${id}`),
  updateTaskStatus: (id: string, status: string) => api.put(`/worker/tasks/${id}/status`, { status }),
  addTaskNote: (id: string, message: string) => api.post(`/worker/tasks/${id}/notes`, { message }),
  updateLiveLocation: (id: string, lat: number, lng: number) => api.put(`/worker/tasks/${id}/location`, { lat, lng }),
};

export const requestAPI = {
  getAll: () => api.get('/requests'),
  create: (requestData: any) => api.post('/requests', requestData),
  update: (id: string, requestData: any) => api.put(`/requests/${id}`, requestData),
};

export const workshopAPI = {
  getWorkshops: (params?: any) => api.get('/workshops', { params }),
  getWorkshop: (id: string) => api.get(`/workshops/${id}`),
};

export default api;