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
import { createCaregiver } from '@/services/caregiverService';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getSession } from 'next-auth/react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const formSchema = z.object({
  document: z.string().min(10, 'Número de identificación inválido.'),
  name: z.string().min(1, 'Nombre es requerido.'),
  lastName: z.string().min(1, 'Apellido es requerido.'),
  gender: z.enum(['male', 'female']).refine((val) => val !== undefined, {
    message: 'Género es requerido.',
  }),
  cellphoneNumbers: z
    .string()
    .min(10, 'Debe ingresar un número de celular válido.'),
  conventionalNumbers: z
    .string()
    .min(7, 'Debe ingresar un número convencional válido.')
    .optional(),
  canton: z.string().min(1, 'Cantón es requerido.'),
  parish: z.string().min(1, 'Parroquia es requerida.'),
  zoneType: z.string().min(1, 'Zona es requerida.'),
  address: z.string().min(1, 'Dirección es requerida.'),
  reference: z.string().optional(),
  patientRelationship: z
    .string()
    .min(1, 'Relación con el paciente es requerida.'),
});

export default function CreateCaregiversForm({
  onClose,
}: {
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      document: '',
      name: '',
      lastName: '',
      gender: undefined,
      conventionalNumbers: '',
      cellphoneNumbers: '',
      canton: '',
      parish: '',
      zoneType: '',
      address: '',
      reference: '',
      patientRelationship: '',
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const session = await getSession();
      const token = session?.user.access_token;

      const payload = {
        ...values,
        cellphoneNumbers: [values.cellphoneNumbers], // Envolvemos en un array
        conventionalNumbers: values.conventionalNumbers
          ? [values.conventionalNumbers] // Envolvemos si está presente
          : [],
      };

      await createCaregiver(payload, token as string);
    },
    onSuccess: () => {
      toast({
        title: 'Creación Exitosa',
        description: 'El cuidador ha sido creado exitosamente.',
      });
      queryClient.invalidateQueries({ queryKey: ['caregivers'] });
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
    console.log(values);
    mutation.mutate(values);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='flex w-full flex-col gap-6'
      >
        <div className='grid w-full grid-cols-2 gap-x-10 gap-y-6'>
          <FormField
            control={form.control}
            name='document'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número de Identificación</FormLabel>
                <FormControl>
                  <Input {...field} placeholder='1312172818' />
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
                  <Input {...field} placeholder='John' />
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
                  <Input {...field} placeholder='Doe' />
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
            name='canton'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cantón</FormLabel>
                <FormControl>
                  <Input {...field} placeholder='Cuenca' />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='parish'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Parroquia</FormLabel>
                <FormControl>
                  <Input {...field} placeholder='San Sebastián' />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='zoneType'
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
            name='address'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dirección</FormLabel>
                <FormControl>
                  <Input {...field} placeholder='Av. 12 de Abril' />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='reference'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Referencia</FormLabel>
                <FormControl>
                  <Input {...field} placeholder='Frente al parque' />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='patientRelationship'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Relación con el Paciente</FormLabel>
                <FormControl>
                  <Input {...field} placeholder='Padre' />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='cellphoneNumbers'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número de Teléfono Celular</FormLabel>
                <FormControl>
                  <Input {...field} placeholder='0987654321' />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='conventionalNumbers'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número de Teléfono Convencional</FormLabel>
                <FormControl>
                  <Input {...field} placeholder='072123456' />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type='submit' disabled={mutation.isPending}>
          {mutation.isPending ? (
            <div className='flex items-center gap-2'>
              <Loader2 className='animate-spin' />
              Creando Cuidador
            </div>
          ) : (
            'Crear Cuidador'
          )}
        </Button>
      </form>
    </Form>
  );
}
