'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import CreateUserForm from './create-team-form';
import React, { useState } from 'react';
import { Button } from '../../ui/button';
import { DialogHeader } from '../../ui/dialog';

export default function CreateTeamDialog() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant='outline'>Agregar team</Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-xl'>
        <DialogHeader>
          <DialogTitle>Crear Team</DialogTitle>
          <DialogDescription>
            Formulario para crear un nuevo team
          </DialogDescription>
        </DialogHeader>
        <CreateUserForm onClose={() => setIsOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
