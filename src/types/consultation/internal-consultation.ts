export interface InternalConsultationDTO {
  numeroDeArchivo: number;
  fecha: string;
  motivoConsulta: string;
  servicio: string;
  especialidadConsultada: string;
  esUrgente: boolean;
  cuadroClinicoActual: string;
  examenesResultados: string[];
  diagnosticosDesc: string[];
  diagnosticosCie: string[];
  diagnosticosCif: string[]; // Nuevo campo para códigos CIF
  diagnosticosPresuntivo: boolean[];
  diagnosticosDefinitivo: boolean[];
  planTratamiento: string;
  cuadroClinicoInterconsulta: string;
  planDiagnosticoPropuesto: string;
  planTerapeuticoPropuesto: string;
  patient: string;
  user: string;
} 