import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { ConsultationHistory } from '@/components/consultation-history/columns';

export const generatePDF = async (consultation: ConsultationHistory) => {
  const doc = new jsPDF();

  // Título
  doc.setFontSize(20);
  doc.text('HISTORIAL DE CONSULTA MÉDICA', 105, 15, { align: 'center' });
  
  // Información del paciente
  doc.setFontSize(12);
  doc.text(`Paciente: ${consultation.patient.name} ${consultation.patient.lastName}`, 20, 30);
  doc.text(`Documento: ${consultation.patient.document}`, 20, 40);
  doc.text(`N° Archivo: ${consultation.numeroDeArchivo}`, 20, 50);
  doc.text(`Fecha: ${new Date(consultation.fecha).toLocaleDateString()}`, 20, 60);
  doc.text(`Tipo: ${consultation.type}`, 20, 70);

  // Motivo de consulta
  doc.setFontSize(14);
  doc.text('Motivo de Consulta:', 20, 80);
  doc.setFontSize(12);
  const motivoLines = doc.splitTextToSize(consultation.motivoConsulta, 170);
  doc.text(motivoLines, 20, 90);

  // Diagnósticos
  doc.setFontSize(14);
  doc.text('Diagnósticos:', 20, 120);
  doc.setFontSize(12);
  if (consultation.diagnosticosDesc && consultation.diagnosticosDesc.length > 0) {
    consultation.diagnosticosDesc.forEach((diagnostico, index) => {
      doc.text(`• ${diagnostico}`, 20, 130 + (index * 10));
    });
  } else {
    doc.text('• Sin diagnósticos registrados', 20, 130);
  }

  // Pie de página
  const pageCount = doc.getNumberOfPages();
  doc.setFontSize(10);
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.text(
      `Página ${i} de ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  // Guardar el PDF
  doc.save(`consulta_${consultation.numeroDeArchivo}_${consultation.type}.pdf`);
}; 