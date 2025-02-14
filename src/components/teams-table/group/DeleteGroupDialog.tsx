'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteGroup } from "@/services/groupsService"; // Asegúrate de tener esta función en tu servicio de grupos.
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { getSession } from "next-auth/react";

interface DeleteGroupDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  groupId: string | null;
  onDeleteSuccess?: () => void;
}

export default function DeleteGroupDialog({ isOpen, setIsOpen, groupId, onDeleteSuccess}: DeleteGroupDialogProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const mutation = useMutation({
    mutationFn: async () => {
      if (!groupId) throw new Error("No hay grupo seleccionado");
        
      const session = await getSession();
      const token = session?.user.access_token;
      await deleteGroup(groupId, token as string);    },
    onSuccess: () => {
      toast({
        title: "Grupo eliminado",
        description: "El grupo ha sido eliminado exitosamente.",
      });
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      setIsOpen(false);

        if (onDeleteSuccess) {
            onDeleteSuccess();
        }
    },
    onError: (error: unknown) => {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      });
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Eliminar Grupo</DialogTitle>
          <DialogDescription>
            ¿Estás seguro de que deseas eliminar este grupo? Esta acción no se puede deshacer.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setIsOpen(false)}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <Loader2 className="animate-spin" size={16} strokeWidth={2} />
            ) : (
              "Eliminar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
