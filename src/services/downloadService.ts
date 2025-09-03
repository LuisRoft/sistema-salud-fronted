// --- REEMPLAZA desde aquí ---

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
  const baseUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000'}/api`;
  if (!id) throw new Error('Se requiere un ID para descargar el archivo');

  switch (type) {
    case 'Consulta Externa':
      return `${baseUrl}/consultations/download/${id}`;
    case 'Consulta Interna':
      return `${baseUrl}/consultations-internal/download/${id}`;
    case 'Consulta Enfermería':
      return `${baseUrl}/nursing/download/${id}`;
    case 'Solicitud Laboratorio':
      return `${baseUrl}/laboratory-request/download/${id}`;
    case 'Evaluación Neurológica':
      return `${baseUrl}/neurologica/download/${id}`;
    default:
      throw new Error(`Tipo de consulta no soportado: ${type}`);
  }
}

function getEndpointAll(type: string): string {
  const baseUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000'}/api`;
  switch (type) {
    case 'Consulta Externa':
      return `${baseUrl}/consultations/download`;
    case 'Consulta Interna':
      return `${baseUrl}/consultations-internal/download`;
    case 'Consulta Enfermería':
      return `${baseUrl}/nursing/download`;
    case 'Solicitud Laboratorio':
      return `${baseUrl}/laboratory-request/download`;
    case 'Evaluación Neurológica':
      return `${baseUrl}/neurologica/download`;
    default:
      throw new Error(`Tipo de consulta no soportado: ${type}`);
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
      try { const e = await response.json(); msg = (e as any)?.message || msg; } catch {}
      throw new Error(`Error al descargar: ${msg}`);
    }

    const filename = `${type.toLowerCase().replace(/\s+/g, '-')}-${id}.pdf`;
    await downloadFile(response as unknown as Response, filename);
  },

  // Opcional: descarga un PDF único con "todos de un tipo" (endpoint bulk /download)
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
      try { const e = await response.json(); msg = (e as any)?.message || msg; } catch {}
      throw new Error(`Error al descargar: ${msg}`);
    }

    const filename = `${type.toLowerCase().replace(/\s+/g, '-')}-all.pdf`;
    await downloadFile(response as unknown as Response, filename);
  },
};

// Descarga CADA registro por separado (varios PDFs) usando /download/:id
export const downloadAllConsultations = async (token: string, consultations: any[]) => {
  try {
    for (const consultation of consultations) {
      // ⬇️ antes usabas "tipo", debe ser "type"
      await downloadService.downloadOne(consultation.type, token, consultation.id);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  } catch (error) {
    console.error('Error descargando todas las consultas:', error);
    throw error;
  }
};
// --- HASTA aquí ---
