/* eslint-disable @typescript-eslint/no-explicit-any */
import { del, get, patch, post } from './requestHandler';
import { AxiosError } from 'axios';

export interface NursingFormData {
  nanda_dominio: string;
  nanda_clase: string;
  nanda_etiqueta_diagnostica: string;
  nanda_factor_relacionado: string;
  nanda_planteamiento_del_diagnostico: string;
  noc_resultado_noc: string;
  noc_dominio: string;
  noc_clase: string;
  noc_indicador: string[];
  noc_rango: string[];
  noc_diana_inicial: string[];
  noc_diana_esperada: string[];
  noc_evaluacion: string[];
  nic_intervencion: string[];
  nic_clase: string[];
  nic_actividades: string[];
  userId: string;
  patientId: string;
}

/**
 * Crea un fornulario de enfermeria
 */
export const createNursingForm = async (data: NursingFormData, token: string) => {
  try {
    console.log('🔍 Datos a enviar:', data);

    const response = await post('/nursing', data, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });

    return response.data;
  } catch (error) {
    console.error('❌ Error al crear el formulario:', error);
    if (error instanceof AxiosError) {
      console.error('🚨 Error detallado:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.response?.data?.message
      });
    }
    throw error;
  }
};
