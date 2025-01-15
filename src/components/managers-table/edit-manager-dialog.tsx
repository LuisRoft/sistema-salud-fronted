'use client';

import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { EditManagerForm } from './edit-manager-form';
import { Manager } from '@/types/manager/get-manager';


export default function EditManagerDialog({
  data,
  onClose,
}: {
  data: Manager;
  onClose: () => void;
}) {
  return (
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>Editar Gestor</DialogTitle>
        <DialogDescription>
          Realiza cambios en la información del Gestor y guarda cuando hayas terminado.
        </DialogDescription>
      </DialogHeader>
      <EditManagerForm onClose={onClose} manager={data} />
    </DialogContent>
  );
}
