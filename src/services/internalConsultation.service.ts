import { post, get } from './requestHandler';
import { InternalConsultationDTO } from '@/types/consultation/internal-consultation';

// Crear consulta interna
export const createInternalConsultation = async (data: InternalConsultationDTO, token: string) => {
  try {
    const url = '/consultations-internal';
    console.log('🔍 Intentando POST a:', url);
    console.log('📝 Datos enviados:', data);
    
    const res = await post(url, data, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });
    
    console.log('✅ Respuesta exitosa:', res.data);
    return res.data;
  } catch (error) {
    console.error('❌ Error detallado:', error);
    if (error.response) {
      console.error('Respuesta del servidor:', error.response.data);
    }
    throw error;
  }
};

// Obtener todas las consultas internas
export const getAllInternalConsultations = async (token: string) => {
  const response = await get('/api/consultations-internal', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// Obtener una consulta interna por ID
export const getInternalConsultationById = async (token: string, id: string) => {
  const response = await get(`/api/consultations-internal/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// Obtener consultas internas por usuario
export const getInternalConsultationsByUser = async (token: string, userId: string) => {
  const response = await get(`/api/consultations-internal/user/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};