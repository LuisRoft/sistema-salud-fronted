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
import { ChevronDown, Search, Plus, Stethoscope } from 'lucide-react';
import { InternalConsultationManagementRow, internalConsultationManagementColumns } from './internal-consultation-management-columns';

// Datos de ejemplo para interconsultas
const mockInternalConsultationData: InternalConsultationManagementRow[] = [
  {
    id: '1',
    numeroArchivo: 'INT-CON-2024-001',
    cedula: '1234567890',
    fecha: '2024-01-15',
    nombrePaciente: 'Ana García López',
    motivoInterconsulta: 'Evaluación de soplo cardíaco detectado en examen físico. Paciente refiere ocasional dolor torácico y disnea de esfuerzo.',
    especialidadSolicitada: 'cardiologia',
    diagnosticoPresuntivo: 'Soplo cardíaco a estudio. Posible valvulopatía. Descartar cardiopatía isquémica.',
    hallazgosRelevantes: 'Soplo sistólico grado III/VI en foco aórtico. ECG con signos de hipertrofia ventricular izquierda leve.',
    prioridadInterconsulta: 'Media',
    servicioSolicitante: 'Medicina Interna',
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
    numeroArchivo: 'INT-CON-2024-002',
    cedula: '0987654321',
    fecha: '2024-01-16',
    nombrePaciente: 'Carlos Mendoza Rivera',
    motivoInterconsulta: 'Cefalea persistente con alteraciones visuales. Episodios de confusión y desorientación temporal.',
    especialidadSolicitada: 'neurologia',
    diagnosticoPresuntivo: 'Cefalea secundaria a estudio. Descartar hipertensión intracraneal. Posible lesión ocupante de espacio.',
    hallazgosRelevantes: 'Papiledema bilateral. Alteración del campo visual. Reflejos osteotendinosos exaltados.',
    prioridadInterconsulta: 'Alta',
    servicioSolicitante: 'Emergencias',
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
    numeroArchivo: 'INT-CON-2024-003',
    cedula: '1122334455',
    fecha: '2024-01-17',
    nombrePaciente: 'María Fernández Castro',
    motivoInterconsulta: 'Dolor abdominal crónico con pérdida de peso. Cambios en el hábito intestinal en los últimos 3 meses.',
    especialidadSolicitada: 'gastroenterologia',
    diagnosticoPresuntivo: 'Síndrome de intestino irritable vs. enfermedad inflamatoria intestinal. Descartar neoplasia colorrectal.',
    hallazgosRelevantes: 'Pérdida de peso de 8 kg en 3 meses. Sangre oculta en heces positiva. Dolor en fosa ilíaca derecha.',
    prioridadInterconsulta: 'Alta',
    servicioSolicitante: 'Gastroenterología',
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
    numeroArchivo: 'INT-CON-2024-004',
    cedula: '5566778899',
    fecha: '2024-01-18',
    nombrePaciente: 'Roberto Silva Vargas',
    motivoInterconsulta: 'Lesiones cutáneas de aparición reciente. Múltiples manchas pigmentadas con cambios en forma y color.',
    especialidadSolicitada: 'dermatologia',
    diagnosticoPresuntivo: 'Lesiones melanocíticas atípicas. Descartar melanoma maligno. Estudio dermatoscópico urgente.',
    hallazgosRelevantes: 'Múltiples nevos con criterios ABCDE positivos. Lesión en espalda de 1.2 cm con bordes irregulares.',
    prioridadInterconsulta: 'Urgente',
    servicioSolicitante: 'Medicina Familiar',
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
    numeroArchivo: 'INT-CON-2024-005',
    cedula: '9988776655',
    fecha: '2024-01-19',
    nombrePaciente: 'Elena Jiménez Torres',
    motivoInterconsulta: 'Dolor articular poliarticular simétrico. Rigidez matutina prolongada y fatiga crónica.',
    especialidadSolicitada: 'traumatologia',
    diagnosticoPresuntivo: 'Artritis reumatoide probable. Descartar artropatía inflamatoria. Evaluar actividad de la enfermedad.',
    hallazgosRelevantes: 'Artritis simétrica en manos y pies. Factor reumatoide positivo. VSG elevada (45 mm/h).',
    prioridadInterconsulta: 'Media',
    servicioSolicitante: 'Medicina Interna',
    userId: 'user-127',
    patientId: 'patient-460',
    patient: {
      document: '9988776655',
      name: 'Elena',
      lastName: 'Jiménez Torres'
    }
  }
];

interface InternalConsultationManagementTableProps {
  columns: ColumnDef<InternalConsultationManagementRow, any>[];
}

const InternalConsultationManagementTable: React.FC<InternalConsultationManagementTableProps> = ({ columns }) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState('');

  const queryClient = useQueryClient();

  // Query para obtener los datos (simulando una API call)
  const { data: consultations = [] } = useQuery({
    queryKey: ['internal-consultation-management'],
    queryFn: () => Promise.resolve(mockInternalConsultationData),
    initialData: mockInternalConsultationData,
  });

  // Función para agregar una nueva interconsulta
  const addInternalConsultation = (newConsultation: Omit<InternalConsultationManagementRow, 'id'>) => {
    const consultation: InternalConsultationManagementRow = {
      ...newConsultation,
      id: `new-${Date.now()}`,
    };

    queryClient.setQueryData(['internal-consultation-management'], (oldData: InternalConsultationManagementRow[] | undefined) => {
      if (!oldData) return [consultation];
      return [consultation, ...oldData];
    });
  };

  // Función para eliminar una interconsulta
  const deleteInternalConsultation = (id: string) => {
    queryClient.setQueryData(['internal-consultation-management'], (oldData: InternalConsultationManagementRow[] | undefined) => {
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
              placeholder="Buscar interconsultas..."
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
                    <Stethoscope className="h-8 w-8 text-gray-400" />
                    <p className="text-gray-500">No se encontraron interconsultas.</p>
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

export default InternalConsultationManagementTable;
