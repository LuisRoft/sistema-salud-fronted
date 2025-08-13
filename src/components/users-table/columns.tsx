'use client';

import { ColumnDef } from '@tanstack/react-table';
import { z } from 'zod';

import { DataTableColumnHeader } from '@/components/ui/data-table-header';

export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  lastName: z.string(),
  birthday: z.string(),
  document: z.string(),
  gender: z.string(),
  isActive: z.boolean(),
  percentageDisability: z.number(),
  typeBeneficiary: z.string(),
  typeDisability: z.string(),
  zone: z.string(),
});

export type User = z.infer<typeof userSchema>;

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Nombres' />
    ),
    cell: ({ row }) => {
      const name = row.original.name;
      return <div className='text-sm uppercase'>{name}</div>;
    },
  },
  {
    accessorKey: 'lastName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Apellidos' />
    ),
    cell: ({ row }) => {
      const lastName = row.original.lastName;
      return <div className='text-sm uppercase'>{lastName}</div>;
    },
  },
  {
    accessorKey: 'birthday',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Fecha de Nacimiento' />
    ),
    cell: ({ row }) => {
      const birthday = row.original.birthday;
      return <div className='text-sm'>{birthday}</div>;
    },
  },
  {
    accessorKey: 'document',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Documento' />
    ),
    cell: ({ row }) => {
      const document = row.original.document;
      return <div className='text-sm'>{document}</div>;
    },
  },
  {
    accessorKey: 'gender',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Género' />
    ),
    cell: ({ row }) => {
      const gender = row.original.gender;
      const genderText = gender === 'male' ? 'Hombre' : gender === 'female' ? 'Mujer' : 'No especificado';
      return <div className='text-sm uppercase'>{genderText}</div>;
    },
  },
  {
    accessorKey: 'isActive',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Estado' />
    ),
    cell: ({ row }) => {
      const isActive = row.original.isActive;
      return (
        <div className='text-sm uppercase'>
          {isActive ? 'Activo' : 'Inactivo'}
        </div>
      );
    },
  },
  {
    accessorKey: 'percentageDisability',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='% Discapacidad' />
    ),
    cell: ({ row }) => {
      const percentageDisability = row.original.percentageDisability;
      return <div className='text-sm'>{percentageDisability}%</div>;
    },
  },
  {
    accessorKey: 'typeBeneficiary',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Tipo de Beneficiario' />
    ),
    cell: ({ row }) => {
      const typeBeneficiary = row.original.typeBeneficiary;
      return <div className='text-sm uppercase'>{typeBeneficiary}</div>;
    },
  },
  {
    accessorKey: 'typeDisability',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Tipo de Discapacidad' />
    ),
    cell: ({ row }) => {
      const typeDisability = row.original.typeDisability;
      return <div className='text-sm uppercase'>{typeDisability}</div>;
    },
  },
  {
    accessorKey: 'zone',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Zona' />
    ),
    cell: ({ row }) => {
      const zone = row.original.zone;
      return <div className='text-sm uppercase'>{zone}</div>;
    },
  },
];
