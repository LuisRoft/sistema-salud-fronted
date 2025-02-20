/* eslint-disable @typescript-eslint/no-explicit-any */
import { del, get, patch, post } from './requestHandler';
import { CreateLaboratoryRequestDTO } from '../types/labrequest/create-laboratory-request';
import { UpdateLaboratoryRequestDTO } from '../types/labrequest/update-laboratory-request';
import { LaboratoryRequestDTO } from '../types/labrequest/laboratory-request';
import { LabRequestRow } from '@/components/lab-request/columns';

/**
 * Crea una solicitud de laboratorio
 */
export const createLaboratoryRequest = async (data: CreateLaboratoryRequestDTO, token: string) => {
  try {
    console.log('🔍 URL de la petición:', '/laboratory-request');
    const res = await post('/laboratory-request', data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    console.error('❌ Error al crear la solicitud de laboratorio:', error);
    throw error;
  }
};


/**
 * Obtiene todas las solicitudes de laboratorio
 */
export const getLaboratoryRequests = async (token: string): Promise<LabRequestRow[]> => {
  try {
    const res = await get('/laboratory-request', {
      headers: { Authorization: `Bearer ${token}` },
    });

    return res.data.map((req: any) => ({
      id: req.id ?? crypto.randomUUID(), // ✅ Si `id` falta, se genera uno temporal
      numero_de_archivo: req.numero_de_archivo,
      diagnostico_descripcion1: req.diagnostico_descripcion1,
      diagnostico_cie1: req.diagnostico_cie1,
      diagnostico_descripcion2: req.diagnostico_descripcion2,
      diagnostico_cie2: req.diagnostico_cie2,
      prioridad: req.prioridad,
      hematologia_examenes: req.hematologia_examenes ?? [],
      coagulacion_examenes: req.coagulacion_examenes ?? [],
      quimica_sanguinea_examenes: req.quimica_sanguinea_examenes ?? [],
      orina_examenes: req.orina_examenes ?? [],
      heces_examenes: req.heces_examenes ?? [],
      hormonas_examenes: req.hormonas_examenes ?? [],
      serologia_examenes: req.serologia_examenes ?? [],
      userId: req.user?.id ?? '', // ✅ Evita `undefined`
      patientId: req.patient?.id ?? '', // ✅ Evita `undefined`
    }));
  } catch (error) {
    console.error('❌ Error al obtener las solicitudes de laboratorio:', error);
    throw error;
  }
};

/**
 * Obtiene una solicitud de laboratorio por su ID
 */
export const getLaboratoryRequestById = async (id: string, token: string): Promise<LaboratoryRequestDTO> => {
  try {
    const res = await get(`/laboratory-request/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    console.error(`❌ Error al obtener la solicitud con ID ${id}:`, error);
    throw error;
  }
};

/**
 * Actualiza una solicitud de laboratorio
 */
export const updateLaboratoryRequest = async (
  id: string,
  data: UpdateLaboratoryRequestDTO,
  token: string
): Promise<LaboratoryRequestDTO> => {
  try {
    const res = await patch(`/laboratory-request/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    console.error(`❌ Error al actualizar la solicitud con ID ${id}:`, error);
    throw error;
  }
};

/**
 * Elimina una solicitud de laboratorio
 */
export const deleteLaboratoryRequest = async (id: string, token: string): Promise<void> => {
  try {
    await del(`/laboratory-request/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (error) {
    console.error(`❌ Error al eliminar la solicitud con ID ${id}:`, error);
    throw error;
  }
};
