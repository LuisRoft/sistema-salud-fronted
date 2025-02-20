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
import { getSession } from 'next-auth/react';
import { LabRequestRow } from './columns';

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
  prioridad: z.string().min(1, { message: 'La prioridad es requerida.' }),
});

type EditLabRequestFormProps = {
  onClose: () => void;
  id: string;
  defaultValues: LabRequestRow; // ✅ Ahora `defaultValues` incluye `id`
};

// ✅ Función para actualizar la solicitud
async function updateLabRequest(
  values: z.infer<typeof editFormSchema>,
  id: string,
  token: string
): Promise<void> {
  console.log('Actualizando solicitud:', values, id, token);
  // Aquí iría la lógica para llamar al backend
}

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
                      <SelectItem value='Alta'>Alta</SelectItem>
                      <SelectItem value='Media'>Media</SelectItem>
                      <SelectItem value='Baja'>Baja</SelectItem>
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
