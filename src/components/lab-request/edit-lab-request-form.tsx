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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateLaboratoryRequest } from '@/services/labRequestService';
import { getSession } from 'next-auth/react';
import { LabRequestRow } from './columns';
import { LabRequestManagementRow } from './management-columns';

// ✅ Esquema de validación
const editFormSchema = z.object({
  id: z.string(), // ✅ Ahora `id` es parte del esquema
  numero_de_archivo: z
    .string()
    .min(1, { message: 'El número de archivo es requerido.' }),
  diagnostico_descripcion1: z
    .string()
    .min(1, { message: 'El diagnóstico 1 es requerido.' }),
  diagnostico_cie1: z.string().min(1, { message: 'El CIE 1 es requerido.' }),
  diagnostico_descripcion2: z
    .string()
    .min(1, { message: 'El diagnóstico 2 es requerido.' }),
  diagnostico_cie2: z.string().min(1, { message: 'El CIE 2 es requerido.' }),
  fecha: z.string().min(1, { message: 'La fecha es requerida.' }),
  prioridad: z.string().min(1, { message: 'La prioridad es requerida.' }),
});

type EditLabRequestFormProps = {
  onClose: () => void;
  id: string;
  defaultValues: LabRequestRow | LabRequestManagementRow; // ✅ Ahora `defaultValues` incluye `id`
};

// ✅ Función para actualizar la solicitud

export default function EditLabRequestForm({
  onClose,
  id,
  defaultValues,
}: EditLabRequestFormProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof editFormSchema>>({
    resolver: zodResolver(editFormSchema),
    defaultValues,
    mode: 'onChange',
  });

  // ✅ Mutación para actualizar la solicitud
  const { mutate, isPending } = useMutation({
    mutationFn: async (values: z.infer<typeof editFormSchema>) => {
      // Simular la actualización
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('🔄 Actualizando solicitud:', values);
      console.log('📝 ID de solicitud:', id);
      
      // Obtener la función de actualización del query client
      const actions = queryClient.getQueryData(['lab-management-actions']) as any;
      if (actions?.updateRequest) {
        actions.updateRequest(id, {
          numero_de_archivo: values.numero_de_archivo,
          diagnostico_descripcion1: values.diagnostico_descripcion1,
          diagnostico_cie1: values.diagnostico_cie1,
          diagnostico_descripcion2: values.diagnostico_descripcion2,
          diagnostico_cie2: values.diagnostico_cie2,
          fecha: values.fecha,
          prioridad: values.prioridad,
        });
      }
      
      return { message: 'Solicitud actualizada exitosamente' };

      /* 
      // CÓDIGO REAL - Descomenta cuando tengas conexión al backend
      const session = await getSession();
      const token = session?.user.access_token;
      
      if (!token) {
        throw new Error('No se encontró el token de sesión');
      }

      const updateData = {
        numero_de_archivo: values.numero_de_archivo,
        diagnostico_descripcion1: values.diagnostico_descripcion1,
        diagnostico_cie1: values.diagnostico_cie1,
        diagnostico_descripcion2: values.diagnostico_descripcion2,
        diagnostico_cie2: values.diagnostico_cie2,
        fecha: values.fecha,
        prioridad: values.prioridad,
        // Mantener los arrays de exámenes existentes
        hematologia_examenes: defaultValues.hematologia_examenes || [],
        coagulacion_examenes: defaultValues.coagulacion_examenes || [],
        quimica_sanguinea_examenes: defaultValues.quimica_sanguinea_examenes || [],
        orina_examenes: defaultValues.orina_examenes || [],
        heces_examenes: defaultValues.heces_examenes || [],
        hormonas_examenes: defaultValues.hormonas_examenes || [],
        serologia_examenes: defaultValues.serologia_examenes || [],
      };

      return await updateLaboratoryRequest(id, updateData, token);
      */
    },
    onSuccess: () => {
      toast({
        title: 'Actualización Exitosa',
        description: 'Solicitud de laboratorio actualizada exitosamente.',
      });
      queryClient.invalidateQueries({ queryKey: ['lab-requests'] });
      queryClient.invalidateQueries({ queryKey: ['lab-requests-management'] });
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
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='flex w-full flex-col'
      >
        <div className='grid w-full grid-cols-2 gap-x-10 gap-y-6'>
          <FormField
            control={form.control}
            name='numero_de_archivo'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-[#575756]'>N° Archivo</FormLabel>
                <FormControl>
                  <Input
                    placeholder='228001'
                    {...field}
                    className='h-10 text-[#575756]'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='diagnostico_descripcion1'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-[#575756]'>Diagnóstico 1</FormLabel>
                <FormControl>
                  <Input
                    placeholder='Anemia'
                    {...field}
                    className='h-10 text-[#575756]'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='diagnostico_cie1'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-[#575756]'>CIE 1</FormLabel>
                <FormControl>
                  <Input
                    placeholder='D50.9'
                    {...field}
                    className='h-10 text-[#575756]'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='diagnostico_descripcion2'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-[#575756]'>Diagnóstico 2</FormLabel>
                <FormControl>
                  <Input
                    placeholder='Descripción del diagnóstico 2'
                    {...field}
                    className='h-10 text-[#575756]'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='diagnostico_cie2'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-[#575756]'>CIE 2</FormLabel>
                <FormControl>
                  <Input
                    placeholder='CIE 2'
                    {...field}
                    className='h-10 text-[#575756]'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='fecha'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-[#575756]'>Fecha</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    {...field}
                    className='h-10 text-[#575756]'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='prioridad'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-[#575756]'>Prioridad</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Seleccionar prioridad' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='URGENTE'>Urgente</SelectItem>
                      <SelectItem value='RUTINA'>Rutina</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button
          type='submit'
          className='mt-4 justify-center font-bold'
          disabled={isPending}
        >
          {isPending ? (
            <div className='flex items-center justify-center gap-2'>
              <span>Actualizando Solicitud</span>
              <Loader2 className='animate-spin' size={16} strokeWidth={2} />
            </div>
          ) : (
            'Guardar Cambios'
          )}
        </Button>
      </form>
    </Form>
  );
}
