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
import CreateCaregiversForm from './create-caregivers-form';

export default function CreateCaregiversDialog() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant='outline' className="w-full sm:w-auto text-sm">
          <span className="hidden sm:inline">Agregar Cuidador</span>
          <span className="sm:hidden">+ Cuidador</span>
        </Button>
      </DialogTrigger>
      <DialogContent className='w-[95vw] max-w-lg sm:max-w-xl lg:max-w-2xl'>
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">Crear Cuidador</DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            Formulario para crear un nuevo cuidador
          </DialogDescription>
        </DialogHeader>
        <CreateCaregiversForm onClose={() => setIsOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
