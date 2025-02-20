'use client';

import { ColumnDef } from '@tanstack/react-table';
import { z } from 'zod';

import { DataTableColumnHeader } from '@/components/ui/data-table-header';
import ActionsCells from '../actions-cells';
import EditLabRequestDialog from './edit-lab-request-dialog';
import DeleteLabRequestDialog from './delete-lab-request-dialog';
import { Badge } from '../ui/badge';

// Esquema de validación para Lab Request
export const labRequestSchema = z.object({
  id: z.string(),
  requesterName: z.string().min(1, 'El nombre del solicitante es requerido'),
  labName: z.string().min(1, 'El laboratorio es requerido'),
  status: z.enum(['pending', 'approved', 'rejected']),
  createdAt: z.string(),
});

export type LabRequest = z.infer<typeof labRequestSchema>;

// Definición de columnas de la tabla
export const columns: ColumnDef<LabRequest>[] = [
  {
    accessorKey: 'requesterName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Solicitante" />
    ),
  },
  {
    accessorKey: 'labName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Laboratorio" />
    ),
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Estado" />
    ),
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <Badge
          className={`${
            status === 'approved'
              ? 'bg-green-500'
              : status === 'rejected'
              ? 'bg-red-500'
              : 'bg-yellow-500'
          }`}
        >
          {status === 'approved' ? 'Aprobado' : status === 'rejected' ? 'Rechazado' : 'Pendiente'}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fecha de Solicitud" />
    ),
    cell: ({ row }) => <div>{new Date(row.original.createdAt).toLocaleDateString()}</div>,
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <ActionsCells<LabRequest>
        data={row.original}
        DeleteDialog={DeleteLabRequestDialog}
        EditDialog={EditLabRequestDialog}
      />
    ),
  },
];
