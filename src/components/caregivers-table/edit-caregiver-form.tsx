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
import { updateCaregiver } from '@/services/caregiverService';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getSession } from 'next-auth/react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const editFormSchema = z.object({
  document: z.string().min(10, 'Número de identificación inválido.'),
  name: z.string().min(1, 'El nombre es requerido'),
  lastName: z.string().min(1, 'El apellido es requerido'),
  gender: z.enum(['male', 'female']),
  cellphoneNumbers: z.string().min(10, 'Número de celular inválido.'),
  conventionalNumbers: z.string().optional(),
  canton: z.string().min(1, 'El cantón es requerido'),
  parish: z.string().min(1, 'La parroquia es requerida'),
  zoneType: z.string().min(1, 'La zona es requerida'),
  address: z.string().min(1, 'La dirección es requerida'),
  reference: z.string().optional(),
  patientRelationship: z.string().min(1, 'La relación con el paciente es requerida'),
});

type EditCaregiverFormProps = {
  onClose: () => void;
  id: string;
  defaultValues: z.infer<typeof editFormSchema>;
};

export default function EditCaregiverForm({
  onClose,
  id,
  defaultValues,
}: EditCaregiverFormProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof editFormSchema>>({
    resolver: zodResolver(editFormSchema),
    defaultValues: {
      ...defaultValues,
      cellphoneNumbers: defaultValues.cellphoneNumbers[0],
      conventionalNumbers: defaultValues.conventionalNumbers?.[0],
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (values: z.infer<typeof editFormSchema>) => {
      const session = await getSession();
      const token = session?.user.access_token;

      const payload = {
        ...values,
        gender: values.gender, // No convertir a mayúsculas
        cellphoneNumbers: [values.cellphoneNumbers],
        conventionalNumbers: values.conventionalNumbers ? [values.conventionalNumbers] : [],
      };
      
      

      return await updateCaregiver(payload, id, token as string);
    },
    onSuccess: () => {
      toast({
        title: 'Actualización Exitosa',
        description: 'Cuidador actualizado exitosamente.',
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

  function onSubmit(values: z.infer<typeof editFormSchema>) {
    mutate(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='flex w-full flex-col gap-6'>
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
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Seleccionar Género' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value='male'>Hombre</SelectItem>
                    <SelectItem value='female'>Mujer</SelectItem>
                  </SelectContent>
                </Select>
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

        <Button type='submit' disabled={isPending}>
          {isPending ? (
            <div className='flex items-center gap-2'>
              <Loader2 className='animate-spin' />
              Actualizando Cuidador
            </div>
          ) : (
            'Guardar Cambios'
          )}
        </Button>
      </form>
    </Form>
  );
} 