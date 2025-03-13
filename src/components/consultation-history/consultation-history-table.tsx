'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getSession } from 'next-auth/react';
import { DataTable } from '../ui/data-table';
import { columns } from './columns';
import TableSkeleton from '../table-skeleton';
import { getAllConsultations } from '@/services/consultationHistory.service';
import { ConsultationFilters } from './consultation-filters';
import { Button } from '../ui/button';
import { Download } from 'lucide-react';
import { downloadAllConsultations } from '@/services/downloadService';

export default function ConsultationHistoryTable() {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [typeFilter, setTypeFilter] = useState('Todos');
  const [searchFilter, setSearchFilter] = useState('');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['all-consultations', pageIndex, pageSize], // Añadir pageIndex y pageSize como dependencias
    queryFn: async () => {
      const session = await getSession();
      if (!session?.user?.access_token) throw new Error('No hay token');
      return getAllConsultations(session.user.access_token);
    },
    staleTime: 5000 // Mantener los datos anteriores mientras se cargan los nuevos
  });

  if (isError) {
    return <div className="text-red-500 p-4">Error al cargar los datos</div>;
  }

  // Función para filtrar las consultas
  const filterConsultations = (consultations: any[]) => {
    if (!consultations) return [];
    
    return consultations.filter(consultation => {
      const matchesType = typeFilter === 'Todos' || consultation.type === typeFilter;
      const searchTerm = searchFilter.toLowerCase();
      const matchesSearch = searchTerm === '' || 
        consultation.patient?.name?.toLowerCase().includes(searchTerm) ||
        consultation.patient?.lastName?.toLowerCase().includes(searchTerm) ||
        consultation.patient?.document?.toLowerCase().includes(searchTerm);
      
      return matchesType && matchesSearch;
    });
  };

  const sortedConsultations = data?.consultations?.sort((a, b) => 
    new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
  ) || [];

  const filteredConsultations = filterConsultations(sortedConsultations);

  const handleBulkDownload = async (consultations: ConsultationHistory[]) => {
    try {
      const session = await getSession();
      if (!session?.user?.access_token) throw new Error('No autorizado');
      
      await downloadAllConsultations(session.user.access_token, consultations);
    } catch (error) {
      console.error('Error en la descarga masiva:', error);
      toast({
        title: 'Error',
        description: 'Error al descargar los archivos. Por favor, intente nuevamente.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div>
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-400 p-4 rounded-lg">
          <h3 className="font-bold">Consultas Externas</h3>
          <p className="text-2xl">{data?.stats.externas || 0}</p>
        </div>
        <div className="bg-green-400 p-4 rounded-lg">
          <h3 className="font-bold">Consultas Internas</h3>
          <p className="text-2xl">{data?.stats.internas || 0}</p>
        </div>
        <div className="bg-yellow-400 p-4 rounded-lg">
          <h3 className="font-bold">Consultas Enfermería</h3>
          <p className="text-2xl">{data?.stats.enfermeria || 0}</p>
        </div>
        <div className="bg-purple-400 p-4 rounded-lg">
          <h3 className="font-bold">Solicitudes Laboratorio</h3>
          <p className="text-2xl">{data?.stats.laboratorio || 0}</p>
        </div>
      </div>

      {/* Filters and Download button */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="w-full md:w-2/3">
          <ConsultationFilters
            typeFilter={typeFilter}
            setTypeFilter={setTypeFilter}
            searchFilter={searchFilter}
            setSearchFilter={setSearchFilter}
          />
        </div>
        <Button
          onClick={() => handleBulkDownload(sortedConsultations)}
          className="w-full md:w-auto flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Descargar Todo
        </Button>
      </div>

      {/* Table */}
      {isLoading ? (
        <TableSkeleton rows={pageSize} columns={columns.length} />
      ) : (
        <DataTable
          columns={columns}
          data={filteredConsultations.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize)}
          pageIndex={pageIndex}
          setPageIndex={setPageIndex}
          pageSize={pageSize}
          setPageSize={setPageSize}
          totalPages={Math.max(1, Math.ceil(filteredConsultations.length / pageSize))}
        />
      )}
    </div>
  );
}