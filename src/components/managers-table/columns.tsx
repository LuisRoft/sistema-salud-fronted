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
    cell: ({ row }) => (
      <div className='text-sm font-medium min-w-[120px]'>{row.original.document}</div>
    ),
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Nombre' />
    ),
    cell: ({ row }) => {
      const fullName = row.original.name.toUpperCase();
      return <div className='text-sm capitalize min-w-[100px] truncate max-w-[150px]' title={fullName}>{fullName}</div>;
    },
  },
  {
    accessorKey: 'lastName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Apellido' />
    ),
    cell: ({ row }) => {
      const lastName = row.original.lastName.toUpperCase();
      return <div className='text-sm capitalize min-w-[100px] truncate max-w-[150px]' title={lastName}>{lastName}</div>;
    },
  },
  {
    accessorKey: 'email',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Correo Electrónico' />
    ),
    cell: ({ row }) => (
      <div className='text-sm min-w-[180px] max-w-[250px] truncate' title={row.original.email}>
        {row.original.email}
      </div>
    ),
  },
  {
    accessorKey: 'career.careerName',
    header: 'Carrera',
    cell: ({ row }) => {
      const careerName = row.original.career?.careerName || 'Sin Carrera';
      return (
        <div className='text-sm min-w-[120px] max-w-[180px] truncate' title={careerName}>
          {careerName}
        </div>
      );
    },
  },
  {
    accessorKey: 'team.teamName',
    header: 'Equipo',
    cell: ({ row }) => {
      const teamName = row.original.team?.teamName || 'Sin equipo';
      return (
        <div className='text-sm min-w-[100px] max-w-[150px] truncate' title={teamName}>
          {teamName}
        </div>
      );
    },
  },
  {
    id: 'actions',
    header: 'Acciones',
    cell: ({ row }) => (
      <div className='min-w-[100px]'>
        <ActionsCells<Manager>
          data={row.original}
          DeleteDialog={DeleteManagerDialog}
          EditDialog={EditManagerDialog}
        />
      </div>
    ),
  },
];
