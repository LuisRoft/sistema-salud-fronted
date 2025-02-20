'use client';

import { MoreHorizontal } from 'lucide-react';
import { AlertDialog, AlertDialogTrigger } from './ui/alert-dialog';
import { Button } from './ui/button';
import {  DialogHeader } from './ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { useState } from 'react';
import { editTeam } from '@/services/teamsService';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Team } from './teams-table/columns';


interface ActionsCellsProps<T> {
  data: Team;
  DeleteDialog: React.ComponentType<{ id: string; open: boolean; onClose: () => void }>;
  EditDialog: React.ComponentType<{ data: editTeam; onClose: () => void }>;
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
            className='w-full cursor-pointer text-start'>
              <AlertDialogTrigger className='w-full text-start'>
                Eliminar
              </AlertDialogTrigger>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <DeleteDialog
          id={(data as any).id}
          open={openDeleteDialog}
          onClose={() => setOpenDeleteDialog(false)}
        />

      <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
            <DialogTrigger asChild>
            </DialogTrigger>
            <DialogContent className='sm:max-w-xl'>
              <DialogHeader>
                <DialogTitle>Editar Team</DialogTitle>
                <DialogDescription>
                  Formulario para editar un team
                </DialogDescription>
              </DialogHeader>
              <EditDialog data={data} onClose={() => setOpenEditDialog(false)}
        />
            </DialogContent>
        </Dialog>        

      </AlertDialog>
    </Dialog>
  );
}
