'use client';

import { ColumnDef } from '@tanstack/react-table';
import ActionsInternalConsultation from './actions-internal-consultation';
import EditInternalConsultationDialog from './edit-internal-consultation-dialog';
import DeleteInternalConsultationDialog from './delete-internal-consultation-dialog';
import ViewInternalConsultationDialog from './view-internal-consultation-dialog';

export interface InternalConsultationManagementRow {
  id: string;
  numeroArchivo: string;
  cedula?: string;
  fecha: string;
  nombrePaciente: string;
  motivoInterconsulta: string;
  especialidadSolicitada: string;
  diagnosticoPresuntivo: string;
  hallazgosRelevantes: string;
  prioridadInterconsulta: string;
  servicioSolicitante: string;
  userId: string;
  patientId: string;
  patient?: {
    document?: string;
    name?: string;
    lastName?: string;
  };
}

export const internalConsultationManagementColumns: ColumnDef<InternalConsultationManagementRow>[] = [
  {
    accessorKey: 'numeroArchivo',
    header: 'Número de Archivo',
    cell: ({ row }) => (
      <div className="font-medium">
        {row.getValue('numeroArchivo')}
      </div>
    ),
  },
  {
    accessorKey: 'cedula',
    header: 'Cédula',
    cell: ({ row }) => {
      const cedula = row.original.patient?.document || row.original.cedula || 'N/A';
      return (
        <div className="text-gray-600 dark:text-gray-300">
          {cedula}
        </div>
      );
    },
  },
  {
    accessorKey: 'nombrePaciente',
    header: 'Paciente',
    cell: ({ row }) => {
      const patient = row.original.patient;
      const nombre = patient ? `${patient.name} ${patient.lastName}` : row.original.nombrePaciente;
      return (
        <div className="text-gray-900 dark:text-gray-100 font-medium">
          {nombre}
        </div>
      );
    },
  },
  {
    accessorKey: 'fecha',
    header: 'Fecha',
    cell: ({ row }) => {
      const fecha = row.getValue('fecha') as string;
      return (
        <div className="text-gray-600 dark:text-gray-300">
          {fecha ? new Date(fecha).toLocaleDateString('es-ES') : 'N/A'}
        </div>
      );
    },
  },
  {
    accessorKey: 'especialidadSolicitada',
    header: 'Especialidad',
    cell: ({ row }) => {
      const especialidad = row.getValue('especialidadSolicitada') as string;
      return (
        <div className="text-gray-600 dark:text-gray-300">
          {especialidad}
        </div>
      );
    },
  },
  {
    accessorKey: 'prioridadInterconsulta',
    header: 'Prioridad',
    cell: ({ row }) => {
      const prioridad = row.getValue('prioridadInterconsulta') as string;
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
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(prioridad)}`}>
          {prioridad}
        </span>
      );
    },
  },
  {
    id: 'actions',
    header: 'Acciones',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <ViewInternalConsultationDialog data={row.original} />
        <ActionsInternalConsultation
          data={row.original}
          DeleteDialog={DeleteInternalConsultationDialog}
          EditDialog={EditInternalConsultationDialog}
        />
      </div>
    ),
  },
];
