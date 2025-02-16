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
  career: z.union([z.string(), z.object({ careerName: z.string() })]).optional(), // 🔹 Ahora `career` puede ser una cadena o un objeto
});

export type Admin = z.infer<typeof adminSchema>;

// Definición de columnas de la tabla
export const columns: ColumnDef<Admin>[] = [
  {
    accessorKey: 'document',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Cédula de Identidad" />
    ),
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nombre" />
    ),
    cell: ({ row }) => (
      <div className="text-sm capitalize">{row.original.name}</div>
    ),
  },
  {
    accessorKey: 'lastName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Apellido" />
    ),
    cell: ({ row }) => (
      <div className="text-sm capitalize">{row.original.lastName}</div>
    ),
  },
  {
    accessorKey: 'email',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Correo Electrónico" />
    ),
  },
    {
      accessorKey: 'career',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Carrera" />
      ),
      cell: ({ row }) => {
        const career = row.original.career;
        return (
          <div className="text-sm capitalize">
            {career && typeof career === 'object' ? (career as { careerName: string }).careerName : "Sin Carrera"} {/* 🔹 Ahora verifica si `career` es un objeto */}
          </div>

      );
    },
  },
  {
    accessorKey: 'role',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Rol" />
    ),
    cell: () => <Badge>Administrador</Badge>,
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
