'use client';

import { ColumnDef } from '@tanstack/react-table';
import ActionsExternalConsultation from './actions-external-consultation';
import EditExternalConsultationDialog from './edit-external-consultation-dialog';
import DeleteExternalConsultationDialog from './delete-external-consultation-dialog';
import ViewExternalConsultationDialog from './view-external-consultation-dialog';

export interface ExternalConsultationManagementRow {
  id: string;
  numeroArchivo: string;
  cedula?: string;
  fecha: string;
  nombrePaciente: string;
  motivoConsulta: string;
  diagnostico: string;
  planTratamiento: string;
  establecimientoSalud: string;
  userId: string;
  patientId: string;
  patient?: {
    document?: string;
    name?: string;
    lastName?: string;
  };
}

export const externalConsultationManagementColumns: ColumnDef<ExternalConsultationManagementRow>[] = [
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
    accessorKey: 'motivoConsulta',
    header: 'Motivo de Consulta',
    cell: ({ row }) => {
      const motivo = row.getValue('motivoConsulta') as string;
      return (
        <div className="text-gray-600 dark:text-gray-300 max-w-xs truncate">
          {motivo}
        </div>
      );
    },
  },
  {
    id: 'actions',
    header: 'Acciones',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <ViewExternalConsultationDialog data={row.original} />
        <ActionsExternalConsultation
          data={row.original}
          DeleteDialog={DeleteExternalConsultationDialog}
          EditDialog={EditExternalConsultationDialog}
        />
      </div>
    ),
  },
];
