'use client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Career } from '@/types/career/get-careers';
import { CareerForm } from './carreer-form';

export function CareerDialog({
  isOpen,
  onClose,
  onSelect,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (career: Career) => void; // Aseguramos que esta función sea pasada
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Seleccionar Carrera</DialogTitle>
        </DialogHeader>
        <CareerForm onClose={onClose} onSelect={onSelect} />
      </DialogContent>
    </Dialog>
  );
}
