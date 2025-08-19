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

export interface CreateNursingRequest extends Omit<NursingFormData, 'userId' | 'patientId'> {
  userId: string;
  patientId: string;
}

export interface UpdateNursingRequest extends Partial<NursingFormData> {
  id: string;
}

export interface NursingResponse extends NursingFormData {
  id: string;
  createdAt: string;
  updatedAt: string;
}
