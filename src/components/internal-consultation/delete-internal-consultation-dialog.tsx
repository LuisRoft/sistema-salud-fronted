'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AlertTriangle, Loader2, Trash2 } from 'lucide-react';
import { InternalConsultationManagementRow } from './internal-consultation-management-columns';

interface DeleteInternalConsultationDialogProps {
  data: InternalConsultationManagementRow;
  isOpen: boolean;
  onClose: () => void;
}

const DeleteInternalConsultationDialog: React.FC<DeleteInternalConsultationDialogProps> = ({
  data,
  isOpen,
  onClose,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const patientName = data.patient 
    ? `${data.patient.name} ${data.patient.lastName}` 
    : data.nombrePaciente;

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      // Eliminar del cache de react-query
      queryClient.setQueryData(['internal-consultation-management'], (oldData: InternalConsultationManagementRow[] | undefined) => {
        if (!oldData) return [];
        return oldData.filter(item => item.id !== data.id);
      });

      // Invalidar queries para refrescar la tabla
      queryClient.invalidateQueries({ queryKey: ['internal-consultation-management'] });

      onClose();
    } catch (error) {
      console.error('Error al eliminar la interconsulta:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Eliminar Interconsulta
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Esta acción no se puede deshacer
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-sm text-red-800 dark:text-red-200">
              ¿Está seguro que desea eliminar esta interconsulta?
            </p>
            <div className="mt-3 space-y-1 text-xs text-red-700 dark:text-red-300">
              <p><strong>Paciente:</strong> {patientName}</p>
              <p><strong>Número de Archivo:</strong> {data.numeroArchivo}</p>
              <p><strong>Especialidad:</strong> {data.especialidadSolicitada}</p>
              <p><strong>Fecha:</strong> {data.fecha ? new Date(data.fecha).toLocaleDateString('es-ES') : 'N/A'}</p>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading}
            className="min-w-[120px]"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Eliminando...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteInternalConsultationDialog;
