'use client';

import { ColumnDef } from '@tanstack/react-table';
import ActionsCellsLab from './ActionsCellsLab';
import EditLabRequestDialog from './edit-lab-request-dialog';
import DeleteLabRequestDialog from './delete-lab-request-dialog';
import ViewLabRequestDialog from './view-lab-request-dialog';

export interface LabRequestManagementRow {
  id: string;
  numero_de_archivo: string;
  cedula?: string;
  fecha: string;
  diagnostico_descripcion1: string;
  diagnostico_cie1: string;
  diagnostico_descripcion2: string;
  diagnostico_cie2: string;
  prioridad: string;
  hematologia_examenes: string[];
  coagulacion_examenes: string[];
  quimica_sanguinea_examenes: string[];
  orina_examenes: string[];
  heces_examenes: string[];
  hormonas_examenes: string[];
  serologia_examenes: string[];
  userId: string;
  patientId: string;
  patient?: {
    document?: string;
    name?: string;
    lastName?: string;
  };
}

export const managementColumns: ColumnDef<LabRequestManagementRow>[] = [
  {
    accessorKey: 'numero_de_archivo',
    header: 'Número de Archivo',
    cell: ({ row }) => (
      <div className="font-medium">
        {row.getValue('numero_de_archivo')}
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
    accessorKey: 'prioridad',
    header: 'Prioridad',
    cell: ({ row }) => {
      const prioridad = row.getValue('prioridad') as string;
      return (
        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          prioridad === 'URGENTE' 
            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
            : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
        }`}>
          {prioridad}
        </div>
      );
    },
  },
  {
    id: 'actions',
    header: 'Acciones',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <ViewLabRequestDialog data={row.original} />
        <ActionsCellsLab
          data={row.original}
          DeleteDialog={DeleteLabRequestDialog}
          EditDialog={EditLabRequestDialog}
        />
      </div>
    ),
  },
];
