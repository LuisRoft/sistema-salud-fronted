import { post } from './requestHandler';
import { InternalConsultationDTO } from '@/types/consultation/internal-consultation';

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