'use client';

import { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '@/components/ui/data-table-header';

interface Patient {
  id: string;
  document: string;
  name: string;
  lastName: string;
  email: string;
  birthDate: string;
  gender: string;
  phone: string;
  address: string;
}

export const columns: ColumnDef<any>[] = [
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
    accessorKey: 'birthday',
    header: 'Fecha de Nacimiento',
    cell: ({ row }) => {
      const date = new Date(row.getValue('birthday'));
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  },
  {
    accessorKey: 'gender',
    header: 'Género',
    cell: ({ row }) => {
      const gender = row.getValue('gender');
      return gender === 'male' ? 'Masculino' : 'Femenino';
    }
  },
  {
    accessorKey: 'caregiver',
    header: 'Cuidador',
    cell: ({ row }) => {
      const caregiver = row.original.caregiver;
      return caregiver ? `${caregiver.name} ${caregiver.lastName}` : 'No asignado';
    }
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
    cell: ({ row }) => `${row.getValue('percentageDisability')}%`
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
    }
  }
]; 