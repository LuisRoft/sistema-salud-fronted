'use client';

import { ColumnDef } from '@tanstack/react-table';
import { z } from 'zod';

import { DataTableColumnHeader } from '@/components/ui/data-table-header';
import ActionsCells from '../actions-cells';
import EditAdminDialog from './edit-admin-dialog';
import DeleteAdminDialog from './delete-admin-dialog';
import { Badge } from '../ui/badge';

export const adminSchema = z.object({
  id: z.string(),
  document: z.string().min(1, 'La identificación es requerida'),
  name: z.string().min(1, 'El nombre es requerido'),
  lastName: z.string().min(1, 'El apellido es requerido'),
  email: z.string().email('Debe ser un correo electrónico válido'),
});

export type Admin = z.infer<typeof adminSchema>;

export const columns: ColumnDef<Admin>[] = [
  {
    accessorKey: 'document',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Cédula de Identidad' />
    ),
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Nombre' />
    ),
    cell: ({ row }) => {
      const fullName = row.original.name.toLowerCase();
      return <div className='text-sm capitalize'>{fullName}</div>;
    },
  },
  {
    accessorKey: 'lastName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Apellido' />
    ),
    cell: ({ row }) => {
      const lastName = row.original.lastName.toLowerCase();
      return <div className='text-sm capitalize'>{lastName}</div>;
    },
  },
  {
    accessorKey: 'email',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Correo Electrónico' />
    ),
  },
  {
    accessorKey: 'role',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Rol' />
    ),
    cell: () => {
      return <Badge>Administrador</Badge>;
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <ActionsCells<Admin>
        data={row.original}
        DeleteDialog={DeleteAdminDialog}
        EditDialog={EditAdminDialog}
      />
    ),
  },
];
