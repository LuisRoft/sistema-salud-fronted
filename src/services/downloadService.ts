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

function getEndpointByType(type: string, id: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
  console.log('Datos de la petición:', { type, id });

  if (!id) {
    throw new Error('Se requiere un ID para descargar el archivo');
  }

  // Asegurarnos de que las URLs incluyan el ID específico
  switch (type) {
    case 'Consulta Externa':
      return `${baseUrl}/consultations/download`;
    case 'Consulta Interna':
      return `${baseUrl}/consultations-internal/download`;
    case 'Consulta Enfermería':
      return `${baseUrl}/nursing/download`;
    case 'Solicitud Laboratorio':
      return `${baseUrl}/laboratory-request/download`;
    default:
      throw new Error(`Tipo de consulta no soportado: ${type}`);
  }
}

export const downloadService = {
  async downloadPDF(type: string, token: string, id: string) {
    try {
      console.log('Iniciando descarga:', { type, id });
      const endpoint = getEndpointByType(type, id);
      console.log('URL de descarga:', endpoint);

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/pdf',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error en la respuesta:', {
          status: response.status,
          data: errorData
        });
        throw new Error(`Error al descargar el archivo: ${response.statusText}`);
      }

      const filename = `${type.toLowerCase()}-${id}.pdf`;
      await downloadFile(response, filename);
    } catch (error) {
      console.error('Error en la descarga:', error);
      throw error;
    }
  },
};
