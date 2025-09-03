import axios from 'axios';

// Get the backend URL from environment variables
const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';

export const axiosInstance = axios.create({
  baseURL: `${backendUrl}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Interceptor para agregar el token
axiosInstance.interceptors.request.use(async (config) => {
  if (typeof window !== 'undefined') {
    try {
      // Obtener el token de la sesión de NextAuth usando getSession
      const { getSession } = await import('next-auth/react');
      const session = await getSession();
      const token = session?.user?.access_token;

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error obteniendo la sesión:', error);
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