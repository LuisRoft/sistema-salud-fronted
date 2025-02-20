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
import { Button } from '../ui/button';
import CreateUserForm from './create-admin-form';

export default function CreateAdminDialog() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant='outline'>Agregar administrador</Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-xl'>
        <DialogHeader>
          <DialogTitle>Crear Administrador</DialogTitle>
          <DialogDescription>
            Formulario para crear un nuevo administrador
          </DialogDescription>
        </DialogHeader>
        <CreateUserForm onClose={() => setIsOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
