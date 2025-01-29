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
        <Button variant='outline'>Agregar Cuidador</Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-xl'>
        <DialogHeader>
          <DialogTitle>Crear Cuidador</DialogTitle>
          <DialogDescription>
            Formulario para crear un nuevo cuidador
          </DialogDescription>
        </DialogHeader>
        <CreateCaregiversForm onClose={() => setIsOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
