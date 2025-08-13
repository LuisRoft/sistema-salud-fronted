'use client';

import { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '@/components/ui/data-table-header';

interface Patient {
  id: string;
  document: string;
  name: string;
  lastName: string;
  email: string;
  birthday: string; // Cambiado para que coincida con los datos reales
  gender: string;
  phone: string;
  address: string;
  caregiver?: {
    name: string;
    lastName: string;
  };
  typeBeneficiary: string;
  typeDisability: string;
  percentageDisability: number;
  zone: string;
  isActive: boolean;
}

export const columns: ColumnDef<Patient>[] = [
  {
    accessorKey: 'document',
    header: 'Cédula',
  },
  {
    accessorKey: 'name',
    header: 'Nombre',
  },
  {
    accessorKey: 'lastName',
    header: 'Apellido',
  },
  {
    accessorKey: 'birthday', // Actualizado para que coincida con los datos recibidos
    header: 'Fecha de Nacimiento',
    cell: ({ row }) => {
      const date = row.getValue('birthday');
      if (!date || date === 'Invalid Date') return 'Fecha no disponible';
      const parsedDate = new Date(date);
      return parsedDate.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    },
  },
  {
    accessorKey: 'gender',
    header: 'Género',
    cell: ({ row }) => {
      const gender = row.getValue('gender');
      if (!gender) return 'No especificado';
      return gender === 'male' ? 'Masculino' : 'Femenino';
    },
  },
  {
    accessorKey: 'caregiver',
    header: 'Cuidador',
    cell: ({ row }) => {
      const caregiver = row.original.caregiver;
      return caregiver ? `${caregiver.name} ${caregiver.lastName}` : 'No asignado';
    },
  },
  {
    accessorKey: 'typeBeneficiary',
    header: 'Tipo de Beneficiario',
  },
  {
    accessorKey: 'typeDisability',
    header: 'Tipo de Discapacidad',
  },
  {
    accessorKey: 'percentageDisability',
    header: 'Porcentaje de Discapacidad',
    cell: ({ row }) => {
      const percentage = row.getValue('percentageDisability');
      return percentage !== undefined ? `${percentage}%` : '0%';
    },
  },
  {
    accessorKey: 'zone',
    header: 'Zona',
  },
  {
    accessorKey: 'isActive',
    header: 'Estado',
    cell: ({ row }) => {
      const isActive = row.getValue('isActive');
      return isActive ? 'Activo' : 'Inactivo';
    },
  },
];
