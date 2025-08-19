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
    cell: ({ row }) => (
      <div className="text-sm font-medium min-w-[120px]">{row.original.document}</div>
    ),
  },
  {
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Nombre Completo" />,
    cell: ({ row }) => {
      const { name, lastName } = row.original;
      const fullName = `${name} ${lastName}`.toUpperCase();
      return (
        <div className="text-sm capitalize min-w-[150px] max-w-[200px] truncate" title={fullName}>
          {fullName}
        </div>
      );
    },
  },
  {
    accessorKey: 'patientName',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Paciente" />,
    cell: ({ row }) => {
      const patientName = row.original.patientName || 'NO ASIGNADO';
      return (
        <div className="text-sm min-w-[120px] max-w-[150px] truncate" title={patientName}>
          {patientName}
        </div>
      );
    },
  },
  {
    accessorKey: 'gender',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Género" />,
    cell: ({ row }) => {
      const gender = row.original.gender;
      const genderText = gender === 'male' ? 'M' : gender === 'female' ? 'F' : 'N/E';
      const fullGenderText = gender === 'male' ? 'HOMBRE' : gender === 'female' ? 'MUJER' : 'NO ESPECIFICADO';
      return (
        <div className="text-sm min-w-[60px] text-center" title={fullGenderText}>
          {genderText}
        </div>
      );
    },
  },
  {
    accessorKey: 'cellphoneNumbers',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Teléfono" />,
    cell: ({ row }) => {
      const phones = row.original.cellphoneNumbers.join(', ');
      return (
        <div className="text-sm min-w-[120px] max-w-[160px] truncate" title={phones}>
          {phones}
        </div>
      );
    },
  },
  {
    accessorKey: 'canton',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Cantón" className="hidden lg:table-cell" />
    ),
    cell: ({ row }) => (
      <div className="text-sm min-w-[100px] max-w-[120px] truncate hidden lg:table-cell" title={row.original.canton}>
        {row.original.canton}
      </div>
    ),
  },
  {
    accessorKey: 'parish',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Parroquia" className="hidden lg:table-cell" />
    ),
    cell: ({ row }) => (
      <div className="text-sm min-w-[100px] max-w-[120px] truncate hidden lg:table-cell" title={row.original.parish}>
        {row.original.parish}
      </div>
    ),
  },
  {
    accessorKey: 'conventionalNumbers',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tel. Convencional" className="hidden xl:table-cell" />
    ),
    cell: ({ row }) => {
      const conventionalPhones = row.original.conventionalNumbers?.join(', ') || '-';
      return (
        <div className="text-sm min-w-[120px] max-w-[140px] truncate hidden xl:table-cell" title={conventionalPhones}>
          {conventionalPhones}
        </div>
      );
    },
  },
  {
    accessorKey: 'zoneType',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Zona" className="hidden lg:table-cell" />
    ),
    cell: ({ row }) => (
      <div className="text-sm min-w-[80px] max-w-[100px] truncate hidden lg:table-cell" title={row.original.zoneType}>
        {row.original.zoneType}
      </div>
    ),
  },
  {
    accessorKey: 'reference',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Referencia" className="hidden xl:table-cell" />
    ),
    cell: ({ row }) => {
      const reference = row.original.reference || '-';
      return (
        <div className="text-sm min-w-[100px] max-w-[150px] truncate hidden xl:table-cell" title={reference}>
          {reference}
        </div>
      );
    },
  },
];
