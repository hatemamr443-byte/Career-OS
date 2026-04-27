"use client";
import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.career-os.app';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = Cookies.get('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = Cookies.get('refresh_token');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          });
          Cookies.set('access_token', response.data.access_token);
          Cookies.set('refresh_token', response.data.refresh_token);
          originalRequest.headers.Authorization = `Bearer ${response.data.access_token}`;
          return api(originalRequest);
        } catch (refreshError) {
          Cookies.remove('access_token');
          Cookies.remove('refresh_token');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
};

export const jobsAPI = {
  list: (params?: any) => api.get('/jobs', { params }),
  create: (data: any) => api.post('/jobs', data),
  score: (jobId: number) => api.post('/jobs/score', { job_id: jobId }),
  apply: (jobId: number, notes?: string) => api.post('/jobs/apply', { job_id: jobId, notes }),
  skip: (jobId: number, notes?: string) => api.post('/jobs/skip', { job_id: jobId, notes }),
};

export const emailsAPI = {
  list: (params?: any) => api.get('/emails', { params }),
  create: (data: any) => api.post('/emails', data),
  classify: (emailId: number) => api.post('/emails/classify', { email_id: emailId }),
};

export const gamificationAPI = {
  getProfile: () => api.get('/gamification/me'),
  getActivities: () => api.get('/gamification/activities'),
  getBadges: () => api.get('/gamification/badges'),
  postEvent: (data: any) => api.post('/gamification/events', data),
};

export const profileAPI = {
  get: () => api.get('/profile'),
  update: (data: any) => api.put('/profile', data),
};
