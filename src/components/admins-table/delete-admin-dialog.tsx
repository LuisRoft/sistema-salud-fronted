'use client';

import { getSession } from 'next-auth/react';

import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { deleteAdmin } from '@/services/adminService';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function DeleteAdminDialog({ id }: { id: string }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const session = await getSession();
      const token = session?.user.access_token;
      return await deleteAdmin(id, token as string);
    },
    onSuccess: () => {
      toast({
        title: 'Eliminación Exitosa',
        description: 'Administrador eliminado exitosamente.',
      });
      queryClient.invalidateQueries({ queryKey: ['admins'] });
    },
    onError: (error: unknown) => {
      toast({
        title: 'Oh no! Algo está mal',
        description: (error as Error).message,
        variant: 'destructive',
      });
    },
  });

  return (
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
        <AlertDialogDescription>
          Esta acción no se puede deshacer. Esto eliminará permanentemente el
          administrador seleccionado.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancelar</AlertDialogCancel>
        <AlertDialogAction
          onClick={() => mutate()}
          className='gap-2'
          disabled={isPending}
        >
          {isPending ? (
            <>
              <span>Eliminando</span>
              <Loader2 className='animate-spin' size={16} />
            </>
          ) : (
            'Eliminar'
          )}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  );
}
