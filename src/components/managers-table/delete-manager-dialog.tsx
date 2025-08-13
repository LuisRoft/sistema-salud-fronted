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
import { deleteManager } from '@/services/managerService';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function DeleteManagerDialog({ id }: { id: string }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async () => {
      const session = await getSession();
      const token = session?.user.access_token;
      if (!token) {
        throw new Error('Token no disponible.');
      }
      return await deleteManager(id, token);
    },
    onSuccess: () => {
      toast({
        title: 'Eliminación Exitosa',
        description: 'Manager eliminado exitosamente.',
      });
      queryClient.invalidateQueries({ queryKey: ['managers'] });
    },
    onError: (error: unknown) => {
      toast({
        title: 'Oh no! Algo está mal',
        description: (error as Error).message,
        variant: 'destructive',
      });
    },
  });

  const isPending = mutation.status === 'pending';

  return (
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
        <AlertDialogDescription>
          Esta acción no se puede deshacer. Esto eliminará permanentemente el
          manager seleccionado.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancelar</AlertDialogCancel>
        <AlertDialogAction
          onClick={() => mutation.mutate()}
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
