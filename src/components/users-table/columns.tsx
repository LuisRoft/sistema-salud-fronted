'use client';

import { ColumnDef } from '@tanstack/react-table';
import { z } from 'zod';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import { DataTableColumnHeader } from '@/components/ui/data-table-header';
import DialogDelete from '../dialog-delete';
import { AlertDialog, AlertDialogTrigger } from '../ui/alert-dialog';
import EditUserDialog from './edit-user-dialog';
import { DialogTrigger } from '../ui/dialog';
import { Dialog } from '@radix-ui/react-dialog';

export const userSchema = z.object({
  id: z.number(),
  document: z.string().min(1, 'La identificación es requerida'),
  email: z.string().email('Debe ser un correo electrónico válido'),
  direction: z.string().min(1, 'La dirección es requerida'),
  role: z.object({
    id: z.number(),
    name_role: z.string(),
  }),
  status: z.boolean(),
});

export type User = z.infer<typeof userSchema>;

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'document',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Cédula de Identidad' />
    ),
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
    cell: ({ row }) => {
      const role = row.getValue('role') as { name_role: string };

      return <div className='text-sm'>{role.name_role}</div>;
    },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Estado' />
    ),
    cell: ({ row }) => {
      const status = row.getValue('status');

      return (
        <div
          className={`${
            status ? 'bg-emerald-300' : 'bg-red-300'
          } w-16 rounded-sm py-1 text-center text-xs text-black`}
        >
          {status ? 'Activo' : 'Inactivo'}
        </div>
      );
    },
  },
  {
    accessorKey: 'direction',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Direccion' />
    ),
  },

  {
    id: 'actions',
    cell: ({ row }) => {
      const user = row.original;
      console.log(user);
      return (
        <Dialog>
          <AlertDialog>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' className='h-8 w-8 p-0'>
                  <span className='sr-only'>Open menu</span>
                  <MoreHorizontal className='h-4 w-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                <DropdownMenuLabel>Acciones</DropdownMenuLabel>

                <DropdownMenuItem>
                  <DialogTrigger>Editar</DialogTrigger>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <AlertDialogTrigger>Eliminar</AlertDialogTrigger>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DialogDelete />
            <EditUserDialog user={user} />
          </AlertDialog>
        </Dialog>
      );
    },
  },
];
