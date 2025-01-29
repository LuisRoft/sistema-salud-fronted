'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import CreateManagerForm from './create-manager-form';

export default function CreateManagerDialog() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Agregar Gestor</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear Gestor</DialogTitle>
        </DialogHeader>
        <CreateManagerForm onClose={() => setIsOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
