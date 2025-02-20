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
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { updateAdmin } from '@/services/adminService';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getSession } from 'next-auth/react';
import { fetchCareers } from '@/services/careerService';

// 🔹 Esquema de validación con `career` como string (ID)
const editFormSchema = z.object({
  document: z.string().min(10, { message: 'Número de identificación es requerido.' }),
  name: z.string().min(1, { message: 'Nombre es requerido.' }),
  lastName: z.string().min(1, { message: 'Apellido es requerido.' }),
  email: z.string().email({ message: 'Correo electrónico no válido.' }),
  career: z.string().min(1, { message: 'Debe seleccionar una carrera.' }),
});

type EditAdminFormProps = {
  onClose: () => void;
  id: string;
  defaultValues: z.infer<typeof editFormSchema>;
};

export default function EditAdminForm({ onClose, id, defaultValues }: EditAdminFormProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Obtener la lista de carreras desde el backend
  const { data: careers, isLoading, error } = useQuery({
    queryKey: ['careers'],
    queryFn: fetchCareers,
    staleTime: 1000 * 60 * 5, // Cache de 5 minutos
  });

  const form = useForm<z.infer<typeof editFormSchema>>({
    resolver: zodResolver(editFormSchema),
    defaultValues: {
      ...defaultValues,
      career: typeof defaultValues.career === 'object' ? defaultValues.career.id : '',
    },
    mode: 'onChange',
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (values: z.infer<typeof editFormSchema>) => {
      const session = await getSession();
      const token = session?.user.access_token;
      return await updateAdmin(
        {
          ...values,
          career: values.career, // Enviamos solo el ID de la carrera
        },
        id,
        token as string
      );
    },
    onSuccess: () => {
      toast({
        title: 'Actualización Exitosa',
        description: 'Administrador actualizado exitosamente.',
      });
      queryClient.invalidateQueries({ queryKey: ['admins'] });
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
            name="document"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#575756]">Número de Identificación</FormLabel>
                <FormControl>
                  <Input placeholder="1312172818" {...field} className="h-10 text-[#575756]" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#575756]">Nombre</FormLabel>
                <FormControl>
                  <Input placeholder="John" {...field} className="h-10 text-[#575756]" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#575756]">Apellido</FormLabel>
                <FormControl>
                  <Input placeholder="Doe" {...field} className="h-10 text-[#575756]" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#575756]">Correo Electrónico</FormLabel>
                <FormControl>
                  <Input id="email" {...field} placeholder="test@pucesm.edu.ec" className="h-10 text-[#575756]" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="career"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#575756]">Carrera</FormLabel>
                <FormControl>
                  <select {...field} className="w-full p-2 border rounded-md bg-white dark:bg-gray-900 dark:text-white">
                    <option value="">Seleccionar una carrera</option>
                    {isLoading ? (
                      <option disabled>Cargando...</option>
                    ) : error ? (
                      <option disabled>Error al cargar carreras</option>
                    ) : (
                      careers?.map((career: { id: string; careerName: string }) => (
                        <option key={career.id} value={career.id}>
                          {career.careerName}
                        </option>
                      ))
                    )}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="mt-4 justify-center font-bold" disabled={isPending}>
          {isPending ? (
            <div className="flex items-center justify-center gap-2">
              <span>Actualizando Administrador</span>
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
