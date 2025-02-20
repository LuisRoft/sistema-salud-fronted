'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';

const nursingFormSchema = z.object({
  fecha: z.string().min(1, 'Campo obligatorio'),
  motivoConsulta: z.string().min(1, 'Campo obligatorio'),
  antecedentesPatologicosPersonales: z.array(z.string()).optional(),
  antecedentesPatologicosPersonalesDesc: z.string().optional(),
  antecedentesPatologicosFamiliares: z.array(z.string()).optional(),
  antecedentesPatologicosFamiliaresDesc: z.string().optional(),
  enfermedadProblemaActual: z.string().min(1, 'Campo obligatorio'),
  cvaFecha: z.string().optional(),
  cvaHora: z.string().optional(),
  cvaTemperatura: z.string().optional(),
  cvaPresionArterial: z.string().optional(),
  cvaPulso: z.string().optional(),
  cvaFrecuenciaRespiratoria: z.string().optional(),
  cvaPeso: z.string().optional(),
  cvaTalla: z.string().optional(),
  cvaImc: z.string().optional(),
  cvaPerimetroAbdominal: z.string().optional(),
  cvaHemoglobinaCapilar: z.string().optional(),
  cvaGlucosaCapilar: z.string().optional(),
  cvaPulsioximetria: z.string().optional(),
  organosSistemasPatologia: z.array(z.string()).optional(),
  organosSistemasPatologiaDesc: z.array(z.string()).optional(),
  examenFisicoPatologia: z.array(z.string()).optional(),
  examenFisicoPatologiaDesc: z.array(z.string()).optional(),
  diagnosticosDesc: z.array(z.string()).optional(),
  diagnosticosCie: z.array(z.string()).optional(),
  planTratamiento: z.string().min(1, 'Campo obligatorio'),
});

type NursingFormValues = z.infer<typeof nursingFormSchema>;

export default function NursingForm() {
  const [currentDate, setCurrentDate] = useState('');
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const now = new Date();
    setCurrentDate(now.toISOString().split('T')[0]); // Formato YYYY-MM-DD
    setCurrentTime(now.toTimeString().split(' ')[0]); // Formato HH:MM:SS
  }, []);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<NursingFormValues>({
    resolver: zodResolver(nursingFormSchema),
  });

  useEffect(() => {
    setValue('fecha', currentDate);
    setValue('cvaFecha', currentDate);
    setValue('cvaHora', currentTime);
  }, [currentDate, currentTime, setValue]);

  const onSubmit = (data: NursingFormValues) => {
    console.log(data);
  };

  return (
    <div className='rounded-lg bg-zinc-50 p-6 shadow dark:bg-gray-800'>
      <div className='space-y-6'>
        <h2 className='text-2xl font-bold'>Formulario de Enfermería</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* A. Datos Generales */}
          <section className='mb-4'>
            <h3 className='mb-4 text-xl font-semibold'>A. Datos Generales</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Motivo de Consulta</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>
                    <Input
                      type='date'
                      {...register('fecha')}
                      value={currentDate}
                      disabled
                    />
                    {errors.fecha && (
                      <span className='text-sm text-red-500'>
                        {errors.fecha.message}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Input {...register('motivoConsulta')} />
                    {errors.motivoConsulta && (
                      <span className='text-sm text-red-500'>
                        {errors.motivoConsulta.message}
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </section>

          {/* C. Enfermedad Actual */}
          <section className='mb-4'>
            <h3 className='mb-4 text-xl font-semibold'>C. Enfermedad Actual</h3>
            <Input {...register('enfermedadProblemaActual')} />
          </section>

          {/* D. Signos Vitales */}
          <section className='mb-4'>
            <h3 className='mb-4 text-xl font-semibold'>D. Signos Vitales</h3>
            <div className='space-y-2'>
              <Label>Fecha</Label>
              <Input
                type='date'
                {...register('cvaFecha')}
                value={currentDate}
                disabled
              />
            </div>
            <div className='mt-4 space-y-2'>
              <Label>Hora</Label>
              <Input
                type='time'
                {...register('cvaHora')}
                value={currentTime}
                disabled
              />
            </div>
            {[
              'Temperatura',
              'Presión Arterial',
              'Pulso',
              'Frecuencia Respiratoria',
              'Peso',
              'Talla',
              'IMC',
              'Perímetro Abdominal',
              'Hemoglobina Capilar',
              'Glucosa Capilar',
              'Pulsioximetría',
            ].map((field) => (
              <div key={field} className='mt-4 space-y-2'>
                <Label>{field}</Label>
                <Input
                  {...register(
                    `cva${field.replace(/\s+/g, '')}` as keyof NursingFormValues
                  )}
                />
              </div>
            ))}
          </section>

          {/* F. Plan de Tratamiento */}
          <section className='mb-4'>
            <h3 className='mb-4 text-xl font-semibold'>
              F. Plan de Tratamiento
            </h3>
            <Label>Descripción</Label>
            <Input {...register('planTratamiento')} className='mt-2' />
          </section>

          <Button type='submit' className='bg-primary text-white'>
            Enviar
          </Button>
        </form>
      </div>
    </div>
  );
}
