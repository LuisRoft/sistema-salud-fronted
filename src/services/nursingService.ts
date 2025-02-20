/* eslint-disable @typescript-eslint/no-explicit-any */
import { del, get, patch, post } from './requestHandler';

/**
 * Crea un fornulario de enfermeria
 */
export const createNursingForm = async (data, token: string) => {
  try {
    console.log('🔍 URL de la petición:', '/nursing');
    const res = await post('/api/nursing', data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    console.error('❌ Error al crear el formulario de enfermería:', error);
    throw error;
  }
};
