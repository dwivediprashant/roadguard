import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

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
    console.error('API Error:', error.response?.data || error.message);
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
  sendOTP: (phone: string) => api.post('/auth/send-otp', { phone }),
  verifyOTP: (phone: string, otp: string) => api.post('/auth/verify-otp', { phone, otp }),
  workerLogin: (credentials: any) => api.post('/auth/worker-login', credentials),
  userLogin: (credentials: any) => api.post('/auth/user-login', credentials),
  adminSignup: (adminData: any) => api.post('/auth/admin-signup', adminData),
  workerSignup: (workerData: any) => api.post('/auth/worker-signup', workerData),
  getCurrentUser: () => api.get('/auth/me'),
  updateProfile: (profileData: any) => api.put('/auth/profile', profileData),
  getShopInfo: (shopId: string) => api.get(`/auth/shop/${shopId}`),
  getShopWorkers: (shopId: string) => api.get(`/auth/shop/${shopId}/workers`),
  submitReview: (reviewData: any) => api.post('/auth/reviews', reviewData),
  getReviews: (workshopId: string) => api.get(`/auth/reviews/${workshopId}`),
  getWorkerProfile: (workerId: string) => api.get(`/auth/worker/${workerId}`),
  getAdminProfile: (adminId: string) => api.get(`/auth/admin/${adminId}`),
};

export const adminAPI = {
  getWorkers: () => api.get('/admin/workers'),
  getShopRequests: () => api.get('/admin/requests'),
  getMyShopWorkers: (shopId: string) => api.get(`/auth/shop/${shopId}/workers`),
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
  getShops: () => api.get('/requests/shops'),
  createServiceRequest: (requestData: any) => api.post('/requests/service-requests', requestData),
  getUserRequests: (userId: string) => api.get(`/requests/user/${userId}`),
  deleteRequest: (requestId: string) => api.delete(`/requests/${requestId}`),
  getServiceTracking: (userId: string) => api.get(`/requests/service-tracking/user/${userId}`),
};

export const workshopAPI = {
  getWorkshops: (params?: any) => api.get('/workshops', { params }),
  getWorkshop: (id: string) => api.get(`/workshops/${id}`),
  createWorkshop: (workshopData: any) => api.post('/workshops', workshopData),
  updateWorkshop: (id: string, workshopData: any) => api.put(`/workshops/${id}`, workshopData),
  deleteWorkshop: (id: string) => api.delete(`/workshops/${id}`),
};

export default api;