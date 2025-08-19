'use client';

import { ColumnDef } from '@tanstack/react-table';
import { z } from 'zod';

import { DataTableColumnHeader } from '@/components/ui/data-table-header';
import ActionsCells from '../actions-cells';
import EditAdminDialog from './edit-admin-dialog';
import DeleteAdminDialog from './delete-admin-dialog';
import { Badge } from '../ui/badge';

// Esquema de validación actualizado
export const adminSchema = z.object({
  id: z.string(),
  document: z.string().min(1, 'La identificación es requerida'),
  name: z.string().min(1, 'El nombre es requerido'),
  lastName: z.string().min(1, 'El apellido es requerido'),
  email: z.string().email('Debe ser un correo electrónico válido'),
  career: z.union([z.string(), z.object({ careerName: z.string() })]).optional(),
});

export type Admin = z.infer<typeof adminSchema>;

// Definición de columnas de la tabla
export const columns: ColumnDef<Admin>[] = [
  {
    accessorKey: 'document',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Cédula de Identidad" />
    ),
    cell: ({ row }) => (
      <div className="text-sm font-medium min-w-[120px]">{row.original.document}</div>
    ),
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nombre" />
    ),
    cell: ({ row }) => {
      const name = row.original.name || '';
      return (
        <div className="text-sm capitalize min-w-[100px] max-w-[150px] truncate" title={name.toUpperCase()}>
          {name.toUpperCase()}
        </div>
      );
    },
  },
  {
    accessorKey: 'lastName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Apellido" />
    ),
    cell: ({ row }) => {
      const lastName = row.original.lastName || '';
      return (
        <div className="text-sm capitalize min-w-[100px] max-w-[150px] truncate" title={lastName.toUpperCase()}>
          {lastName.toUpperCase()}
        </div>
      );
    },
  },
  {
    accessorKey: 'email',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Correo Electrónico" />
    ),
    cell: ({ row }) => (
      <div className="text-sm min-w-[180px] max-w-[250px] truncate" title={row.original.email}>
        {row.original.email}
      </div>
    ),
  },
  {
    accessorKey: 'career',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Carrera" className="hidden lg:table-cell" />
    ),
    cell: ({ row }) => {
      const career = row.original.career;
      const careerName =
        career && typeof career === 'object'
          ? (career as { careerName: string }).careerName
          : 'Sin Carrera';
      return (
        <div className="text-sm min-w-[120px] max-w-[180px] truncate hidden lg:table-cell" title={careerName}>
          {careerName.toUpperCase()}
        </div>
      );
    },
  },
  {
    accessorKey: 'role',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Rol" className="hidden md:table-cell" />
    ),
    cell: () => (
      <div className="hidden md:table-cell">
        <Badge>Administrador</Badge>
      </div>
    ),
  },
  {
    id: 'actions',
    header: 'Acciones',
    cell: ({ row }) => (
      <div className="min-w-[100px]">
        <ActionsCells<Admin>
          data={row.original}
          DeleteDialog={DeleteAdminDialog}
          EditDialog={EditAdminDialog}
        />
      </div>
    ),
  },
];
