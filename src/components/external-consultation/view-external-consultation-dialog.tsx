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
import { ExternalConsultationManagementRow } from './external-consultation-management-columns';

interface ViewExternalConsultationDialogProps {
  data: ExternalConsultationManagementRow;
}

const ViewExternalConsultationDialog: React.FC<ViewExternalConsultationDialogProps> = ({ data }) => {
  const [isOpen, setIsOpen] = useState(false);

  const patientName = data.patient 
    ? `${data.patient.name} ${data.patient.lastName}` 
    : data.nombrePaciente;

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
              Detalle de Consulta Externa
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
                  Fecha de Consulta:
                </label>
                <p className="text-gray-900 dark:text-gray-100 font-medium">
                  {data.fecha ? new Date(data.fecha).toLocaleDateString('es-ES') : 'N/A'}
                </p>
              </div>
            </div>

            {/* Información de la Consulta */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-primary">
                Información de la Consulta
              </h3>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Motivo de Consulta:
                  </label>
                  <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                    <p className="text-gray-900 dark:text-gray-100">
                      {data.motivoConsulta || 'No especificado'}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Diagnóstico:
                  </label>
                  <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                    <p className="text-gray-900 dark:text-gray-100">
                      {data.diagnostico || 'No especificado'}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Plan de Tratamiento:
                  </label>
                  <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                    <p className="text-gray-900 dark:text-gray-100">
                      {data.planTratamiento || 'No especificado'}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Establecimiento de Salud:
                  </label>
                  <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                    <p className="text-gray-900 dark:text-gray-100">
                      {data.establecimientoSalud || 'No especificado'}
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

export default ViewExternalConsultationDialog;
