'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import CreateNeurologicaForm from '@/components/neurologica-table/create-neurologica-form';
import { ArrowLeft } from 'lucide-react';

export default function CreateNeurologicaPage() {
  return (
    <div className="w-full px-6 py-10 max-w-7xl mx-auto space-y-6">
      {/* Header with return button */}
      <div className="space-y-4">
        <Button 
          variant="outline" 
          size="sm" 
          asChild 
          className="hover:bg-gray-50 transition-colors"
        >
          <Link href="/pucem/fisioterapia" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Volver a Evaluaciones
          </Link>
        </Button>
        
        <div className="">
          <h1 className="text-3xl font-bold text-gray-900">
            Nueva Evaluación Neurológica
          </h1>
        </div>
      </div>
      {/* Form */}
      <div className="bg-white rounded-lg border p-6">
        <CreateNeurologicaForm onClose={() => {}} />
      </div>
    </div>
  );
}
