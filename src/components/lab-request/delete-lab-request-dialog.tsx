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
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function DeleteLabRequestDialog({ id }: { id: string }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const session = await getSession();
      const token = session?.user.access_token;
      return await deleteLabRequest(id, token as string);
    },
    onSuccess: () => {
      toast({
        title: 'Eliminación Exitosa',
        description: 'Solicitud de laboratorio eliminada exitosamente.',
      });
      queryClient.invalidateQueries({ queryKey: ['lab-requests'] });
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
          Esta acción no se puede deshacer. Esto eliminará permanentemente la solicitud de laboratorio seleccionada.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancelar</AlertDialogCancel>
        <AlertDialogAction
          onClick={() => mutate()}
          className="gap-2"
          disabled={isPending}
        >
          {isPending ? (
            <>
              <span>Eliminando</span>
              <Loader2 className="animate-spin" size={16} />
            </>
          ) : (
            'Eliminar'
          )}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  );
}
function deleteLabRequest(id: string, arg1: string): any {
    throw new Error('Function not implemented.');
}

