'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Search, Plus, FileText } from 'lucide-react';
import { ExternalConsultationManagementRow, externalConsultationManagementColumns } from './external-consultation-management-columns';

// Datos de ejemplo para consultas externas
const mockExternalConsultationData: ExternalConsultationManagementRow[] = [
  {
    id: '1',
    numeroArchivo: 'CON-EXT-2024-001',
    cedula: '1234567890',
    fecha: '2024-01-15',
    nombrePaciente: 'Ana García López',
    motivoConsulta: 'Dolor abdominal agudo con náuseas y vómitos desde hace 2 días. Refiere también pérdida de apetito.',
    diagnostico: 'Gastroenteritis aguda. Posible intolerancia alimentaria. Se recomienda dieta blanda y medicación sintomática.',
    planTratamiento: 'Dieta líquida por 24 horas, luego progresión a dieta blanda. Omeprazol 20mg cada 12 horas por 7 días. Control en 48 horas.',
    establecimientoSalud: 'Centro de Salud San Rafael',
    userId: 'user-123',
    patientId: 'patient-456',
    patient: {
      document: '1234567890',
      name: 'Ana',
      lastName: 'García López'
    }
  },
  {
    id: '2',
    numeroArchivo: 'CON-EXT-2024-002',
    cedula: '0987654321',
    fecha: '2024-01-16',
    nombrePaciente: 'Carlos Mendoza Rivera',
    motivoConsulta: 'Tos persistente con expectoración amarillenta. Fiebre de 38.5°C desde hace 3 días.',
    diagnostico: 'Bronquitis aguda. Signos de infección respiratoria alta. Radiografía de tórax normal.',
    planTratamiento: 'Amoxicilina 500mg cada 8 horas por 7 días. Acetaminofén 500mg cada 6 horas. Abundantes líquidos y reposo.',
    establecimientoSalud: 'Hospital General del Norte',
    userId: 'user-124',
    patientId: 'patient-457',
    patient: {
      document: '0987654321',
      name: 'Carlos',
      lastName: 'Mendoza Rivera'
    }
  },
  {
    id: '3',
    numeroArchivo: 'CON-EXT-2024-003',
    cedula: '1122334455',
    fecha: '2024-01-17',
    nombrePaciente: 'María Fernández Castro',
    motivoConsulta: 'Dolor de cabeza intenso y frecuente. Sensibilidad a la luz. Episodios de mareo.',
    diagnostico: 'Cefalea tensional. Posible componente migrañoso. Se descarta patología neurológica grave.',
    planTratamiento: 'Ibuprofeno 400mg según dolor. Relajantes musculares. Técnicas de relajación. Seguimiento neurológico.',
    establecimientoSalud: 'Clínica Metropolitana',
    userId: 'user-125',
    patientId: 'patient-458',
    patient: {
      document: '1122334455',
      name: 'María',
      lastName: 'Fernández Castro'
    }
  },
  {
    id: '4',
    numeroArchivo: 'CON-EXT-2024-004',
    cedula: '5566778899',
    fecha: '2024-01-18',
    nombrePaciente: 'Roberto Silva Vargas',
    motivoConsulta: 'Dolor en rodilla derecha después de actividad física. Inflamación y limitación del movimiento.',
    diagnostico: 'Esguince de ligamentos de rodilla grado I. Inflamación articular postraumática.',
    planTratamiento: 'Reposo relativo por 2 semanas. Hielo local 3 veces al día. Antiinflamatorios. Fisioterapia.',
    establecimientoSalud: 'Centro Médico Deportivo',
    userId: 'user-126',
    patientId: 'patient-459',
    patient: {
      document: '5566778899',
      name: 'Roberto',
      lastName: 'Silva Vargas'
    }
  },
  {
    id: '5',
    numeroArchivo: 'CON-EXT-2024-005',
    cedula: '9988776655',
    fecha: '2024-01-19',
    nombrePaciente: 'Elena Jiménez Torres',
    motivoConsulta: 'Erupciones cutáneas con picazón en brazos y piernas. Antecedente de alergia alimentaria.',
    diagnostico: 'Dermatitis alérgica de contacto. Posible reacción a nuevo medicamento o alimento.',
    planTratamiento: 'Antihistamínicos orales. Cremas con corticoides tópicos. Identificar y evitar alérgeno. Control en 1 semana.',
    establecimientoSalud: 'Centro de Especialidades Médicas',
    userId: 'user-127',
    patientId: 'patient-460',
    patient: {
      document: '9988776655',
      name: 'Elena',
      lastName: 'Jiménez Torres'
    }
  }
];

interface ExternalConsultationManagementTableProps {
  columns: ColumnDef<ExternalConsultationManagementRow, any>[];
}

const ExternalConsultationManagementTable: React.FC<ExternalConsultationManagementTableProps> = ({ columns }) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState('');

  const queryClient = useQueryClient();

  // Query para obtener los datos (simulando una API call)
  const { data: consultations = [] } = useQuery({
    queryKey: ['external-consultation-management'],
    queryFn: () => Promise.resolve(mockExternalConsultationData),
    initialData: mockExternalConsultationData,
  });

  // Función para agregar una nueva consulta
  const addExternalConsultation = (newConsultation: Omit<ExternalConsultationManagementRow, 'id'>) => {
    const consultation: ExternalConsultationManagementRow = {
      ...newConsultation,
      id: `new-${Date.now()}`,
    };

    queryClient.setQueryData(['external-consultation-management'], (oldData: ExternalConsultationManagementRow[] | undefined) => {
      if (!oldData) return [consultation];
      return [consultation, ...oldData];
    });
  };

  // Función para eliminar una consulta
  const deleteExternalConsultation = (id: string) => {
    queryClient.setQueryData(['external-consultation-management'], (oldData: ExternalConsultationManagementRow[] | undefined) => {
      if (!oldData) return [];
      return oldData.filter(item => item.id !== id);
    });
  };

  const table = useReactTable({
    data: consultations,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: 'includesString',
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <div className="w-full space-y-4">
      {/* Controles de filtro y acciones */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar consultas..."
              value={globalFilter}
              onChange={(event) => setGlobalFilter(event.target.value)}
              className="pl-8 max-w-sm"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                Columnas <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>

        </div>
      </div>

      {/* Tabla */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="font-semibold">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <FileText className="h-8 w-8 text-gray-400" />
                    <p className="text-gray-500">No se encontraron consultas externas.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginación */}
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} de{" "}
          {table.getFilteredRowModel().rows.length} fila(s) seleccionada(s).
        </div>
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Filas por página</p>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value));
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={table.getState().pagination.pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            Página {table.getState().pagination.pageIndex + 1} de{" "}
            {table.getPageCount()}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Ir a la primera página</span>
              {'<<'}
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Ir a la página anterior</span>
              {'<'}
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Ir a la página siguiente</span>
              {'>'}
            </Button>
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Ir a la última página</span>
              {'>>'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExternalConsultationManagementTable;
