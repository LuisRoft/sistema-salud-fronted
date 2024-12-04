'use client';

import { useState } from 'react';
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

import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createUser, updateUser } from '@/services/userService';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getSession } from 'next-auth/react';

const formSchema = z.object({
  id: z.number().optional(),
  document: z.string().min(10, {
    message: 'Numero de identificacion es requerido.',
  }),
  name: z.string().min(1, {
    message: 'Nombre es requerido.',
  }),
  lastName: z.string().min(1, {
    message: 'Apellido es requerido.',
  }),
  password: z.string().min(8, {
    message: 'Contraseña no debe ser menor a 8 caracteres.',
  }),
  direction: z.string().min(1, {
    message: 'Direccion es requerida.',
  }),
  email: z.string().email({
    message: 'Correo electronico no valido.',
  }),
  role: z.string().min(1, {
    message: 'Rol es requerido.',
  }),
});

export default function CreateUserForm({
  onClose,
  defaultValues,
  isEditMode,
}: {
  onClose: () => void;
  defaultValues?: z.infer<typeof formSchema>;
  isEditMode?: boolean;
}) {
  const [isVisible, setIsVisible] = useState<boolean>(false);

  const queryClient = useQueryClient();

  const toggleVisibility = () => setIsVisible((prevState) => !prevState);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ...defaultValues,
      role: 'admin',
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      if (isEditMode) {
        const session = await getSession();
        const token = session?.user.access_token;
        if (defaultValues?.id !== undefined) {
          await updateUser(
            { ...values, status: true },
            defaultValues.id.toString(),
            token as string
          );
        }
      } else {
        await createUser({ ...values, status: true });
      }
    },
    onSuccess: () => {
      toast({
        title: isEditMode ? 'Actualización Exitosa' : 'Creación Exitosa',
        description: `Usuario ${isEditMode ? 'actualizado' : 'creado'} exitosamente.`,
      });
      queryClient.invalidateQueries({ queryKey: ['users'] });
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

  function onSubmit(values: z.infer<typeof formSchema>) {
    mutation.mutate(values);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='grid w-full grid-cols-2 gap-x-10 gap-y-6'
      >
        <FormField
          control={form.control}
          name='document'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='text-[#575756]'>
                Número de Identificación
              </FormLabel>
              <FormControl>
                <Input
                  placeholder='1312172818'
                  {...field}
                  className='h-10 text-[#575756]'
                />
              </FormControl>
              <FormDescription>
                Este es su número de identificación.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='text-[#575756]'>Nombre</FormLabel>
              <FormControl>
                <Input
                  placeholder='John'
                  {...field}
                  className='h-10 text-[#575756]'
                />
              </FormControl>
              <FormDescription>Este es su nombre.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='lastName'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='text-[#575756]'>Apellido</FormLabel>
              <FormControl>
                <Input
                  placeholder='Doe'
                  {...field}
                  className='h-10 text-[#575756]'
                />
              </FormControl>
              <FormDescription>Este es su apellido.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='text-[#575756]'>
                Correo Electrónico
              </FormLabel>
              <FormControl>
                <Input
                  id='email'
                  {...field}
                  placeholder='test@pucesm.edu.ec'
                  className='h-10 text-[#575756]'
                />
              </FormControl>
              <FormDescription>Este es su correo electrónico.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='direction'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='text-[#575756]'>Dirección</FormLabel>
              <FormControl>
                <Input
                  placeholder='Calle 123 # 45-67'
                  {...field}
                  className='h-10 text-[#575756]'
                />
              </FormControl>
              <FormDescription>Esta es su dirección.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='text-[#575756]'>Contraseña</FormLabel>
              <FormControl>
                <div className='relative'>
                  <Input
                    id='password'
                    className='h-10 pe-9 text-[#575756]'
                    placeholder='********'
                    type={isVisible ? 'text' : 'password'}
                    {...field}
                  />
                  <button
                    className='absolute inset-y-px end-px flex h-full w-9 items-center justify-center rounded-e-lg text-muted-foreground/80 ring-offset-background transition-shadow hover:text-foreground focus-visible:border focus-visible:border-ring focus-visible:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50'
                    type='button'
                    onClick={toggleVisibility}
                    aria-label={isVisible ? 'Hide password' : 'Show password'}
                    aria-pressed={isVisible}
                    aria-controls='password'
                  >
                    {isVisible ? (
                      <EyeOff size={16} strokeWidth={2} aria-hidden='true' />
                    ) : (
                      <Eye size={16} strokeWidth={2} aria-hidden='true' />
                    )}
                  </button>
                </div>
              </FormControl>
              <FormDescription>
                Esta es su contraseña de acceso.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type='submit'
          className='mt-4 justify-center bg-[#164284] font-bold hover:bg-[#164284] hover:bg-opacity-85'
          disabled={mutation.isPending}
        >
          {mutation.isPending ? (
            <div className='flex items-center justify-center gap-2'>
              <span>
                {isEditMode ? 'Actualizando Usuario' : 'Creando Usuario'}
              </span>
              <Loader2 className='animate-spin' size={16} strokeWidth={2} />
            </div>
          ) : isEditMode ? (
            'Guardar Cambios'
          ) : (
            'Crear Usuario'
          )}
        </Button>
      </form>
    </Form>
  );
}
