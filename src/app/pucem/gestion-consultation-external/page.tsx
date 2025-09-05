import { Button } from '@/components/ui/button';
import ExternalConsultationManagementTable from '@/components/external-consultation/external-consultation-management-table';
import { externalConsultationManagementColumns } from '@/components/external-consultation/external-consultation-management-columns';
import Link from 'next/link';
import { Plus, Activity } from 'lucide-react';

export default function GestionConsultaExternaPage() {
  return (
    <div className='space-y-6 p-6'>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
            <Activity className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h1 className='text-3xl font-bold text-gray-900 dark:text-white'>
              Gestionar Consultas Externas
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Administra todas las consultas externas del sistema
            </p>
          </div>
        </div>
        <Link href="/pucem/consultation-external">
          <Button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white">
            <Plus className="h-4 w-4" />
            Nueva Consulta Externa
          </Button>
        </Link>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <ExternalConsultationManagementTable columns={externalConsultationManagementColumns} />
      </div>
    </div>
  );
}
