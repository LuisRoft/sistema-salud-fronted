import { axiosInstance } from '@/lib/axios';
import { getSession } from 'next-auth/react';
import { get } from './requestHandler';

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

export const getAllInitialConsultations = async (token: string) => {
  const response = await get('/api/consultations', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const getAllSubsequentConsultations = async (token: string) => {
  const response = await get('/api/consultations/subsequent', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const getConsultationsByUser = async (token: string, userId: string) => {
  const response = await get(`/api/consultations/user/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}; 