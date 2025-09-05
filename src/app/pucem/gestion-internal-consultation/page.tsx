import { Button } from '@/components/ui/button';
import InternalConsultationManagementTable from '@/components/internal-consultation/internal-consultation-management-table';
import { internalConsultationManagementColumns } from '@/components/internal-consultation/internal-consultation-management-columns';
import Link from 'next/link';
import { Plus, Stethoscope } from 'lucide-react';

export default function GestionInterconsultaPage() {
  return (
    <div className='space-y-6 p-6'>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <Stethoscope className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className='text-3xl font-bold text-gray-900 dark:text-white'>
              Gestionar Interconsultas
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Administra todas las interconsultas del sistema
            </p>
          </div>
        </div>
        <Link href="/pucem/consultation-internal">
          <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="h-4 w-4" />
            Nueva Interconsulta
          </Button>
        </Link>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <InternalConsultationManagementTable columns={internalConsultationManagementColumns} />
      </div>
    </div>
  );
}
