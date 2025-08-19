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
        <Button variant='outline' className="w-full sm:w-auto text-sm">
          <span className="hidden sm:inline">Agregar Administrador</span>
          <span className="sm:hidden">+ Admin</span>
        </Button>
      </DialogTrigger>
      <DialogContent className='w-[95vw] max-w-lg sm:max-w-xl lg:max-w-2xl'>
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">Crear Administrador</DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            Formulario para crear un nuevo administrador
          </DialogDescription>
        </DialogHeader>
        <CreateUserForm onClose={() => setIsOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
