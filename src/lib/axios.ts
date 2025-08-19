import axios from 'axios';

export const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token
axiosInstance.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    // Obtener el token de la sesión de NextAuth
    const session = JSON.parse(localStorage.getItem('next-auth.session-token') || '{}');
    const token = session?.user?.access_token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
}, (error) => {
  console.error('Error en el interceptor de request:', error);
  return Promise.reject(error);
});

// Interceptor para manejar errores
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.data?.message) {
      console.error('Errores del backend:', error.response.data.message);
    }
    return Promise.reject(error);
  }
); 