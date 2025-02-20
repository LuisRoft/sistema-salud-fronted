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
import { createAdmin } from '@/services/adminService';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getSession } from 'next-auth/react';
import { fetchCareers } from '@/services/careerService';

// Esquema de validación con todos los campos
const formSchema = z.object({
  document: z.string().min(10, { message: 'Número de identificación es requerido.' }),
  name: z.string().min(1, { message: 'Nombre es requerido.' }),
  lastName: z.string().min(1, { message: 'Apellido es requerido.' }),
  password: z.string().min(8, { message: 'La contraseña debe tener al menos 8 caracteres.' }),
  email: z.string().email({ message: 'Correo electrónico no válido.' }),
  career: z.string().min(1, { message: 'Debe seleccionar una carrera.' }),
});

export default function CreateAdminForm({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Obtener la lista de carreras desde el backend
  const { data: careers, isLoading, error } = useQuery({
    queryKey: ['careers'],
    queryFn: fetchCareers,
    staleTime: 1000 * 60 * 5, // Cache de 5 minutos
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      document: '',
      name: '',
      lastName: '',
      password: '',
      email: '',
      career: '',
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const session = await getSession();
      const token = session?.user.access_token;
      if (!token) throw new Error('Token no encontrado.');
      await createAdmin(values, token);
    },
    onSuccess: () => {
      toast({ title: 'Creación Exitosa', description: 'Administrador creado exitosamente.' });
      queryClient.invalidateQueries({ queryKey: ['admins'] });
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
            name="career"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Carrera</FormLabel>
                <FormControl>
                  <select {...field} className="w-full p-2 border rounded-md bg-white dark:bg-gray-900 dark:text-white">
                    <option value="">Seleccionar una carrera</option>
                    {isLoading ? <option disabled>Cargando...</option> : careers?.map((career) => (
                      <option key={career.id} value={career.id}>{career.careerName}</option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full" disabled={mutation.isPending}>
          {mutation.isPending ? 'Creando Administrador...' : 'Crear Administrador'}
        </Button>
      </form>
    </Form>
  );
}
