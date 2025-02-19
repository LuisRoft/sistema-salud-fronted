'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getSession } from 'next-auth/react';

// Esquema de validación
const editFormSchema = z.object({
  requesterName: z.string().min(1, { message: 'El nombre del solicitante es requerido.' }),
  labName: z.string().min(1, { message: 'El laboratorio es requerido.' }),
  status: z.enum(['pending', 'approved', 'rejected'], { message: 'Estado inválido.' }),
});

type EditLabRequestFormProps = {
  onClose: () => void;
  id: string;
  defaultValues: z.infer<typeof editFormSchema>;
};

export default function EditLabRequestForm({ onClose, id, defaultValues }: EditLabRequestFormProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof editFormSchema>>({
    resolver: zodResolver(editFormSchema),
    defaultValues,
    mode: 'onChange',
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (values: z.infer<typeof editFormSchema>) => {
      const session = await getSession();
      const token = session?.user.access_token;
      return await updateLabRequest(values, id, token as string);
    },
    onSuccess: () => {
      toast({
        title: 'Actualización Exitosa',
        description: 'Solicitud de laboratorio actualizada exitosamente.',
      });
      queryClient.invalidateQueries({ queryKey: ['lab-requests'] });
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

  const onSubmit = (values: z.infer<typeof editFormSchema>) => {
    mutate(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex w-full flex-col">
        <div className="grid w-full grid-cols-2 gap-x-10 gap-y-6">
          <FormField
            control={form.control}
            name="requesterName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#575756]">Nombre del Solicitante</FormLabel>
                <FormControl>
                  <Input placeholder="Juan Pérez" {...field} className="h-10 text-[#575756]" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="labName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#575756]">Laboratorio</FormLabel>
                <FormControl>
                  <Input placeholder="Laboratorio de Física" {...field} className="h-10 text-[#575756]" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#575756]">Estado</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pendiente</SelectItem>
                      <SelectItem value="approved">Aprobado</SelectItem>
                      <SelectItem value="rejected">Rechazado</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="mt-4 justify-center font-bold" disabled={isPending}>
          {isPending ? (
            <div className="flex items-center justify-center gap-2">
              <span>Actualizando Solicitud</span>
              <Loader2 className="animate-spin" size={16} strokeWidth={2} />
            </div>
          ) : (
            'Guardar Cambios'
          )}
        </Button>
      </form>
    </Form>
  );
}
function updateLabRequest(values: { requesterName: string; labName: string; status: "pending" | "approved" | "rejected"; }, id: string, arg2: string): any {
    throw new Error('Function not implemented.');
}

