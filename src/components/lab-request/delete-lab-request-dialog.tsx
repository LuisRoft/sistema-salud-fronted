'use client';

import { getSession } from 'next-auth/react';
import { deleteLaboratoryRequest } from '@/services/labRequestService';

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

export default function DeleteLabRequestDialog({ 
  id, 
  open, 
  onClose 
}: { 
  id: string; 
  open: boolean; 
  onClose: () => void; 
}) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      // Simular la eliminación
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('🗑️ Eliminando solicitud con ID:', id);
      
      // Obtener la función de eliminación del query client
      const actions = queryClient.getQueryData(['lab-management-actions']) as any;
      if (actions?.deleteRequest) {
        actions.deleteRequest(id);
      }
      
      return { message: 'Solicitud eliminada exitosamente' };

      /* 
      // CÓDIGO REAL - Descomenta cuando tengas conexión al backend
      const session = await getSession();
      const token = session?.user.access_token;
      
      if (!token) {
        throw new Error('No se encontró el token de sesión');
      }
      
      return await deleteLaboratoryRequest(id, token);
      */
    },
    onSuccess: () => {
      toast({
        title: 'Eliminación Exitosa',
        description: 'Solicitud de laboratorio eliminada exitosamente.',
      });
      queryClient.invalidateQueries({ queryKey: ['lab-requests'] });
      queryClient.invalidateQueries({ queryKey: ['lab-requests-management'] });
      onClose();
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
        <AlertDialogCancel onClick={onClose}>Cancelar</AlertDialogCancel>
        <AlertDialogAction
          onClick={() => mutate()}
          className="gap-2 bg-red-600 hover:bg-red-700"
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

