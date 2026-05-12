import axios from 'axios';

// IP хаягийг динамикаар авах (Network Error-оос сэргийлнэ)
const BASE_URL = import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:3000`;

const api = axios.create({
  baseURL: BASE_URL, 
  withCredentials: false, // ← CORS засах хүртэл false. Backend credentials:true болгосны дараа true буцаа
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// 1. Request Interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 2. Response Interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Сүлжээний алдаа (Server унтарсан үед)
    if (!error.response) {
      return Promise.reject(error);
    }

    const skipRetry =
      originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/auth/refresh') ||
      originalRequest.url?.includes('/auth/signup');

    // 401 алдаа гарсан бөгөөд өмнө нь дахин оролдоогүй бол
    if (error.response.status === 401 && !originalRequest._retry && !skipRetry) {

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // refresh хүсэлтийг api биш axios-оор шууд явуулах нь interceptor-ын гогцооноос сэргийлнэ
        const response = await axios.post(
          `${BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const { accessToken } = response.data;
        localStorage.setItem('accessToken', accessToken);

        // Header-үүдийг шинэчлэх
        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        processQueue(null, accessToken);
        isRefreshing = false; // 🔥 ЧУХАЛ: Дараагийн refresh-д зориулж чөлөөлөх
        
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false; // 🔥 ЧУХАЛ: Алдаа гарсан ч чөлөөлөх
        
        localStorage.removeItem('accessToken');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;