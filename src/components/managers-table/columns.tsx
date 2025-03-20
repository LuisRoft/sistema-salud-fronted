// Update the columns to handle 'Sin carrera' and show the career name properly
import { ColumnDef } from '@tanstack/react-table';
import { Manager } from '@/types/manager/get-manager';
import { DataTableColumnHeader } from '@/components/ui/data-table-header';
import ActionsCells from '../actions-cells';
import EditManagerDialog from './edit-manager-dialog';
import DeleteManagerDialog from './delete-manager-dialog';

export const columns: ColumnDef<Manager>[] = [
  {
    accessorKey: 'document',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Cédula de Identidad' />
    ),
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Nombre' />
    ),
    cell: ({ row }) => {
      const fullName = row.original.name.toUpperCase();
      return <div className='text-sm capitalize'>{fullName}</div>;
    },
  },
  {
    accessorKey: 'lastName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Apellido' />
    ),
    cell: ({ row }) => {
      const lastName = row.original.lastName.toUpperCase();
      return <div className='text-sm capitalize'>{lastName}</div>;
    },
  },
  {
    accessorKey: 'email',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Correo Electrónico' />
    ),
  },
  {
    accessorKey: 'career.careerName',
    header: 'Carrera',
    cell: ({ row }) => row.original.career?.careerName || 'Sin Carrera',
  },
  {
    accessorKey: 'team.teamName',
    header: 'Equipo',
    cell: ({ row }) => row.original.team?.teamName || 'Sin equipo',
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <ActionsCells<Manager>
        data={row.original}
        DeleteDialog={DeleteManagerDialog}
        EditDialog={EditManagerDialog}
      />
    ),
  },
];
