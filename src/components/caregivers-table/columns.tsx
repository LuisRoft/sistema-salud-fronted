'use client';

import { ColumnDef } from '@tanstack/react-table';
import { z } from 'zod';

import { DataTableColumnHeader } from '@/components/ui/data-table-header';

export const caregiverSchema = z.object({
  id: z.string(),
  document: z.string().min(10, 'Número de identificación inválido.'),
  name: z.string().min(1, 'El nombre es requerido'),
  lastName: z.string().min(1, 'El apellido es requerido'),
  gender: z.string(),
  canton: z.string(),
  parish: z.string(),
  patientRelationship: z.string().min(1, 'La relación con el paciente es requerida'),
  address: z.string(),
  cellphoneNumbers: z.array(z.string().min(10, 'Número de celular inválido.')).min(1, 'Debe proporcionar al menos un número de celular.'),
  conventionalNumbers: z.array(z.string()).optional(),
  reference: z.string().optional(),
  zoneType: z.string().min(1, 'Zona inválida.'),
  patientName: z.string().optional(),
});

export type Caregiver = z.infer<typeof caregiverSchema>;

export const columns: ColumnDef<Caregiver>[] = [
  {
    accessorKey: 'document',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Identificación" />,
    cell: ({ row }) => <div className="text-sm uppercase">{row.original.document}</div>,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Nombre Completo" />,
    cell: ({ row }) => {
      const { name, lastName } = row.original;
      return <div className="text-sm uppercase">{name} {lastName}</div>;
    },
  },
  {
    accessorKey: 'patientName',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Nombre del Paciente" />,
    cell: ({ row }) => {
      console.log('Fila en tabla:', row.original);
      return <div className="text-sm uppercase">{row.original.patientName || 'NO ASIGNADO'}</div>;
    },
  },
  {
    accessorKey: 'gender',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Género" />,
    cell: ({ row }) => {
      const gender = row.original.gender;
      const genderText = gender === 'male' ? 'HOMBRE' : gender === 'female' ? 'MUJER' : 'NO ESPECIFICADO';
      return <div className="text-sm uppercase">{genderText}</div>;
    },
  },
  {
    accessorKey: 'canton',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Cantón" />,
    cell: ({ row }) => <div className="text-sm uppercase">{row.original.canton}</div>,
  },
  {
    accessorKey: 'parish',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Parroquia" />,
    cell: ({ row }) => <div className="text-sm uppercase">{row.original.parish}</div>,
  },
  {
    accessorKey: 'cellphoneNumbers',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Teléfono Celular" />,
    cell: ({ row }) => <div className="text-sm uppercase">{row.original.cellphoneNumbers.join(', ')}</div>,
  },
  {
    accessorKey: 'conventionalNumbers',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Teléfono Convencional" />,
    cell: ({ row }) => <div className="text-sm uppercase">{row.original.conventionalNumbers?.join(', ') || '-'}</div>,
  },
  {
    accessorKey: 'reference',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Referencia" />,
    cell: ({ row }) => <div className="text-sm uppercase">{row.original.reference || '-'}</div>,
  },
  {
    accessorKey: 'zoneType',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Tipo de Zona" />,
    cell: ({ row }) => <div className="text-sm uppercase">{row.original.zoneType}</div>,
  },
];
