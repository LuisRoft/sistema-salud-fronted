'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useState } from 'react';

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { useToast } from '@/hooks/use-toast';
import { createUser } from '@/services/patientService';
import { getCaregivers } from '@/services/caregiverService';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getSession } from 'next-auth/react';
import { Loader2Icon } from 'lucide-react';

// Esquema de validación
const formSchema = z.object({
  document: z.string().min(10, 'Número de identificación inválido.'),
  name: z.string().min(1, 'Nombre es requerido.'),
  lastName: z.string().min(1, 'Apellido es requerido.'),
  gender: z.enum(['male', 'female'], {
    errorMap: () => ({ message: 'Género es requerido.' }),
  }),
  birthday: z.string().min(1, 'Fecha de nacimiento es requerida.'),
  typeBeneficiary: z.string().min(1, 'Tipo de beneficiario es requerido.'),
  typeDisability: z.string().min(1, 'Tipo de discapacidad es requerido.'),
  percentageDisability: z
    .number()
    .min(0)
    .max(100, 'Porcentaje debe estar entre 0 y 100.'),
  zone: z.string().min(1, 'Zona es requerida.'),
  caregiverId: z.string().min(1, 'Debe seleccionar un cuidador.'),
});

type FormSchema = z.infer<typeof formSchema>;

export default function CreateUserForm({ onClose }: { onClose: () => void }) {
  const { toast } = useToast();
  const [caregivers, setCaregivers] = useState<
    { id: string; name: string; lastName: string }[]
  >([]);

  // Inicialización del formulario
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      document: '',
      name: '',
      lastName: '',
      gender: undefined,
      birthday: '',
      typeBeneficiary: '',
      typeDisability: '',
      percentageDisability: 0,
      zone: '',
      caregiverId: '',
    },
  });
  const queryClient = useQueryClient();

  // Obtener caregivers
  useQuery({
    queryKey: ['caregivers'],
    queryFn: async () => {
      const session = await getSession();
      const token = session?.user.access_token;
      if (token) {
        const res = await getCaregivers(token, 20, 1); // Ajustar los parámetros de paginación según sea necesario
        setCaregivers(res.caregivers || []);
        return res.caregivers || [];
      }
    },
  });

  // Mutación para crear el usuario
  const mutation = useMutation({
    mutationFn: async (values: FormSchema) => {
      const session = await getSession();
      const token = session?.user.access_token;
      await createUser(
        {
          ...values,
          birthday: new Date(values.birthday).toISOString().split('T')[0],
          isActive: true,
        },
        token as string
      );
    },
    onSuccess: () => {
      toast({
        title: 'Usuario Creado',
        description: 'El usuario fue creado exitosamente.',
      });
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      onClose();
    },
    onError: (error: unknown) => {
      toast({
        title: 'Error',
        description: (error as Error).message,
        variant: 'destructive',
      });
    },
  });

  function onSubmit(values: FormSchema) {
    mutation.mutate(values);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='flex flex-col gap-6'
      >
        <div className='grid w-full grid-cols-2 gap-x-5 gap-y-4'>
          <FormField
            control={form.control}
            name='document'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número de Identificación</FormLabel>
                <FormControl>
                  <Input {...field} placeholder='1234567890' />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='name'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre</FormLabel>
                <FormControl>
                  <Input {...field} placeholder='Juan' />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='lastName'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Apellido</FormLabel>
                <FormControl>
                  <Input {...field} placeholder='Pérez' />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='gender'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Género</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Seleccionar Género' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='male'>Hombre</SelectItem>
                      <SelectItem value='female'>Mujer</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='birthday'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha de Nacimiento</FormLabel>
                <FormControl>
                  <Input {...field} type='date' />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='typeBeneficiary'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Beneficiario</FormLabel>
                <FormControl>
                  <Input {...field} placeholder='Ejemplo: Directo' />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='typeDisability'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Discapacidad</FormLabel>
                <FormControl>
                  <Input {...field} placeholder='Física, Auditiva, etc.' />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='percentageDisability'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Porcentaje de Discapacidad</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type='number'
                    placeholder='50'
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(
                        value === '' ? undefined : parseFloat(value)
                      );
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='zone'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Zona</FormLabel>
                <FormControl>
                  <Input {...field} placeholder='Urbana' />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='caregiverId'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cuidador</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Seleccionar Cuidador' />
                    </SelectTrigger>
                    <SelectContent>
                      {caregivers.map((caregiver) => (
                        <SelectItem key={caregiver.id} value={caregiver.id}>
                          {`${caregiver.name} ${caregiver.lastName}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type='submit' disabled={mutation.isPending}>
          {mutation.isPending ? (
            <div className='flex items-center gap-2'>
              <Loader2Icon className='animate-spin' />
              Creando Usuario
            </div>
          ) : (
            'Crear Usuario'
          )}
        </Button>
      </form>
    </Form>
  );
}
