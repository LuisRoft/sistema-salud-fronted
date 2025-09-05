export interface ExternalConsultationDTO {
  institucionSistema: string;
  unicodigo: string;
  establecimientoSalud: string;
  numeroHistoriaClinica: string;
  numeroArchivo: string;
  numeroHoja: string;
  primerApellido: string;
  segundoApellido?: string;
  primerNombre: string;
  segundoNombre?: string;
  sexo: string;
  edad: number;
  motivoConsulta: string;
  motivoConsultaPrimera: string;
  motivoConsultaSubsecuente?: string;
  antecedentesPatologicosPersonales: string[];
  antecedentesPatologicosPersonalesDesc?: string;
  antecedentesPatologicosFamiliares: string[];
  antecedentesPatologicosFamiliaresDesc?: string;
  enfermedadActual: string;
  constantesVitales: {
    fecha: string;
    hora: string;
    temperatura: number;
    presionArterial: string;
    frecuenciaCardiaca: number;
    frecuenciaRespiratoria: number;
    peso: number;
    talla: number;
    imc: number;
    perimetroAbdominal: number;
    hemoglobinaCapilar: number;
    glucosaCapilar: number;
    pulsioximetria: number;
  };
  revisionOrganosSistemas: {
    pielAnexos?: string;
    organosSentidos?: string;
    respiratorio?: string;
    cardioVascular?: string;
    digestivo?: string;
    genitoUrinario?: string;
    musculoEsqueletico?: string;
    endocrino?: string;
    hemolinfatico?: string;
    nervioso?: string;
  };
  examenFisico: {
    pielFaneras?: string;
    cabeza?: string;
    ojos?: string;
    oidos?: string;
    nariz?: string;
    boca?: string;
    cuello?: string;
    torax?: string;
    abdomen?: string;
    extremidades?: string;
    genitales?: string;
    sistemaNervioso?: string;
  };
  diagnosticos: {
    desc: string;
    cie: string;
    cif: string; // Nuevo campo para código CIF
    presuntivo: boolean;
    definitivo: boolean;
  }[];
  planTratamiento: string;
  observaciones?: string;
  user: string;
  patient: string;
} 