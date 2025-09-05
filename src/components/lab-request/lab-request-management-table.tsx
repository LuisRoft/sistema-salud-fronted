'use client';

import { DataTable } from '../ui/data-table';
import { managementColumns } from './management-columns';
import { useState, useEffect } from 'react';
import { getSession } from 'next-auth/react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import TableSkeleton from '../table-skeleton';
import { getLaboratoryRequests } from '@/services/labRequestService';
import { LabRequestManagementRow } from './management-columns';

export default function LabRequestManagementTable() {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [localData, setLocalData] = useState<LabRequestManagementRow[]>([]);
  const queryClient = useQueryClient();

  // Datos hardcodeados para demostración
  const initialData: LabRequestManagementRow[] = [
    {
      id: '1',
      numero_de_archivo: 'LAB-2025-001',
      cedula: '1234567890',
      fecha: '2025-01-15',
      diagnostico_descripcion1: 'Anemia ferropénica',
      diagnostico_cie1: 'D50.9',
      diagnostico_descripcion2: 'Deficiencia nutricional',
      diagnostico_cie2: 'E63.9',
      prioridad: 'URGENTE',
      hematologia_examenes: ['Biometría Hemática', 'Hemoglobina (HB)', 'Hematocrito (HCTO)'],
      coagulacion_examenes: ['Tiempo de Protrombina (TP)', 'INR'],
      quimica_sanguinea_examenes: ['Glucosa Basal', 'Creatinina', 'Urea'],
      orina_examenes: ['Elemental y Microscópico (EMO)'],
      heces_examenes: [],
      hormonas_examenes: ['TSH', 'T4'],
      serologia_examenes: ['PCR Semicuantitativa'],
      userId: 'user-1',
      patientId: 'patient-1',
      patient: {
        document: '1234567890',
        name: 'María',
        lastName: 'González'
      }
    },
    {
      id: '2',
      numero_de_archivo: 'LAB-2025-002',
      cedula: '0987654321',
      fecha: '2025-01-16',
      diagnostico_descripcion1: 'Diabetes mellitus tipo 2',
      diagnostico_cie1: 'E11.9',
      diagnostico_descripcion2: 'Hipertensión arterial',
      diagnostico_cie2: 'I10',
      prioridad: 'RUTINA',
      hematologia_examenes: ['Biometría Hemática'],
      coagulacion_examenes: [],
      quimica_sanguinea_examenes: ['Glucosa Basal', 'Hemoglobina Glicosilada (HBA1C)', 'Colesterol Total', 'HDL', 'LDL', 'Triglicéridos'],
      orina_examenes: ['Elemental y Microscópico (EMO)', 'Glucosa en Orina Parcial'],
      heces_examenes: [],
      hormonas_examenes: [],
      serologia_examenes: [],
      userId: 'user-2',
      patientId: 'patient-2',
      patient: {
        document: '0987654321',
        name: 'Juan',
        lastName: 'Pérez'
      }
    },
    {
      id: '3',
      numero_de_archivo: 'LAB-2025-003',
      cedula: '1122334455',
      fecha: '2025-01-17',
      diagnostico_descripcion1: 'Infección del tracto urinario',
      diagnostico_cie1: 'N39.0',
      diagnostico_descripcion2: 'Cistitis aguda',
      diagnostico_cie2: 'N30.0',
      prioridad: 'URGENTE',
      hematologia_examenes: ['Biometría Hemática', 'Velocidad de Eritrosedimentación'],
      coagulacion_examenes: [],
      quimica_sanguinea_examenes: ['Urea', 'Creatinina'],
      orina_examenes: ['Elemental y Microscópico (EMO)', 'Gram Gota Fresca'],
      heces_examenes: [],
      hormonas_examenes: [],
      serologia_examenes: ['PCR Semicuantitativa'],
      userId: 'user-3',
      patientId: 'patient-3',
      patient: {
        document: '1122334455',
        name: 'Ana',
        lastName: 'Rodríguez'
      }
    },
    {
      id: '4',
      numero_de_archivo: 'LAB-2025-004',
      cedula: '5544332211',
      fecha: '2025-01-18',
      diagnostico_descripcion1: 'Hipotiroidismo',
      diagnostico_cie1: 'E03.9',
      diagnostico_descripcion2: 'Trastorno tiroideo no especificado',
      diagnostico_cie2: 'E07.9',
      prioridad: 'RUTINA',
      hematologia_examenes: ['Biometría Hemática'],
      coagulacion_examenes: [],
      quimica_sanguinea_examenes: ['Glucosa Basal', 'Colesterol Total'],
      orina_examenes: [],
      heces_examenes: [],
      hormonas_examenes: ['TSH', 'T3', 'T4', 'FT3', 'FT4'],
      serologia_examenes: [],
      userId: 'user-4',
      patientId: 'patient-4',
      patient: {
        document: '5544332211',
        name: 'Carlos',
        lastName: 'Martínez'
      }
    },
    {
      id: '5',
      numero_de_archivo: 'LAB-2025-005',
      cedula: '9988776655',
      fecha: '2025-01-19',
      diagnostico_descripcion1: 'Parasitosis intestinal',
      diagnostico_cie1: 'B82.9',
      diagnostico_descripcion2: 'Trastorno digestivo',
      diagnostico_cie2: 'K59.9',
      prioridad: 'RUTINA',
      hematologia_examenes: ['Biometría Hemática', 'Eosinófilo en Moco Nasal'],
      coagulacion_examenes: [],
      quimica_sanguinea_examenes: [],
      orina_examenes: [],
      heces_examenes: ['Parásitos en Heces', 'Sangre Oculta en Heces', 'Leucocitos en Heces'],
      hormonas_examenes: [],
      serologia_examenes: [],
      userId: 'user-5',
      patientId: 'patient-5',
      patient: {
        document: '9988776655',
        name: 'Sofía',
        lastName: 'López'
      }
    }
  ];

  // Función para eliminar un elemento del estado local
  const handleDeleteRequest = (id: string) => {
    setLocalData(prevData => prevData.filter(item => item.id !== id));
  };

  // Función para actualizar un elemento del estado local
  const handleUpdateRequest = (id: string, updatedData: Partial<LabRequestManagementRow>) => {
    setLocalData(prevData => 
      prevData.map(item => 
        item.id === id ? { ...item, ...updatedData } : item
      )
    );
  };

  // Inicializar datos locales
  useEffect(() => {
    setLocalData(initialData);
  }, []);

  // Forzar actualización de la query cuando cambien los datos locales
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['lab-requests-management'] });
  }, [localData, queryClient]);

  // Exponer las funciones a través del query client para que los componentes hijos puedan usarlas
  useEffect(() => {
    queryClient.setQueryData(['lab-management-actions'], {
      deleteRequest: handleDeleteRequest,
      updateRequest: handleUpdateRequest
    });
  }, [queryClient]);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['lab-requests-management', pageIndex, pageSize, localData.length],
    queryFn: async () => {
      // Simular una carga de red solo en la primera carga
      if (localData.length === 0) {
        await new Promise(resolve => setTimeout(resolve, 800));
      }
      
      // Devolver los datos del estado local
      return { requests: localData, total: localData.length };
    },
    staleTime: 30000, // 30 segundos
    enabled: localData.length > 0, // Solo ejecutar cuando tengamos datos locales
  });

  if (isError) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">
            Error al cargar las solicitudes de laboratorio
          </p>
          <button 
            onClick={() => refetch()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Solicitudes de Laboratorio
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Gestiona las solicitudes de laboratorio del sistema
          </p>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Total: {localData?.length || 0} solicitudes
        </div>
      </div>

      {isLoading ? (
        <TableSkeleton rows={pageSize} columns={managementColumns.length} />
      ) : (
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <DataTable
            columns={managementColumns}
            data={localData || []}
            pageIndex={pageIndex}
            setPageIndex={setPageIndex}
            pageSize={pageSize}
            setPageSize={setPageSize}
            totalPages={Math.ceil((localData?.length || 1) / pageSize)}
          />
        </div>
      )}
    </div>
  );
}
