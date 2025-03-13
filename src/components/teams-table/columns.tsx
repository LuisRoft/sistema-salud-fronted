'use client';

import { ColumnDef } from '@tanstack/react-table';
import { z } from 'zod';

import { DataTableColumnHeader } from '@/components/ui/data-table-header';
import ActionsCells from '../actions-cells';
import DeleteTeamDialog from './team/DeleteTeamDialog';
import  EditTeamDialog from './team/EditTeamDialog';

export const teamSchema = z.object({
  id: z.string(),
  teamName: z.string().min(1, 'El nombre del equipo es requerido'),
  patientCount: z.number().nonnegative(),  // ✅ Ahora el schema valida `patientCount`
  patient: z.object({
    id: z.string(),
    document: z.string(),
    name: z.string(),
    lastName: z.string(),
  }).optional(), // ✅ Hacemos opcional `patient` en caso de equipos sin pacientes
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
    accessorKey: 'patientCount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Cantidad de Pacientes' />
    ),
    cell: ({ row }) => {
      const count = row.original.patientCount;
      return <div className='text-sm text-center'>{count}</div>;
    },
  },
  {
    accessorKey: 'userCount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Cantidad de Gestores' />
    ),
    cell: ({ row }) => {
      const count = row.original.userCount;
      return <div className='text-sm text-center'>{count}</div>;
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
  {
    id: 'actions',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Acciones' />
    ),
    cell: ({ row }) => (
      <ActionsCells<Team>
        data={row.original}
        DeleteDialog={DeleteTeamDialog}
        EditDialog={(props) => <EditTeamDialog {...props} data={row.original} />}  // ✅ Ahora pasa `Team` directamente
      />

    ),
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
