'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, Form } from '@/components/ui/form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { getSession } from 'next-auth/react';
import { createNeurologica } from '@/services/neurologicaService';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useState } from 'react';

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
  amnesis: z.string().optional(),
  inicioEvolucion: z.string().optional(),
  entornoFamiliar: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const barthelItems = [
  {
    key: 'vestirse',
    label: 'Vestirse',
    options: [
      { label: 'Independiente: capaz de ponerse y de quitarse la ropa, abotonarse, atarse los zapatos', value: 10 },
      { label: 'Necesita ayuda', value: 5 },
      { label: 'Dependiente', value: 0 },
    ],
  },
  {
    key: 'arreglarse',
    label: 'Arreglarse',
    options: [
      { label: 'Independiente para lavarse la cara, las manos, peinarse, afeitarse, maquillarse, etc.', value: 5 },
      { label: 'Dependiente', value: 0 },
    ],
  },
  {
    key: 'deposicion',
    label: 'Deposición',
    options: [
      { label: 'Continencia normal', value: 10 },
      { label: 'Ocasionalmente algún episodio de incontinencia, o necesita ayuda para administrar supositorios o lavativas', value: 5 },
      { label: 'Incontinente', value: 0 },
    ],
  },
  {
    key: 'miccion',
    label: 'Micción',
    options: [
      { label: 'Continencia normal, o es capaz de cuidarse de la sonda si tiene una puesta', value: 10 },
      { label: '1-2 episodios diarios como máximo de incontinencia, o necesita ayuda para cuidar de la sonda', value: 5 },
      { label: 'Incontinente', value: 0 },
    ],
  },
  {
    key: 'usoRetrete',
    label: 'Uso del retrete',
    options: [
      { label: 'Independiente para ir al cuarto de aseo, quitarse y ponerse la ropa', value: 10 },
      { label: 'Necesita ayuda física o supervisión para hacerlo, pero se limpia solo', value: 5 },
      { label: 'Dependiente', value: 0 },
    ],
  },
  {
    key: 'trasladarse',
    label: 'Trasladarse',
    options: [
      { label: 'Independiente para ir de la silla a la cama', value: 15 },
      { label: 'Mínima ayuda física o supervisión para hacerlo', value: 10 },
      { label: 'Necesita gran ayuda, pero puede mantenerse sentado solo', value: 5 },
      { label: 'Dependiente', value: 0 },
    ],
  },
  {
    key: 'deambular',
    label: 'Deambular',
    options: [
      { label: 'Independiente para caminar 50 metros', value: 15 },
      { label: 'Necesita ayuda física o supervisión para caminar 50 metros', value: 10 },
      { label: 'Independiente en silla de ruedas en 50 metros', value: 5 },
      { label: 'Inmóvil', value: 0 },
    ],
  },
  {
    key: 'escaleras',
    label: 'Escaleras',
    options: [
      { label: 'Independiente para bajar y subir escaleras', value: 10 },
      { label: 'Necesita ayuda física o supervisión para hacerlo', value: 5 },
      { label: 'Dependiente', value: 0 },
    ],
  },
];

export default function CreateNeurologicaForm({ onClose }: { onClose: () => void }) {
  const form = useForm<FormValues>({ resolver: zodResolver(schema) });
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [barthel, setBarthel] = useState<{ [key: string]: number }>({});
  const totalBarthel = Object.values(barthel).reduce((a, b) => a + b, 0);

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

        {/* Sección Amnesis */}
        <div className='space-y-4'>
          <h4 className='font-semibold text-lg'>Amnesis</h4>
          <FormField name='amnesis' control={form.control} render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea className='min-h-[80px] border border-gray-200 bg-white focus:bg-white focus:border-blue-200' placeholder='Describa la amnesis...' {...field} />
              </FormControl>
            </FormItem>
          )} />
          <ul className='space-y-2'>
            <li className='flex items-center gap-2'>
              <span className='font-semibold'>• INICIO Y EVOLUCIÓN DEL CUADRO CLINICO</span>
            </li>
            <li className='flex items-center gap-2'>
              <span className='font-semibold'>• ENTORNO FAMILIAR Y SOCIAL</span>
              <div className='flex-1'>
                <FormField name='entornoFamiliar' control={form.control} render={({ field }) => (
                  <FormItem className='mb-0'>
                    <FormControl>
                      <Input className='bg-white border border-gray-200 focus:bg-white focus:border-blue-200' placeholder='Entorno familiar y social...' {...field} />
                    </FormControl>
                  </FormItem>
                )} />
              </div>
            </li>
          </ul>
          <FormField name='inicioEvolucion' control={form.control} render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea className='min-h-[60px] border border-gray-200 bg-white focus:bg-white focus:border-blue-200 mt-2' placeholder='Describa el inicio y evolución...' {...field} />
              </FormControl>
            </FormItem>
          )} />
        </div>

        {/* Sección Barthel */}
        <div className='space-y-2'>
          <h4 className='font-semibold text-lg mt-8 mb-2'>Dependencia Funcional: Índice de Barthel (AVD)</h4>
          <div className='overflow-x-auto'>
            <table className='min-w-full border text-xs md:text-sm'>
              <thead>
                <tr className='bg-gray-100'>
                  <th className='border px-4 py-2'>Ítem</th>
                  <th className='border px-4 py-2'>Descripción</th>
                  <th className='border px-4 py-2'>Puntaje</th>
                </tr>
              </thead>
              <tbody>
                {barthelItems.map((item) => (
                  <tr key={item.key}>
                    <td className='border px-4 py-4 align-top w-1/6'>{item.label}</td>
                    <td className='border px-4 py-4 w-3/6'>
                      <ul className='space-y-3'>
                        {item.options.map((opt) => (
                          <li key={opt.label} className='flex items-center gap-2'>
                            <span className='text-lg text-gray-500'>•</span>
                            <span>{opt.label}</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className='border px-4 py-4 text-center align-top w-1/6'>
                      <div className='flex flex-col items-center gap-4'>
                        {item.options.map((opt) => (
                          <label key={opt.value} className='flex items-center gap-2'>
                            <input
                              type='radio'
                              name={item.key}
                              value={opt.value}
                              checked={barthel[item.key] === opt.value}
                              onChange={() => setBarthel({ ...barthel, [item.key]: opt.value })}
                            />
                            <span className={`font-bold text-base ${barthel[item.key] === opt.value ? 'bg-lime-400 text-black px-3 py-1 rounded' : ''}`}>{opt.value}</span>
                          </label>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className='mt-4 font-semibold text-lg'>Total: {totalBarthel} puntos</div>

          {/* Tabla de grado de dependencia */}
          <div className='overflow-x-auto mt-6 flex justify-center'>
            <div>
              <table className='min-w-[400px] border text-sm mx-auto'>
                <thead>
                  <tr className='bg-gray-100'>
                    <th className='border px-4 py-2'>RESULTADO</th>
                    <th className='border px-4 py-2'>GRADO DE DEPENDENCIA</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className={`border px-4 py-2 text-center ${totalBarthel < 20 ? 'bg-lime-400 font-bold' : ''}`}>&lt;20</td>
                    <td className='border px-4 py-2 text-center'>Total</td>
                  </tr>
                  <tr>
                    <td className={`border px-4 py-2 text-center ${totalBarthel >= 20 && totalBarthel <= 35 ? 'bg-lime-400 font-bold' : ''}`}>20-35</td>
                    <td className='border px-4 py-2 text-center'>Grave</td>
                  </tr>
                  <tr>
                    <td className={`border px-4 py-2 text-center ${totalBarthel >= 40 && totalBarthel <= 55 ? 'bg-lime-400 font-bold' : ''}`}>40-55</td>
                    <td className='border px-4 py-2 text-center'>Moderado</td>
                  </tr>
                  <tr>
                    <td className={`border px-4 py-2 text-center ${totalBarthel >= 60 && totalBarthel < 100 ? 'bg-lime-400 font-bold' : ''}`}>&gt;=60</td>
                    <td className='border px-4 py-2 text-center'>Leve</td>
                  </tr>
                  <tr>
                    <td className={`border px-4 py-2 text-center ${totalBarthel === 100 ? 'bg-lime-400 font-bold' : ''}`}>100</td>
                    <td className='border px-4 py-2 text-center'>Independiente</td>
                  </tr>
                </tbody>
              </table>
              <div className='mt-2 text-center'><span className='font-bold'>Máxima puntuación 100</span> puntos</div>
              <div className='text-sm text-center'>(<span className='font-bold'>90</span> si está en silla de ruedas)</div>
            </div>
          </div>
        </div>

        {/* Comentarios examinador */}
        <div className='mt-8'>
          <h4 className='font-semibold text-lg mb-2'>Comentarios examinador</h4>
          <FormField name='comentariosExaminador' control={form.control} render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea className='min-h-[180px] border border-gray-200 bg-white focus:bg-white focus:border-blue-200' placeholder='Escriba aquí los comentarios del examinador...' {...field} />
              </FormControl>
            </FormItem>
          )} />
        </div>

        {/* Resumen de resultados */}
        <div className='mt-8'>
          <h4 className='font-semibold text-lg mb-2'>Resumen de resultados</h4>
          <FormField name='resumenResultados' control={form.control} render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea className='min-h-[120px] border border-gray-200 bg-white focus:bg-white focus:border-blue-200' placeholder='Escriba aquí el resumen de resultados...' {...field} />
              </FormControl>
            </FormItem>
          )} />
        </div>

        <Button type='submit' disabled={isPending}>Guardar</Button>
      </form>
    </Form>
  );
}
