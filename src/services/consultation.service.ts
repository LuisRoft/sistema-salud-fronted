import { axiosInstance } from '@/lib/axios';
import { getSession } from 'next-auth/react';

export const createInitialConsultation = async (consultationData: any) => {
  try {
    const session = await getSession();
    const token = session?.user?.access_token;

    if (!token) {
      throw new Error('No hay token de autenticación');
    }

    const response = await axiosInstance.post('/api/consultations/initial', consultationData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    if (error.response?.data?.message) {
      console.error('Error del servidor:', error.response.data.message);
      throw new Error(Array.isArray(error.response.data.message) 
        ? error.response.data.message.join(', ') 
        : error.response.data.message);
    }
    throw error;
  }
}; 