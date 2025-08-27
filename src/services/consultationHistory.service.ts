// consultations.client.ts
import { get } from './requestHandler';

/* ========= Tipos ========= */

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
  type?: string;

  // Externa
  antecedentesPersonales?: string[];
  antecedentesFamiliares?: string[];
  sistemasRevisados?: string[];
  diagnosticosCie?: string[];
  planTratamiento?: string;

  // Interna
  servicio?: string;
  especialidadConsultada?: string;
  esUrgente?: boolean;
  cuadroClinicoActual?: string;
  examenesResultados?: string[];
  planDiagnosticoPropuesto?: string;
  planTerapeuticoPropuesto?: string;

  // Enfermería
  nanda_dominio?: string;
  nanda_clase?: string;
  nanda_factor_relacionado?: string;
  resultadosNoc?: string[];
  intervencionesNic?: string[];

  // Laboratorio
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

  // Neurológica
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

/* ========= Fetch: listas por módulo ========= */

export const getConsultations = async (token: string): Promise<ConsultationResponse> => {
  try {
    const response = await get('/consultations', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const consultations = response.data?.consultations || [];
    return {
      consultations: consultations.map((c: any) => ({
        id: c.id,
        numeroDeArchivo: c.numeroDeArchivo,
        fecha: c.fecha,
        patient: c.patient,
        motivoConsulta: c.motivoConsulta,
        diagnosticosDesc: Array.isArray(c.diagnosticosDesc) ? c.diagnosticosDesc : [c.diagnosticosDesc].filter(Boolean),
        type: 'Consulta Externa',
        servicio: c.servicio,
        antecedentesPersonales: c.antecedentesPersonales,
        antecedentesFamiliares: c.antecedentesFamiliares,
        sistemasRevisados: c.sistemasRevisados,
        diagnosticosCie: c.diagnosticosCie,
        planTratamiento: c.planTratamiento,
      })),
      total: consultations.length,
    };
  } catch (error) {
    console.error('Error en consultas externas:', error);
    return { consultations: [], total: 0 };
  }
};

export const getInternalConsultations = async (token: string): Promise<ConsultationResponse> => {
  try {
    const response = await get('/consultations-internal', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const consultations = Array.isArray(response.data) ? response.data : [];
    return {
      consultations: consultations.map((c: any) => ({
        id: c.id,
        numeroDeArchivo: c.numeroDeArchivo,
        fecha: c.fecha,
        patient: c.patient,
        motivoConsulta: c.motivoConsulta,
        diagnosticosDesc: c.diagnosticosDesc || [],
        type: 'Consulta Interna',
        servicio: c.servicio,
        especialidadConsultada: c.especialidadConsultada,
        esUrgente: c.esUrgente,
        cuadroClinicoActual: c.cuadroClinicoActual,
        examenesResultados: c.examenesResultados,
        planDiagnosticoPropuesto: c.planDiagnosticoPropuesto,
        planTerapeuticoPropuesto: c.planTerapeuticoPropuesto,
      })),
      total: consultations.length,
    };
  } catch (error) {
    console.error('Error en consultas internas:', error);
    return { consultations: [], total: 0 };
  }
};

export const getNursingConsultations = async (token: string): Promise<ConsultationResponse> => {
  try {
    const response = await get('/nursing', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const consultations = Array.isArray(response.data) ? response.data : [];
    return {
      consultations: consultations.map((c: any) => ({
        id: c.id,
        numeroDeArchivo: c.numeroDeArchivo || 0,
        fecha: c.fecha || c.createdAt,
        patient: c.patient,
        motivoConsulta: c.nanda_etiqueta_diagnostica || 'Sin motivo especificado',
        diagnosticosDesc: [c.nanda_dominio, c.nanda_clase].filter(Boolean),
        type: 'Consulta Enfermería',
        nanda_dominio: c.nanda_dominio,
        nanda_clase: c.nanda_clase,
        nanda_factor_relacionado: c.nanda_factor_relacionado,
        resultadosNoc: c.resultadosNoc,
        intervencionesNic: c.intervencionesNic,
      })),
      total: consultations.length,
    };
  } catch (error) {
    console.error('Error en consultas de enfermería:', error);
    return { consultations: [], total: 0 };
  }
};

export const getLaboratoryRequests = async (token: string): Promise<ConsultationResponse> => {
  try {
    const response = await get('/laboratory-request', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const requests = response.data?.requests || [];
    return {
      consultations: requests.map((r: any) => ({
        id: r.id,
        numeroDeArchivo: r.numero_de_archivo || 0,
        fecha: r.createdAt || r.fecha,
        patient: r.patient,
        motivoConsulta: 'Solicitud de exámenes de laboratorio',
        diagnosticosDesc: [r.diagnostico_descripcion1, r.diagnostico_descripcion2].filter(Boolean),
        type: 'Solicitud Laboratorio',
        diagnostico_descripcion1: r.diagnostico_descripcion1,
        diagnostico_descripcion2: r.diagnostico_descripcion2,
        diagnostico_cie1: r.diagnostico_cie1,
        diagnostico_cie2: r.diagnostico_cie2,
        prioridad: r.prioridad,
        hematologia_examenes: r.hematologia_examenes,
        coagulacion_examenes: r.coagulacion_examenes,
        quimica_sanguinea_examenes: r.quimica_sanguinea_examenes,
        orina_examenes: r.orina_examenes,
        heces_examenes: r.heces_examenes,
        hormonas_examenes: r.hormonas_examenes,
        serologia_examenes: r.serologia_examenes,
      })),
      total: requests.length,
    };
  } catch (error) {
    console.error('Error en solicitudes de laboratorio:', error);
    return { consultations: [], total: 0 };
  }
};

export const getNeurologicEvaluations = async (token: string): Promise<ConsultationResponse> => {
  try {
    const response = await get('/neurologica', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const neurologicas = response.data?.neurologicas || response.data || [];
    const list = Array.isArray(neurologicas) ? neurologicas : [];
    return {
      consultations: list.map((e: any) => ({
        id: e.id,
        numeroDeArchivo: 0,
        fecha: e.createdAt || e.fecha,
        patient: {
          name: e.name || '',
          lastName: '',
          document: e.ci || '',
        },
        motivoConsulta: 'Evaluación neurológica',
        diagnosticosDesc: [e.diagnostico, e.discapacidad].filter(Boolean),
        type: 'Evaluación Neurológica',
        edad: e.edad,
        discapacidad: e.discapacidad,
        diagnostico: e.diagnostico,
        antecedentesHeredofamiliares: e.antecedentesHeredofamiliares,
        antecedentesFarmacologicos: e.antecedentesFarmacologicos,
        alergias: e.alergias,
        utilizaSillaRuedas: e.utilizaSillaRuedas,
        comentariosExaminador: e.comentariosExaminador,
        resumenResultados: e.resumenResultados,
        barthelTotal: e.barthelTotal,
      })),
      total: list.length,
    };
  } catch (error) {
    console.error('Error en evaluaciones neurológicas:', error);
    return { consultations: [], total: 0 };
  }
};

/* ========= Fetch: todas combinadas ========= */

export const getAllConsultations = async (token: string) => {
  try {
    const [externasResp, internasResp, enfermeriaResp, laboratorioResp, neurologicaResp] =
      await Promise.all([
        get('/consultations', { headers: { Authorization: `Bearer ${token}` } }),
        get('/consultations-internal', { headers: { Authorization: `Bearer ${token}` } }),
        get('/nursing', { headers: { Authorization: `Bearer ${token}` } }),
        get('/laboratory-request', { headers: { Authorization: `Bearer ${token}` } }),
        get('/neurologica', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

    const externas =
      externasResp.data?.consultations?.map((c: any) => ({
        id: c.id,
        numeroDeArchivo: c.numeroDeArchivo,
        fecha: c.fecha,
        patient: c.patient,
        motivoConsulta: c.motivoConsulta,
        diagnosticosDesc: Array.isArray(c.diagnosticosDesc) ? c.diagnosticosDesc : [c.diagnosticosDesc].filter(Boolean),
        type: 'Consulta Externa',
        servicio: c.servicio,
        antecedentesPersonales: c.antecedentesPersonales,
        antecedentesFamiliares: c.antecedentesFamiliares,
        sistemasRevisados: c.sistemasRevisados,
        diagnosticosCie: c.diagnosticosCie,
        planTratamiento: c.planTratamiento,
      })) || [];

    const internas = (Array.isArray(internasResp.data) ? internasResp.data : []).map((c: any) => ({
      id: c.id,
      numeroDeArchivo: c.numeroDeArchivo,
      fecha: c.fecha,
      patient: c.patient,
      motivoConsulta: c.motivoConsulta,
      diagnosticosDesc: c.diagnosticosDesc || [],
      type: 'Consulta Interna',
      servicio: c.servicio,
      especialidadConsultada: c.especialidadConsultada,
      esUrgente: c.esUrgente,
      cuadroClinicoActual: c.cuadroClinicoActual,
      examenesResultados: c.examenesResultados,
      planDiagnosticoPropuesto: c.planDiagnosticoPropuesto,
      planTerapeuticoPropuesto: c.planTerapeuticoPropuesto,
    }));

    const enfermeria = (Array.isArray(enfermeriaResp.data) ? enfermeriaResp.data : []).map((c: any) => ({
      id: c.id,
      numeroDeArchivo: c.numeroDeArchivo || 0,
      fecha: c.fecha || c.createdAt,
      patient: c.patient,
      motivoConsulta: c.nanda_etiqueta_diagnostica || 'Sin motivo especificado',
      diagnosticosDesc: [c.nanda_dominio, c.nanda_clase].filter(Boolean),
      type: 'Consulta Enfermería',
      nanda_dominio: c.nanda_dominio,
      nanda_clase: c.nanda_clase,
      nanda_factor_relacionado: c.nanda_factor_relacionado,
      resultadosNoc: c.resultadosNoc,
      intervencionesNic: c.intervencionesNic,
    }));

    const laboratorio = (laboratorioResp.data?.requests || []).map((r: any) => ({
      id: r.id,
      numeroDeArchivo: r.numero_de_archivo || 0,
      fecha: r.createdAt || r.fecha,
      patient: r.patient,
      motivoConsulta: 'Solicitud de exámenes de laboratorio',
      diagnosticosDesc: [r.diagnostico_descripcion1, r.diagnostico_descripcion2].filter(Boolean),
      type: 'Solicitud Laboratorio',
      diagnostico_descripcion1: r.diagnostico_descripcion1,
      diagnostico_descripcion2: r.diagnostico_descripcion2,
      diagnostico_cie1: r.diagnostico_cie1,
      diagnostico_cie2: r.diagnostico_cie2,
      prioridad: r.prioridad,
      hematologia_examenes: r.hematologia_examenes,
      coagulacion_examenes: r.coagulacion_examenes,
      quimica_sanguinea_examenes: r.quimica_sanguinea_examenes,
      orina_examenes: r.orina_examenes,
      heces_examenes: r.heces_examenes,
      hormonas_examenes: r.hormonas_examenes,
      serologia_examenes: r.serologia_examenes,
    }));

    const neurologica = (neurologicaResp.data?.neurologicas || []).map((e: any) => ({
      id: e.id,
      numeroDeArchivo: 0,
      fecha: e.createdAt || e.fecha,
      patient: { name: e.name || '', lastName: '', document: e.ci || '' },
      motivoConsulta: 'Evaluación neurológica',
      diagnosticosDesc: [e.diagnostico, e.discapacidad].filter(Boolean),
      type: 'Evaluación Neurológica',
      edad: e.edad,
      discapacidad: e.discapacidad,
      diagnostico: e.diagnostico,
      antecedentesHeredofamiliares: e.antecedentesHeredofamiliares,
      antecedentesFarmacologicos: e.antecedentesFarmacologicos,
      alergias: e.alergias,
      utilizaSillaRuedas: e.utilizaSillaRuedas,
      comentariosExaminador: e.comentariosExaminador,
      resumenResultados: e.resumenResultados,
      barthelTotal: e.barthelTotal,
    }));

    const allConsultations = [...externas, ...internas, ...enfermeria, ...laboratorio, ...neurologica];

    return {
      consultations: allConsultations,
      stats: {
        externas: externas.length,
        internas: internas.length,
        enfermeria: enfermeria.length,
        laboratorio: laboratorio.length,
        neurologica: neurologica.length,
        total: allConsultations.length,
      },
    };
  } catch (error) {
    console.error('Error al obtener las consultas:', error);
    throw error;
  }
};

/* ========= Descargas (uno vs todos) ========= */

async function downloadFile(response: Response, filename: string) {
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.parentNode?.removeChild(link);
  window.URL.revokeObjectURL(url);
}

function getEndpointSingle(type: string, id: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
  if (!id) throw new Error('Se requiere un ID para descargar un registro');

  switch (type) {
    case 'Consulta Externa':       return `${baseUrl}/consultations/download/${id}`;
    case 'Consulta Interna':       return `${baseUrl}/consultations-internal/download/${id}`;
    case 'Consulta Enfermería':    return `${baseUrl}/nursing/download/${id}`;
    case 'Solicitud Laboratorio':  return `${baseUrl}/laboratory-request/download/${id}`;
    case 'Evaluación Neurológica': return `${baseUrl}/neurologica/download/${id}`;
    default: throw new Error(`Tipo no soportado: ${type}`);
  }
}

function getEndpointAll(type: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
  switch (type) {
    case 'Consulta Externa':       return `${baseUrl}/consultations/download`;
    case 'Consulta Interna':       return `${baseUrl}/consultations-internal/download`;
    case 'Consulta Enfermería':    return `${baseUrl}/nursing/download`;
    case 'Solicitud Laboratorio':  return `${baseUrl}/laboratory-request/download`;
    case 'Evaluación Neurológica': return `${baseUrl}/neurologica/download`;
    default: throw new Error(`Tipo no soportado: ${type}`);
  }
}

export const downloadService = {
  async downloadOne(type: string, token: string, id: string) {
    const endpoint = getEndpointSingle(type, id);
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/pdf',
      },
    });
    if (!response.ok) {
      let msg = response.statusText;
      try { const e = await response.json(); msg = e?.message || msg; } catch {}
      throw new Error(`Error al descargar: ${msg}`);
    }
    const filename = `${type.toLowerCase().replace(/\s+/g, '-')}-${id}.pdf`;
    await downloadFile(response as unknown as Response, filename);
  },

  async downloadAllOfType(type: string, token: string) {
    const endpoint = getEndpointAll(type);
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/pdf',
      },
    });
    if (!response.ok) {
      let msg = response.statusText;
      try { const e = await response.json(); msg = e?.message || msg; } catch {}
      throw new Error(`Error al descargar: ${msg}`);
    }
    const filename = `${type.toLowerCase().replace(/\s+/g, '-')}-all.pdf`;
    await downloadFile(response as unknown as Response, filename);
  },
};

/**
 * Descarga **cada** registro por separado (varios PDFs, uno por consulta).
 * Si prefieres un solo PDF con “todos de un tipo”, usa downloadService.downloadAllOfType(type, token).
 */
export const downloadAllConsultations = async (token: string, consultations: Array<{ tipo: string; id: string }>) => {
  for (const c of consultations) {
    await downloadService.downloadOne(c.tipo, token, c.id);
    await new Promise((r) => setTimeout(r, 500)); // pequeña pausa
  }
};
