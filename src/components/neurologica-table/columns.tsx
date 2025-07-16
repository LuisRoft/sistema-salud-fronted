'use client';

import { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '@/components/ui/data-table-header';
import { Badge } from '@/components/ui/badge'; 
//import ActionsCells from '@/components/actions-cells'; 
//import EditNeurologicaDialog from './edit-neurologica-dialog';
//import DeleteNeurologicaDialog from './delete-neurologica-dialog';

export type NeurologicaEval = {
  id: string;
  name: string;
  ci: string;
  edad: number;
  discapacidad: string;
  diagnostico: string;
};

export const columns: ColumnDef<NeurologicaEval>[] = [
  {
    accessorKey: 'ci',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Cédula' />
    ),
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Nombre Completo' />
    ),
  },
  {
    accessorKey: 'edad',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Edad' />
    ),
  },
  {
    accessorKey: 'discapacidad',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Discapacidad' />
    ),
    // 👇 Muestra la discapacidad como un badge de color
    cell: ({ row }) => <Badge>{row.original.discapacidad}</Badge>,
  },
  {
    accessorKey: 'diagnostico',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Diagnóstico Médico' />
    ),
  },
  /*{
    id: 'actions',
    cell: ({ row }) => (
      <ActionsCells
        data={row.original}
        //DeleteDialog={DeleteNeurologicaDialog} // ← Desactivado temporalmente
        //EditDialog={EditNeurologicaDialog}     // ← Desactivado temporalmente
      />
    ),
  },*/
];
