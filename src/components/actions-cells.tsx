'use client';

import { MoreHorizontal } from 'lucide-react';
import { AlertDialog, AlertDialogTrigger } from './ui/alert-dialog';
import { Button } from './ui/button';
import { Dialog } from './ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { useState } from 'react';

interface ActionsCellsProps<T> {
  data: T;
  DeleteDialog: React.ComponentType<{ id: string }>;
  EditDialog: React.ComponentType<{ data: T; onClose: () => void }>;
}

export default function ActionsCells<T>({
  data,
  DeleteDialog,
  EditDialog,
}: ActionsCellsProps<T>) {
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
            <DropdownMenuItem>
              <AlertDialogTrigger className='w-full text-start'>
                Eliminar
              </AlertDialogTrigger>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <DeleteDialog id={(data as any).id} />
        <EditDialog data={data} onClose={() => setOpenEditDialog(false)} />
      </AlertDialog>
    </Dialog>
  );
}
