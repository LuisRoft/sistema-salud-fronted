'use client';

import { ColumnDef } from '@tanstack/react-table';
import ActionsCellsLab from './ActionsCellsLab';
import EditLabRequestDialog from './edit-lab-request-dialog';
import DeleteLabRequestDialog from './delete-lab-request-dialog';

export interface LabRequestRow {
  id: string;
  numero_de_archivo: string;
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
}

export const columns: ColumnDef<LabRequestRow>[] = [
  {
    accessorKey: 'numero_de_archivo',
    header: 'N° Archivo',
  },
  {
    accessorKey: 'diagnostico_descripcion1',
    header: 'Diagnóstico 1',
  },
  {
    accessorKey: 'diagnostico_cie1',
    header: 'CIE 1',
  },
  {
    accessorKey: 'diagnostico_descripcion2',
    header: 'Diagnóstico 2',
  },
  {
    accessorKey: 'diagnostico_cie2',
    header: 'CIE 2',
  },
  {
    accessorKey: 'prioridad',
    header: 'Prioridad',
  },
  {
    accessorKey: 'hematologia_examenes',
    header: 'Hematología',
  },
  {
    accessorKey: 'coagulacion_examenes',
    header: 'Coagulación',
  },
  {
    accessorKey: 'quimica_sanguinea_examenes',
    header: 'Química Sanguínea',
  },
  {
    accessorKey: 'orina_examenes',
    header: 'Orina',
  },
  {
    accessorKey: 'heces_examenes',
    header: 'Heces',
  },
  {
    accessorKey: 'hormonas_examenes',
    header: 'Hormonas',
  },
  {
    accessorKey: 'serologia_examenes',
    header: 'Serología',
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <ActionsCellsLab
        data={row.original}
        DeleteDialog={DeleteLabRequestDialog}
        EditDialog={EditLabRequestDialog}
      />
    ),
  },
];
