'use client';

import { ColumnDef } from '@tanstack/react-table';
import { z } from 'zod';

import { DataTableColumnHeader } from '@/components/ui/data-table-header';
// import ActionsCells from '../actions-cells';

export const caregiverSchema = z.object({
  id: z.string(),
  document: z.string().min(10, 'Número de identificación inválido.'),
  name: z.string().min(1, 'El nombre es requerido'),
  lastName: z.string().min(1, 'El apellido es requerido'),
  gender: z.string(),
  canton: z.string(),
  parish: z.string(),
  patientRelationship: z
    .string()
    .min(1, 'La relación con el paciente es requerida'),
  address: z.string(),
  cellphoneNumbers: z
    .array(z.string().min(10, 'Número de celular inválido.'))
    .min(1, 'Debe proporcionar al menos un número de celular.'),
  conventionalNumbers: z.array(z.string()).optional(),
  reference: z.string().optional(),
  zoneType: z.string().min(1, 'Zona inválida.'),
});

export type Caregiver = z.infer<typeof caregiverSchema>;

export const columns: ColumnDef<Caregiver>[] = [
  {
    accessorKey: 'document',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Identificación' />
    ),
    cell: ({ row }) => {
      const document = row.original.document;
      return <div className='text-sm'>{document}</div>;
    },
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Nombre Completo' />
    ),
    cell: ({ row }) => {
      const { name, lastName } = row.original;
      return (
        <div className='text-sm capitalize'>
          {name} {lastName}
        </div>
      );
    },
  },
  {
    accessorKey: 'gender',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Género' />
    ),
    cell: ({ row }) => {
      const gender = row.original.gender;
      return <div className='text-sm capitalize'>{gender}</div>;
    },
  },
  {
    accessorKey: 'canton',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Cantón' />
    ),
    cell: ({ row }) => {
      const canton = row.original.canton;
      return <div className='text-sm capitalize'>{canton}</div>;
    },
  },
  {
    accessorKey: 'parish',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Parroquia' />
    ),
    cell: ({ row }) => {
      const parish = row.original.parish;
      return <div className='text-sm capitalize'>{parish}</div>;
    },
  },
  {
    accessorKey: 'patientRelationship',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Relación con Paciente' />
    ),
    cell: ({ row }) => {
      const patientRelationship = row.original.patientRelationship;
      return <div className='text-sm capitalize'>{patientRelationship}</div>;
    },
  },
  {
    accessorKey: 'address',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Dirección' />
    ),
    cell: ({ row }) => {
      const address = row.original.address;
      return <div className='text-sm capitalize'>{address}</div>;
    },
  },
  {
    accessorKey: 'cellphoneNumbers',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Teléfono Celular' />
    ),
    cell: ({ row }) => {
      const cellphoneNumbers = row.original.cellphoneNumbers;
      return (
        <div className='text-sm capitalize'>
          {cellphoneNumbers
            .map((number) => number.replace(/'/g, ''))
            .join(', ')}
        </div>
      );
    },
  },
  {
    accessorKey: 'conventionalNumbers',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Teléfono Convencional' />
    ),
    cell: ({ row }) => {
      const conventionalNumbers = row.original.conventionalNumbers;
      return (
        <div className='text-sm capitalize'>
          {conventionalNumbers
            ?.map((number) => number.replace(/'/g, ''))
            .join(', ')}
        </div>
      );
    },
  },
  {
    accessorKey: 'reference',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Referencia' />
    ),
    cell: ({ row }) => {
      const reference = row.original.reference;
      return <div className='text-sm capitalize'>{reference}</div>;
    },
  },
  {
    accessorKey: 'zoneType',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Tipo de Zona' />
    ),
    cell: ({ row }) => {
      const zoneType = row.original.zoneType;
      return <div className='text-sm capitalize'>{zoneType}</div>;
    },
  },

  // {
  //   id: 'actions',
  //   cell: ({ row }) => (
  //     <ActionsCells<Caregiver>
  //       data={row.original}
  //       DeleteDialog={DeleteCaregiverDialog}
  //       EditDialog={EditCaregiverDialog}
  //     />
  //   ),
  // },
];
