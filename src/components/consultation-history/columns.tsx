'use client';

import { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '../ui/data-table-header';
import { Button } from '../ui/button';
import { Download } from 'lucide-react';
import { getSession } from 'next-auth/react';
import { downloadService } from '@/services/downloadService';

export interface ConsultationHistory {
  id: string;
  numeroDeArchivo: number;
  fecha: string;
  type: string;
  patient: {
    name: string;
    lastName: string;
    document: string;
  };
  motivoConsulta: string;
  diagnosticosDesc: string[];
}

async function handleDownloadPDF(consultation: ConsultationHistory) {
  try {
    const session = await getSession();
    if (!session?.user?.access_token) throw new Error('No autorizado');

    // Log para debug
    console.log('Datos de la consulta:', {
      id: consultation.id,
      tipo: consultation.type
    });

    if (!consultation.id) {
      throw new Error('ID de consulta no válido');
    }

    await downloadService.downloadPDF(
      consultation.type,
      session.user.access_token,
      consultation.id
    );
  } catch (error) {
    console.error('Error detallado:', error);
    if (error instanceof Error) {
      alert(`Error al descargar el PDF: ${error.message}`);
    } else {
      alert('Error al descargar el PDF');
    }
  }
}

export const columns: ColumnDef<ConsultationHistory>[] = [
  {
    accessorKey: 'numeroDeArchivo',
    header: ({ column }) => (
      <DataTableColumnHeader 
        column={column} 
        title="N° Archivo"
      />
    ),
  },
  {
    accessorKey: 'fecha',
    header: ({ column }) => (
      <DataTableColumnHeader 
        column={column} 
        title="Fecha"
      />
    ),
    cell: ({ row }) => {
      const fecha = row.getValue('fecha');
      return <div>{fecha ? new Date(fecha as string).toLocaleDateString() : 'Sin fecha'}</div>;
    },
  },
  {
    accessorKey: 'type',
    header: ({ column }) => (
      <DataTableColumnHeader 
        column={column} 
        title="Tipo"
      />
    ),
    filterFn: (row, id, value) => {
      return value === "all" ? true : row.getValue(id) === value;
    },
  },
  {
    accessorKey: 'patient',
    header: ({ column }) => (
      <DataTableColumnHeader 
        column={column} 
        title="Paciente"
      />
    ),
    cell: ({ row }) => {
      const patient = row.original.patient;
      if (!patient) return <div>Sin datos del paciente</div>;
      
      return (
        <div>
          <div className="font-medium">
            {patient.name && patient.lastName 
              ? `${patient.name} ${patient.lastName}`
              : 'Nombre no disponible'
            }
          </div>
          <div className="text-sm text-gray-500">
            {patient.document || 'Sin documento'}
          </div>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      const patient = row.original.patient;
      const searchValue = value.toLowerCase();
      return (
        patient.name.toLowerCase().includes(searchValue) ||
        patient.lastName.toLowerCase().includes(searchValue) ||
        patient.document.toLowerCase().includes(searchValue)
      );
    },
  },
  {
    accessorKey: 'motivoConsulta',
    header: ({ column }) => (
      <DataTableColumnHeader 
        column={column} 
        title="Motivo"
      />
    ),
    cell: ({ row }) => {
      const motivo = row.getValue('motivoConsulta') as string;
      return motivo && motivo.length > 50 ? `${motivo.substring(0, 50)}...` : (motivo || 'Sin motivo registrado');
    },
  },
  {
    accessorKey: 'diagnosticosDesc',
    header: ({ column }) => (
      <DataTableColumnHeader 
        column={column} 
        title="Diagnósticos"
      />
    ),
    cell: ({ row }) => {
      const diagnosticos = row.getValue('diagnosticosDesc') as string[];
      if (!diagnosticos?.length) return 'Sin diagnósticos';
      const displayText = diagnosticos.join(', ');
      return displayText.length > 50 ? `${displayText.substring(0, 50)}...` : displayText;
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      return (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleDownloadPDF(row.original)}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Descargar PDF
        </Button>
      );
    },
  },
];