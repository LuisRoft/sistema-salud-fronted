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
        <Button variant="outline" className="w-full sm:w-auto text-sm">
          <span className="hidden sm:inline">Agregar Gestor</span>
          <span className="sm:hidden">+ Gestor</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-lg sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">Crear Gestor</DialogTitle>
        </DialogHeader>
        <CreateManagerForm onClose={() => setIsOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
