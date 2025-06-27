'use client';

import { MoreHorizontal } from 'lucide-react';
import { AlertDialog, AlertDialogTrigger } from './ui/alert-dialog';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { useState } from 'react';

interface ActionsCellsProps<T> {
  data: T & { id: string }; // T debe al menos tener un id, usamos rutas dinámicas despues?
  DeleteDialog: React.ComponentType<{ id: string; open: boolean; onClose: () => void }>;
  EditDialog: React.ComponentType<{ data: T; onClose: () => void }>;
}

export default function ActionsCells<T>({
  data,
  DeleteDialog,
  EditDialog,
}: ActionsCellsProps<T>) {
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);

  return (
    <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
      <AlertDialog>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='h-8 w-8 p-0'>
              <span className='sr-only'>Open menu</span>
              <MoreHorizontal className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => setOpenEditDialog(true)}
              className='w-full cursor-pointer text-start'
            >
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setOpenDeleteDialog(true)}
              className='w-full cursor-pointer text-start'
            >
              <AlertDialogTrigger className='w-full text-start'>
                Eliminar
              </AlertDialogTrigger>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DeleteDialog
          id={data.id}
          open={openDeleteDialog}
          onClose={() => setOpenDeleteDialog(false)}
        />

        <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
          <DialogTrigger asChild></DialogTrigger>
          <DialogContent className='sm:max-w-xl'>
            <DialogHeader>
              <DialogTitle>Editar Registro</DialogTitle>
              <DialogDescription>
                Realiza los cambios necesarios y guarda
              </DialogDescription>
            </DialogHeader>
            <EditDialog data={data} onClose={() => setOpenEditDialog(false)} />
          </DialogContent>
        </Dialog>
      </AlertDialog>
    </Dialog>
  );
}
