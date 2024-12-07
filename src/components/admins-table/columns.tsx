'use client';

import { ColumnDef } from '@tanstack/react-table';
import { z } from 'zod';

import { DataTableColumnHeader } from '@/components/ui/data-table-header';
import ActionsCells from '../actions-cells';
import EditAdminDialog from './edit-admin-dialog';
import DeleteAdminDialog from './delete-admin-dialog';

export const adminSchema = z.object({
  id: z.string(),
  document: z.string().min(1, 'La identificación es requerida'),
  fullName: z.string().min(1, 'El nombre completo es requerido'),
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
    accessorKey: 'fullName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Nombre Completo' />
    ),
    cell: ({ row }) => {
      const fullName = row.original.fullName.toLowerCase();
      return <div className='text-sm capitalize'>{fullName}</div>;
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
      return (
        <div className='w-fit rounded-md bg-blue-200 px-2 py-1 text-center text-sm'>
          Administrador
        </div>
      );
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
