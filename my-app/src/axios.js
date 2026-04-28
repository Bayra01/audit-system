import axios from 'axios';

// 1. Axios Instance үүсгэх
const api = axios.create({
  // .env файл дахь VITE_API_BASE_URL-ийг ашиглана
  // Анхаар: baseURL-д Swagger-ийн /api-docs хаягийг биш, жинхэнэ API-ийн /api замыг бичнэ!
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api', 
  withCredentials: true, // Күүки дамжуулахад хэрэгтэй
});

// 2. Request Interceptor: Хүсэлт явахаас өмнө токен хавсаргах
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

// 3. Response Interceptor: Хариу ирэх үед ажиллана (Refresh token логик)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // error.response байгаа эсэхийг заавал шалгах (Network error-оос сэргийлнэ)
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Шинэ Access Token авах (BaseURL ашиглах нь илүү найдвартай)
        const response = await axios.post(
          `${api.defaults.baseURL}/refresh`, 
          {}, 
          { withCredentials: true }
        );
        
        const { accessToken } = response.data;

        // Шинэ токеноо хадгалаад, анхны хүсэлтээ дахин илгээнэ
        localStorage.setItem('accessToken', accessToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh token ажиллахгүй бол нэвтрэх хэсэг рүү шилжүүлнэ
        localStorage.removeItem('accessToken');
        // window.location.href = '/login'; // Эсвэл өөрийн navigate функц
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;