'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import CreateNeurologicaForm from './create-neurologica-form';

export default function CreateNeurologicaDialog() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant='outline'>Agregar Evaluación</Button>
      </DialogTrigger>
      <DialogContent className='w-full max-w-5xl'> 
        <DialogHeader>
          <DialogTitle className='text-xl font-bold'>
            Evaluación Neurológica
          </DialogTitle>
          <DialogDescription className='text-sm text-muted-foreground'>
            Formulario para agregar una nueva evaluación
          </DialogDescription>
        </DialogHeader>

        {/* Formulario */}
        <div className="px-2 sm:px-4 md:px-6 pb-4">
          <CreateNeurologicaForm onClose={() => setIsOpen(false)} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
