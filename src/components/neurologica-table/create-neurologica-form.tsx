'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { getSession } from 'next-auth/react';
import { createNeurologica } from '@/services/neurologicaService';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

const schema = z.object({
  name: z.string().min(1, 'Nombre requerido'),
  ci: z.string().min(1, 'Cédula requerida'),
  edad: z.coerce.number().min(0, 'Edad inválida'),
  diagnostico: z.string().min(1, 'Campo requerido'),
  discapacidad: z.string().min(1, 'Campo requerido'),
  antecedentesHeredofamiliares: z.string().optional(),
  antecedentesFarmacologicos: z.string().optional(),
  historiaNutricional: z.string().optional(),
  alergias: z.string().optional(),
  habitosToxicos: z.string().optional(),
  quirurgico: z.string().optional(),
  comunicacion: z.string().optional(),
  dolor: z.string().optional(),
  utilizaSillaRuedas: z.boolean().default(false),
});

type FormValues = z.infer<typeof schema>;

export default function CreateNeurologicaForm({ onClose }: { onClose: () => void }) {
  const form = useForm<FormValues>({ resolver: zodResolver(schema) });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: async (values: FormValues) => {
      const session = await getSession();
      const token = session?.user.access_token;
      if (!token) throw new Error('Token no disponible');
      return await createNeurologica(values, token);
    },
    onSuccess: () => {
      toast({ title: 'Éxito', description: 'Evaluación registrada correctamente' });
      queryClient.invalidateQueries({ queryKey: ['neurologicas'] });
      onClose();
    },
    onError: (error: unknown) => {
      toast({ title: 'Error', description: (error as Error).message, variant: 'destructive' });
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => mutate(data))} className='space-y-6'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <h4 className='font-semibold text-lg col-span-full'>Datos Personales</h4>

          <FormField name='name' control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField name='ci' control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Cédula</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField name='edad' control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Edad</FormLabel>
              <FormControl><Input type='number' {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField name='discapacidad' control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Discapacidad</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField name='diagnostico' control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Diagnóstico Médico</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <div>
          <h4 className='font-semibold text-lg mb-2'>Antecedentes</h4>
          <FormField name='antecedentesHeredofamiliares' control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Antecedentes Heredofamiliares</FormLabel>
              <FormControl>
                <Textarea className='min-h-[100px]' {...field} />
              </FormControl>
            </FormItem>
          )} />
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <FormField name='antecedentesFarmacologicos' control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Antecedentes Farmacológicos</FormLabel>
              <FormControl><Input {...field} /></FormControl>
            </FormItem>
          )} />

          <FormField name='historiaNutricional' control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Historia Nutricional</FormLabel>
              <FormControl><Input {...field} /></FormControl>
            </FormItem>
          )} />

          <FormField name='alergias' control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Alergias</FormLabel>
              <FormControl><Input {...field} /></FormControl>
            </FormItem>
          )} />

          <FormField name='habitosToxicos' control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Hábitos Tóxicos</FormLabel>
              <FormControl><Input {...field} /></FormControl>
            </FormItem>
          )} />

          <FormField name='quirurgico' control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Quirúrgico</FormLabel>
              <FormControl><Input {...field} /></FormControl>
            </FormItem>
          )} />

          <FormField name='comunicacion' control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Comunicación</FormLabel>
              <FormControl><Input {...field} /></FormControl>
            </FormItem>
          )} />

          <FormField name='dolor' control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Dolor</FormLabel>
              <FormControl><Input {...field} /></FormControl>
            </FormItem>
          )} />

          <FormField name='utilizaSillaRuedas' control={form.control} render={({ field }) => (
            <FormItem className='flex items-center space-x-2'>
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <FormLabel className='mb-0'>Utiliza silla de ruedas</FormLabel>
            </FormItem>
          )} />
        </div>

        <Button type='submit' disabled={isPending}>Guardar</Button>
      </form>
    </Form>
  );
}
