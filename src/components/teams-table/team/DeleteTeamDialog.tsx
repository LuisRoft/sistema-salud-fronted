

'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteTeam } from "@/services/teamsService"; // Asegúrate de tener esta función en tu servicio de equipos.
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { getSession } from "next-auth/react";

interface DeleteTeamDialogProps {
    teamId: string;
    setOpenDeleteDialog: (open: boolean) => void;
}

export default function DeleteTeamDialog({ teamId, setOpenDeleteDialog }: DeleteTeamDialogProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async () => {
      if (!teamId) throw new Error("No hay equipo seleccionado");
        
      const session = await getSession();
      const token = session?.user.access_token;
      await deleteTeam(teamId, token as string);
    },
    onSuccess: () => {
      toast({
        title: "Equipo eliminado",
        description: "El equipo ha sido eliminado exitosamente.",
      });

      // ✅ Invalida la caché de equipos en lugar de grupos
      queryClient.invalidateQueries({ queryKey: ["teams"] });
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
    <Dialog open={true} onOpenChange={setOpenDeleteDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Eliminar Equipo</DialogTitle>
          <DialogDescription>
            ¿Estás seguro de que deseas eliminar este equipo? Esta acción no se puede deshacer.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setOpenDeleteDialog(false)}>
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
