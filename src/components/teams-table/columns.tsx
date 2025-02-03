'use client';

import { ColumnDef } from '@tanstack/react-table';
import { z } from 'zod';

import { DataTableColumnHeader } from '@/components/ui/data-table-header';
import ActionsCells from '../actions-cells';
import DeleteTeamDialog from './team/DeleteTeamDialog';
import { Button } from '../ui/button';
import { Edit, Trash } from 'lucide-react';

export const teamSchema = z.object({
  id: z.string(),
  teamName: z.string().min(1, 'El nombre del equipo es requerido'),
  patient: z.object({
    id: z.string(),
    document: z.string(),
    name: z.string(),
    lastName: z.string(),
  }),
  group: z.object({
    id: z.string(),
    groupName: z.string(),
  }),
});

export type Team = z.infer<typeof teamSchema>;

export const columns: ColumnDef<Team>[] = [
  {
    accessorKey: 'teamName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Nombre del Equipo' />
    ),
    cell: ({ row }) => {
      const teamName = row.original.teamName;
      return <div className='text-sm capitalize'>{teamName}</div>;
    },
  },
  {
    accessorKey: 'patient',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Paciente' />
    ),
    cell: ({ row }) => {
      const patient = row.original.patient;
      return (
        <div className='text-sm capitalize'>
          {patient.name} {patient.lastName}
        </div>
      );
    },
  },
  {
    accessorKey: 'group',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Grupo' />
    ),
    cell: ({ row }) => {
      const group = row.original.group;
      return <div className='text-sm capitalize'>{group.groupName}</div>;
    },
  },
  

  //   {
  //     id: 'actions',
  //     cell: ({ row }) => (
  //       <ActionsCells<Team>
  //         data={row.original}
  //         DeleteDialog={DeleteTeamDialog}
  //         EditDialog={EditTeamDialog}
  //       />
  //     ),
  //   },
];
