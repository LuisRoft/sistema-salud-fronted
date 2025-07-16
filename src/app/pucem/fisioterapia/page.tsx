'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import NeurologicaTable from '@/components/neurologica-table/neurologica-table';

export default function FisioterapiaPage() {
  return (
    <div className="container mx-auto py-10 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          Evaluaciones Neurológicas
        </h2>
        {/* Botón que redirige a /fisioterapia/crear */}
        <Button asChild>
          <Link href="/pucem/fisioterapia/crear">Agregar Evaluación</Link>
        </Button>
      </div>
      <NeurologicaTable />
    </div>
  );
}
