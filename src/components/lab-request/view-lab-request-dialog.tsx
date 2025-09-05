'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { LabRequestManagementRow } from './management-columns';
import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ViewLabRequestDialogProps {
  data: LabRequestManagementRow;
}

export default function ViewLabRequestDialog({ data }: ViewLabRequestDialogProps) {
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatExamenes = (examenes: string[]) => {
    if (!examenes || examenes.length === 0) return 'Ninguno';
    return examenes.join(', ');
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Eye className="h-4 w-4" />
          <span className="sr-only">Ver detalles</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Detalles de Solicitud de Laboratorio
          </DialogTitle>
          <DialogDescription>
            Información completa de la solicitud #{data.numero_de_archivo}
          </DialogDescription>
        </DialogHeader>
        
        <div className="max-h-[70vh] pr-4 overflow-y-auto">
          <div className="space-y-6">
            {/* Información General */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2">
                Información General
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Número de Archivo
                  </label>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {data.numero_de_archivo}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Cédula del Paciente
                  </label>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {data.patient?.document || data.cedula || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Fecha de Solicitud
                  </label>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {formatDate(data.fecha)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Prioridad
                  </label>
                  <Badge 
                    variant={data.prioridad === 'URGENTE' ? 'destructive' : 'default'}
                    className="mt-1"
                  >
                    {data.prioridad}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Información del Paciente */}
            {data.patient && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2">
                  Información del Paciente
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Nombre
                    </label>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {data.patient.name || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Apellido
                    </label>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {data.patient.lastName || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Diagnósticos */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2">
                Diagnósticos
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Diagnóstico Principal
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {data.diagnostico_descripcion1}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    CIE: {data.diagnostico_cie1}
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Diagnóstico Secundario
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {data.diagnostico_descripcion2}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    CIE: {data.diagnostico_cie2}
                  </p>
                </div>
              </div>
            </div>

            {/* Exámenes Solicitados */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2">
                Exámenes Solicitados
              </h3>
              <div className="space-y-4">
                {[
                  { titulo: 'Hematología', examenes: data.hematologia_examenes, color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' },
                  { titulo: 'Coagulación', examenes: data.coagulacion_examenes, color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' },
                  { titulo: 'Química Sanguínea', examenes: data.quimica_sanguinea_examenes, color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' },
                  { titulo: 'Orina', examenes: data.orina_examenes, color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' },
                  { titulo: 'Heces', examenes: data.heces_examenes, color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300' },
                  { titulo: 'Hormonas', examenes: data.hormonas_examenes, color: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300' },
                  { titulo: 'Serología', examenes: data.serologia_examenes, color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' },
                ].map((categoria) => (
                  categoria.examenes && categoria.examenes.length > 0 && (
                    <div key={categoria.titulo} className="space-y-2">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {categoria.titulo}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {categoria.examenes.map((examen, index) => (
                          <Badge 
                            key={index} 
                            variant="secondary" 
                            className={categoria.color}
                          >
                            {examen}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )
                ))}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
