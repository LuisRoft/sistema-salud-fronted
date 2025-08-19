'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Eye } from 'lucide-react';
import { InternalConsultationManagementRow } from './internal-consultation-management-columns';

interface ViewInternalConsultationDialogProps {
  data: InternalConsultationManagementRow;
}

const ViewInternalConsultationDialog: React.FC<ViewInternalConsultationDialogProps> = ({ data }) => {
  const [isOpen, setIsOpen] = useState(false);

  const patientName = data.patient 
    ? `${data.patient.name} ${data.patient.lastName}` 
    : data.nombrePaciente;

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'alta':
      case 'urgente':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'media':
      case 'normal':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'baja':
      case 'programada':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="h-8 w-8 p-0"
      >
        <Eye className="h-4 w-4" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-primary">
              Detalle de Interconsulta
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Información del Paciente */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h3 className="col-span-full text-lg font-semibold text-primary mb-2">
                Información del Paciente
              </h3>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Número de Archivo:
                </label>
                <p className="text-gray-900 dark:text-gray-100 font-medium">
                  {data.numeroArchivo}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Cédula:
                </label>
                <p className="text-gray-900 dark:text-gray-100 font-medium">
                  {data.patient?.document || data.cedula || 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Nombre del Paciente:
                </label>
                <p className="text-gray-900 dark:text-gray-100 font-medium">
                  {patientName}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Fecha de Solicitud:
                </label>
                <p className="text-gray-900 dark:text-gray-100 font-medium">
                  {data.fecha ? new Date(data.fecha).toLocaleDateString('es-ES') : 'N/A'}
                </p>
              </div>
            </div>

            {/* Información de la Interconsulta */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-primary">
                Información de la Interconsulta
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Especialidad Solicitada:
                  </label>
                  <div className="mt-1 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                    <p className="text-blue-900 dark:text-blue-100 font-medium">
                      {data.especialidadSolicitada || 'No especificado'}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Prioridad:
                  </label>
                  <div className="mt-1">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(data.prioridadInterconsulta)}`}>
                      {data.prioridadInterconsulta || 'No especificado'}
                    </span>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Servicio Solicitante:
                  </label>
                  <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                    <p className="text-gray-900 dark:text-gray-100">
                      {data.servicioSolicitante || 'No especificado'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Motivo de Interconsulta:
                  </label>
                  <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                    <p className="text-gray-900 dark:text-gray-100">
                      {data.motivoInterconsulta || 'No especificado'}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Diagnóstico Presuntivo:
                  </label>
                  <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                    <p className="text-gray-900 dark:text-gray-100">
                      {data.diagnosticoPresuntivo || 'No especificado'}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Hallazgos Relevantes:
                  </label>
                  <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                    <p className="text-gray-900 dark:text-gray-100">
                      {data.hallazgosRelevantes || 'No especificado'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* IDs del Sistema */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h3 className="col-span-full text-lg font-semibold text-blue-700 dark:text-blue-400 mb-2">
                Información del Sistema
              </h3>
              <div>
                <label className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  ID Usuario:
                </label>
                <p className="text-blue-900 dark:text-blue-100 font-mono text-sm">
                  {data.userId}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  ID Paciente:
                </label>
                <p className="text-blue-900 dark:text-blue-100 font-mono text-sm">
                  {data.patientId}
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ViewInternalConsultationDialog;
