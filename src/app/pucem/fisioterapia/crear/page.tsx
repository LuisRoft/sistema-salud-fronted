'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import CreateNeurologicaForm from '@/components/neurologica-table/create-neurologica-form';
import { ChevronLeft } from 'lucide-react';

export default function CreateNeurologicaPage() {
  return (
    <div className="w-full px-6 py-10 max-w-7xl mx-auto space-y-6">
      {/* Botón para volver a la tabla */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/pucem/fisioterapia">
            <ChevronLeft className="mr-1 h-4 w-4" />
            Volver a Evaluaciones
          </Link>
        </Button>
        <h2 className="text-2xl font-semibold">Nueva Evaluación Neurológica</h2>
      </div>

      {/* Formulario */}
      <CreateNeurologicaForm onClose={() => {}} />
    </div>
  );
}
