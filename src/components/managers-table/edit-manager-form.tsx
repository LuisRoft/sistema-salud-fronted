import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { updateManager } from '@/services/managerService';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getSession } from 'next-auth/react';
import { useState } from 'react';
import { CareerDialog } from './carreer-dialog';
import { Career } from '@/types/career/get-careers';

export const schema = z.object({
  id: z.string(),
  document: z.string().min(10, 'Documento debe tener al menos 10 caracteres'),
  email: z.string().email('Correo no válido'),
  name: z.string().min(1, 'Nombre es obligatorio'),
  lastName: z.string().min(1, 'Apellido es obligatorio'),
  address: z.string().optional(),
  career: z.object({ id: z.string(), careerName: z.string() }).nullable(),
  password: z.string().optional(),
});

export function EditManagerForm({ manager, onClose }: { manager: z.infer<typeof schema>; onClose: () => void }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isCareerDialogOpen, setIsCareerDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: manager,
    mode: 'onChange',
  });

  const { mutate, status } = useMutation({
    mutationFn: async (values: z.infer<typeof schema>) => {
      const session = await getSession();
      const token = session?.user.access_token;
      if (!token) throw new Error('Token no disponible.');

      const { id, ...rest } = values;
      return await updateManager(id, { ...rest, career: rest.career?.id }, token);
    },
    onSuccess: () => {
      toast({
        title: 'Actualización Exitosa',
        description: 'Gestor actualizado exitosamente.',
      });
      queryClient.invalidateQueries({ queryKey: ['managers'] });
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

  const isPending = status === 'pending';

  const onSubmit = (values: z.infer<typeof schema>) => {
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
                  <Input
                    placeholder="1312172818"
                    {...field}
                    className="h-10 text-[#575756]"
                    disabled
                  />
                </FormControl>
                <FormDescription>Este es su número de identificación.</FormDescription>
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
                <FormDescription>Este es su nombre.</FormDescription>
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
                <FormDescription>Este es su apellido.</FormDescription>
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
                  <Input
                    id="email"
                    {...field}
                    placeholder="test@pucesm.edu.ec"
                    className="h-10 text-[#575756]"
                    disabled
                  />
                </FormControl>
                <FormDescription>Este es su correo electrónico.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#575756]">Dirección</FormLabel>
                <FormControl>
                  <Input placeholder="123 Main St" {...field} className="h-10 text-[#575756]" />
                </FormControl>
                <FormDescription>Este es su dirección.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="career"
            render={() => (
              <FormItem>
                <FormLabel className="text-[#575756]">Carrera</FormLabel>
                <FormControl>
                  <Button
                    type="button"
                    onClick={() => setIsCareerDialogOpen(true)}
                    className="w-full justify-center"
                  >
                    {form.getValues('career')?.careerName || 'Seleccionar Carrera'}
                  </Button>
                </FormControl>
                <FormDescription>Seleccione la carrera asociada.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={() => (
              <FormItem>
                <FormLabel className="text-[#575756]">Contraseña</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="********"
                    className="h-10 text-[#575756]"
                    disabled
                  />
                </FormControl>
                <FormDescription>Contactar ADMIN para cambio de contraseña.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="mt-4 justify-center font-bold" disabled={isPending}>
          {isPending ? (
            <div className="flex items-center justify-center gap-2">
              <span>Guardando Cambios</span>
              <Loader2 className="animate-spin" size={16} strokeWidth={2} />
            </div>
          ) : (
            'Guardar Cambios'
          )}
        </Button>

        <CareerDialog
          isOpen={isCareerDialogOpen}
          onClose={() => setIsCareerDialogOpen(false)}
          onSelect={(career: Career) => {
            form.setValue('career', {
              id: career.id,
              careerName: career.careerName,
            });
            setIsCareerDialogOpen(false);
          }}
        />
      </form>
    </Form>
  );
}