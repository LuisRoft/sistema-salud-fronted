'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { User } from './columns';
import { MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface ActionsCellsProps<T> {
  data: User;
  DeleteDialog: React.ComponentType<{ id: string; open: boolean; onClose: () => void }>;
  EditDialog: React.ComponentType<{ data: User; onClose: () => void }>;
}

export default function ActionsCells<T>({
  data,
  DeleteDialog,
  EditDialog,
}: ActionsCellsProps<T>) {
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menú</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => setOpenEditDialog(true)}
            className="w-full cursor-pointer text-start"
          >
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setOpenDeleteDialog(true)}
            className="w-full cursor-pointer text-start"
          >
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Diálogo de eliminación */}
      <DeleteDialog
        id={data.id}
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      />

      {/* Diálogo de edición */}
      <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
        <DialogContent className="sm:max-w-xl">
          <EditDialog data={data} onClose={() => setOpenEditDialog(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}
