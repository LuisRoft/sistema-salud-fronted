import { MicrobiologyRequestDTO } from './microbiology-request';

export interface LaboratoryRequestDTO {
  id: string;  
  numero_de_archivo: string;
  diagnostico_descripcion1: string;
  diagnostico_cie1: string;
  diagnostico_descripcion2: string;
  diagnostico_cie2: string;
  fecha: string;
  prioridad: string;
  hematologia_examenes: string[];
  coagulacion_examenes: string[];
  quimica_sanguinea_examenes: string[];
  orina_examenes: string[];
  heces_examenes: string[];
  hormonas_examenes: string[];
  serologia_examenes: string[];
  userId: string;
  patientId: string;
  microbiologia?: MicrobiologyRequestDTO;
  patient?: {
    id: string;
    document?: string;
    name?: string;
    lastName?: string;
  };
}
