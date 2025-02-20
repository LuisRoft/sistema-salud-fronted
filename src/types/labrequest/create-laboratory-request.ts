export interface CreateLaboratoryRequestDTO {
    id?: string; 
    numero_de_archivo: string;
    diagnostico_descripcion1: string;
    diagnostico_cie1: string;
    diagnostico_descripcion2: string;
    diagnostico_cie2: string;
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
    microbiologia?: {
      muestra: string;
      sitio_anatomico: string;
      cultivo_y_antibiograma?: boolean;
      cristalografia?: boolean;
      gram?: boolean;
      fresco?: boolean;
      estudio_micologico_koh: string;
      cultivo_micotico: string;
      investigacion_paragonimus_spp: string;
      investigacion_histoplasma_spp: string;
      coloracion_zhiel_nielsen: string;
    };
  }
  