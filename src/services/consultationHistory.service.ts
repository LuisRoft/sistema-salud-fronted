import { get } from './requestHandler';

export interface BaseConsultation {
  id: string;
  numeroDeArchivo: number;
  fecha: string;
  patient: {
    name: string;
    lastName: string;
    document: string;
  };
  motivoConsulta: string;
  diagnosticosDesc: string[] | string;
  type?: string; // Para identificar el tipo de consulta
  // Campos adicionales para consulta externa
  antecedentesPersonales?: string[];
  antecedentesFamiliares?: string[];
  sistemasRevisados?: string[];
  diagnosticosCie?: string[];
  planTratamiento?: string;
  // Campos adicionales para consulta interna
  servicio?: string;
  especialidadConsultada?: string;
  esUrgente?: boolean;
  cuadroClinicoActual?: string;
  examenesResultados?: string[];
  planDiagnosticoPropuesto?: string;
  planTerapeuticoPropuesto?: string;
  // Campos adicionales para enfermería
  nanda_dominio?: string;
  nanda_clase?: string;
  nanda_factor_relacionado?: string;
  resultadosNoc?: string[];
  intervencionesNic?: string[];
  // Campos adicionales para laboratorio
  diagnostico_descripcion1?: string;
  diagnostico_descripcion2?: string;
  diagnostico_cie1?: string;
  diagnostico_cie2?: string;
  prioridad?: string;
  hematologia_examenes?: string[];
  coagulacion_examenes?: string[];
  quimica_sanguinea_examenes?: string[];
  orina_examenes?: string[];
  heces_examenes?: string[];
  hormonas_examenes?: string[];
  serologia_examenes?: string[];
  // Campos adicionales para evaluación neurológica
  edad?: number;
  discapacidad?: string;
  diagnostico?: string;
  antecedentesHeredofamiliares?: string;
  antecedentesFarmacologicos?: string;
  alergias?: string;
  utilizaSillaRuedas?: boolean;
  comentariosExaminador?: string;
  resumenResultados?: string;
  barthelTotal?: number;
}

export interface ConsultationResponse {
  consultations: BaseConsultation[];
  total: number;
}

// Obtener consultas externas
export const getConsultations = async (token: string): Promise<ConsultationResponse> => {
  try {
    console.log('ola')
    const response = await get('/consultations', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('response consulations', response)
    
    // Procesar directamente los datos de la respuesta
    const consultations = response.data?.consultations || [];
    return {
      consultations: consultations.map((consultation: any) => ({
        id: consultation.id,
        numeroDeArchivo: consultation.numeroDeArchivo,
        fecha: consultation.fecha,
        patient: consultation.patient,
        motivoConsulta: consultation.motivoConsulta,
        diagnosticosDesc: Array.isArray(consultation.diagnosticosDesc) 
          ? consultation.diagnosticosDesc 
          : [consultation.diagnosticosDesc].filter(Boolean),
        type: 'Consulta Externa',
        servicio: consultation.servicio,
        antecedentesPersonales: consultation.antecedentesPersonales,
        antecedentesFamiliares: consultation.antecedentesFamiliares,
        sistemasRevisados: consultation.sistemasRevisados,
        diagnosticosCie: consultation.diagnosticosCie,
        planTratamiento: consultation.planTratamiento
      })),
      total: consultations.length
    };
  } catch (error) {
    console.error('Error en consultas externas:', error);
    return { consultations: [], total: 0 };
  }
};

// Obtener consultas internas
export const getInternalConsultations = async (token: string): Promise<ConsultationResponse> => {
  try {
    const response = await get('/consultations-internal', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const consultations = Array.isArray(response.data) ? response.data : [];
    return {
      consultations: consultations.map((consultation: any) => ({
        id: consultation.id,
        numeroDeArchivo: consultation.numeroDeArchivo,
        fecha: consultation.fecha,
        patient: consultation.patient,
        motivoConsulta: consultation.motivoConsulta,
        diagnosticosDesc: consultation.diagnosticosDesc || [],
        type: 'Consulta Interna',
        servicio: consultation.servicio,
        especialidadConsultada: consultation.especialidadConsultada,
        esUrgente: consultation.esUrgente,
        cuadroClinicoActual: consultation.cuadroClinicoActual,
        examenesResultados: consultation.examenesResultados,
        planDiagnosticoPropuesto: consultation.planDiagnosticoPropuesto,
        planTerapeuticoPropuesto: consultation.planTerapeuticoPropuesto
      })),
      total: consultations.length
    };
  } catch (error) {
    console.error('Error en consultas internas:', error);
    return { consultations: [], total: 0 };
  }
};

// Obtener consultas de enfermería
export const getNursingConsultations = async (token: string): Promise<ConsultationResponse> => {
  try {
    const response = await get('/nursing', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const consultations = Array.isArray(response.data) ? response.data : [];
    return {
      consultations: consultations.map((consultation: any) => ({
        id: consultation.id,
        numeroDeArchivo: consultation.numeroDeArchivo || 0,
        fecha: consultation.fecha || consultation.createdAt,
        patient: consultation.patient,
        motivoConsulta: consultation.nanda_etiqueta_diagnostica || 'Sin motivo especificado',
        diagnosticosDesc: [consultation.nanda_dominio, consultation.nanda_clase].filter(Boolean),
        type: 'Consulta Enfermería',
        nanda_dominio: consultation.nanda_dominio,
        nanda_clase: consultation.nanda_clase,
        nanda_factor_relacionado: consultation.nanda_factor_relacionado,
        resultadosNoc: consultation.resultadosNoc,
        intervencionesNic: consultation.intervencionesNic
      })),
      total: consultations.length
    };
  } catch (error) {
    console.error('Error en consultas de enfermería:', error);
    return { consultations: [], total: 0 };
  }
};

// Obtener solicitudes de laboratorio
export const getLaboratoryRequests = async (token: string): Promise<ConsultationResponse> => {
  try {
    const response = await get('/laboratory-request', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const requests = response.data?.requests || [];
    return {
      consultations: requests.map((request: any) => ({
        id: request.id,
        numeroDeArchivo: request.numero_de_archivo || 0,
        fecha: request.createdAt || request.fecha,
        patient: request.patient,
        motivoConsulta: 'Solicitud de exámenes de laboratorio',
        diagnosticosDesc: [
          request.diagnostico_descripcion1,
          request.diagnostico_descripcion2
        ].filter(Boolean),
        type: 'Solicitud Laboratorio',
        diagnostico_descripcion1: request.diagnostico_descripcion1,
        diagnostico_descripcion2: request.diagnostico_descripcion2,
        diagnostico_cie1: request.diagnostico_cie1,
        diagnostico_cie2: request.diagnostico_cie2,
        prioridad: request.prioridad,
        hematologia_examenes: request.hematologia_examenes,
        coagulacion_examenes: request.coagulacion_examenes,
        quimica_sanguinea_examenes: request.quimica_sanguinea_examenes,
        orina_examenes: request.orina_examenes,
        heces_examenes: request.heces_examenes,
        hormonas_examenes: request.hormonas_examenes,
        serologia_examenes: request.serologia_examenes
      })),
      total: requests.length
    };
  } catch (error) {
    console.error('Error en solicitudes de laboratorio:', error);
    return { consultations: [], total: 0 };
  }
};

// Nuevo método para obtener todas las consultas en una sola llamada
export const getAllConsultations = async (token: string) => {
  try {
    // Hacer todas las llamadas en paralelo
    const [externasResp, internasResp, enfermeriaResp, laboratorioResp, neurologicaResp] = await Promise.all([
      get('/consultations', {
        headers: { Authorization: `Bearer ${token}` }
      }),
      get('/consultations-internal', {
        headers: { Authorization: `Bearer ${token}` }
      }),
      get('/nursing', {
        headers: { Authorization: `Bearer ${token}` }
      }),
      get('/laboratory-request', {
        headers: { Authorization: `Bearer ${token}` }
      }),
      get('/neurologica', {
        headers: { Authorization: `Bearer ${token}` }
      })
    ]);

    // Procesar consultas externas
    const externas = externasResp.data?.consultations?.map((consultation: any) => ({
      id: consultation.id,
      numeroDeArchivo: consultation.numeroDeArchivo,
      fecha: consultation.fecha,
      patient: consultation.patient,
      motivoConsulta: consultation.motivoConsulta,
      diagnosticosDesc: Array.isArray(consultation.diagnosticosDesc) 
        ? consultation.diagnosticosDesc 
        : [consultation.diagnosticosDesc].filter(Boolean),
      type: 'Consulta Externa',
      servicio: consultation.servicio,
      antecedentesPersonales: consultation.antecedentesPersonales,
      antecedentesFamiliares: consultation.antecedentesFamiliares,
      sistemasRevisados: consultation.sistemasRevisados,
      diagnosticosCie: consultation.diagnosticosCie,
      planTratamiento: consultation.planTratamiento
    })) || [];

    // Procesar consultas internas
    const internas = (Array.isArray(internasResp.data) ? internasResp.data : []).map((consultation: any) => ({
      id: consultation.id,
      numeroDeArchivo: consultation.numeroDeArchivo,
      fecha: consultation.fecha,
      patient: consultation.patient,
      motivoConsulta: consultation.motivoConsulta,
      diagnosticosDesc: consultation.diagnosticosDesc || [],
      type: 'Consulta Interna',
      servicio: consultation.servicio,
      especialidadConsultada: consultation.especialidadConsultada,
      esUrgente: consultation.esUrgente,
      cuadroClinicoActual: consultation.cuadroClinicoActual,
      examenesResultados: consultation.examenesResultados,
      planDiagnosticoPropuesto: consultation.planDiagnosticoPropuesto,
      planTerapeuticoPropuesto: consultation.planTerapeuticoPropuesto
    }));

    // Procesar consultas de enfermería
    const enfermeria = (Array.isArray(enfermeriaResp.data) ? enfermeriaResp.data : []).map((consultation: any) => ({
      id: consultation.id,
      numeroDeArchivo: consultation.numeroDeArchivo || 0,
      fecha: consultation.fecha || consultation.createdAt,
      patient: consultation.patient,
      motivoConsulta: consultation.nanda_etiqueta_diagnostica || 'Sin motivo especificado',
      diagnosticosDesc: [consultation.nanda_dominio, consultation.nanda_clase].filter(Boolean),
      type: 'Consulta Enfermería',
      nanda_dominio: consultation.nanda_dominio,
      nanda_clase: consultation.nanda_clase,
      nanda_factor_relacionado: consultation.nanda_factor_relacionado,
      resultadosNoc: consultation.resultadosNoc,
      intervencionesNic: consultation.intervencionesNic
    }));

    // Procesar solicitudes de laboratorio
    const laboratorio = (laboratorioResp.data?.requests || []).map((request: any) => ({
      id: request.id,
      numeroDeArchivo: request.numero_de_archivo || 0,
      fecha: request.createdAt || request.fecha,
      patient: request.patient,
      motivoConsulta: 'Solicitud de exámenes de laboratorio',
      diagnosticosDesc: [
        request.diagnostico_descripcion1,
        request.diagnostico_descripcion2
      ].filter(Boolean),
      type: 'Solicitud Laboratorio',
      diagnostico_descripcion1: request.diagnostico_descripcion1,
      diagnostico_descripcion2: request.diagnostico_descripcion2,
      diagnostico_cie1: request.diagnostico_cie1,
      diagnostico_cie2: request.diagnostico_cie2,
      prioridad: request.prioridad,
      hematologia_examenes: request.hematologia_examenes,
      coagulacion_examenes: request.coagulacion_examenes,
      quimica_sanguinea_examenes: request.quimica_sanguinea_examenes,
      orina_examenes: request.orina_examenes,
      heces_examenes: request.heces_examenes,
      hormonas_examenes: request.hormonas_examenes,
      serologia_examenes: request.serologia_examenes
    }));

    // Procesar evaluaciones neurológicas
    const neurologica = (neurologicaResp.data?.neurologicas || []).map((evaluation: any) => ({
      id: evaluation.id,
      numeroDeArchivo: 0, // Las evaluaciones neurológicas no tienen número de archivo
      fecha: evaluation.createdAt || evaluation.fecha,
      patient: {
        name: evaluation.name || '',
        lastName: '', // El nombre completo está en el campo 'name'
        document: evaluation.ci || ''
      },
      motivoConsulta: 'Evaluación neurológica',
      diagnosticosDesc: [evaluation.diagnostico, evaluation.discapacidad].filter(Boolean),
      type: 'Evaluación Neurológica',
      edad: evaluation.edad,
      discapacidad: evaluation.discapacidad,
      diagnostico: evaluation.diagnostico,
      antecedentesHeredofamiliares: evaluation.antecedentesHeredofamiliares,
      antecedentesFarmacologicos: evaluation.antecedentesFarmacologicos,
      alergias: evaluation.alergias,
      utilizaSillaRuedas: evaluation.utilizaSillaRuedas,
      comentariosExaminador: evaluation.comentariosExaminador,
      resumenResultados: evaluation.resumenResultados,
      barthelTotal: evaluation.barthelTotal
    }));

    // Combinar todas las consultas
    const allConsultations = [...externas, ...internas, ...enfermeria, ...laboratorio, ...neurologica];

    return {
      consultations: allConsultations,
      stats: {
        externas: externas.length,
        internas: internas.length,
        enfermeria: enfermeria.length,
        laboratorio: laboratorio.length,
        neurologica: neurologica.length,
        total: allConsultations.length
      }
    };
  } catch (error) {
    console.error('Error al obtener las consultas:', error);
    throw error;
  }
};