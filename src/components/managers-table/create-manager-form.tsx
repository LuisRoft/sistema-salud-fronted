'use client';

import { useState } from 'react';
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
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createManager } from '@/services/managerService';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getSession } from 'next-auth/react';
import { CareerDialog } from './carreer-dialog';

const formSchema = z.object({
  document: z.string().min(10, { message: 'Número de identificación es requerido.' }),
  name: z.string().min(1, { message: 'Nombre es requerido.' }),
  lastName: z.string().min(1, { message: 'Apellido es requerido.' }),
  password: z.string().min(8, { message: 'La contraseña debe tener al menos 8 caracteres.' }),
  email: z.string().email({ message: 'Correo electrónico no válido.' }),
  address: z.string(),
  career: z
    .object({
      id: z.string(),
      careerName: z.string(),
    })
    .nullable()
    .optional(),
});

export default function CreateManagerForm({ onClose }: { onClose: () => void }) {
  const [isCareerDialogOpen, setIsCareerDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      career: null,
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const session = await getSession();
      const token = session?.user.access_token;
      if (!token) throw new Error('Token no encontrado.');
      await createManager(
        {
          ...values,
          career: values.career?.id || null, // Enviamos solo el ID de la carrera
        },
        token
      );
    },
    onSuccess: () => {
      toast({ title: 'Creación Exitosa', description: 'Gestor creado exitosamente.' });
      queryClient.invalidateQueries({ queryKey: ['managers'] });
      onClose();
    },
    onError: (error: unknown) => {
      toast({ title: 'Error', description: (error as Error).message, variant: 'destructive' });
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    mutation.mutate(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="document"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número de Identificación</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Ingrese el número de identificación" />
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
                <FormLabel>Nombre</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Ingrese el nombre" />
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
                <FormLabel>Apellido</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Ingrese el apellido" />
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
                <FormLabel>Correo Electrónico</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Ingrese el correo electrónico" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => {
              const [showPassword, setShowPassword] = useState(false);

              return (
                <FormItem>
                  <FormLabel>Contraseña</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        type={showPassword ? "text" : "password"}
                        placeholder="Ingrese la contraseña"
                      />
                      <Button
                        type="button"
                        className="absolute inset-y-0 right-0 px-3 bg-transparent hover:bg-gray-200"
                        onClick={() => setShowPassword((prev) => !prev)}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dirección</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Ingrese la dirección" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="career"
            render={() => (
              <FormItem>
                <FormLabel>Carrera</FormLabel>
                <FormControl>
                  <Button
                    type="button"
                    onClick={() => setIsCareerDialogOpen(true)}
                    className="w-full justify-center"
                  >
                    {form.getValues('career')?.careerName || 'Seleccionar Carrera'}
                  </Button>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full" disabled={mutation.isPending}>
          {mutation.isPending ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="animate-spin" size={16} strokeWidth={2} />
              <span>Creando Manager</span>
            </div>
          ) : (
            'Crear Gestor'
          )}
        </Button>

        <CareerDialog
          isOpen={isCareerDialogOpen}
          onClose={() => setIsCareerDialogOpen(false)}
          onSelect={(career) => {
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
