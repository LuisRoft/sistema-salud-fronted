'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';

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
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NursingFormValues>({
    resolver: zodResolver(nursingFormSchema),
  });

  const onSubmit = (data: NursingFormValues) => {
    console.log(data);
  };

  return (
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
                  <Input type='date' {...register('fecha')} />
                  {errors.fecha && <span className='text-sm text-red-500'>{errors.fecha.message}</span>}
                </TableCell>
                <TableCell>
                  <Input {...register('motivoConsulta')} />
                  {errors.motivoConsulta && <span className='text-sm text-red-500'>{errors.motivoConsulta.message}</span>}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </section>

        {/* B. Antecedentes */}
        <section className='mb-4'>
          <h3 className='mb-4 text-xl font-semibold'>B. Antecedentes</h3>
          <Label>Antecedentes Patológicos Personales</Label>
          <Input {...register('antecedentesPatologicosPersonales.0')} />
          <Input {...register('antecedentesPatologicosPersonales.1')} />
          <Label>Descripción</Label>
          <Input {...register('antecedentesPatologicosPersonalesDesc')} />
          <Label>Antecedentes Patológicos Familiares</Label>
          <Input {...register('antecedentesPatologicosFamiliares.0')} />
          <Input {...register('antecedentesPatologicosFamiliares.1')} />
          <Label>Descripción</Label>
          <Input {...register('antecedentesPatologicosFamiliaresDesc')} />
        </section>

        {/* C. Enfermedad Actual */}
        <section className='mb-4'>
          <h3 className='mb-4 text-xl font-semibold'>C. Enfermedad Actual</h3>
          <Input {...register('enfermedadProblemaActual')} />
        </section>

        {/* D. Signos Vitales */}
        <section className='mb-4'>
          <h3 className='mb-4 text-xl font-semibold'>D. Signos Vitales</h3>
          {[
            'Fecha',
            'Hora',
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
            <div key={field}>
              <Label>{field}</Label>
              <Input {...register(`cva${field.replace(/\s+/g, '')}` as keyof NursingFormValues)} />
            </div>
          ))}
        </section>

        {/* E. Exámenes y Diagnóstico */}
        <section className='mb-4'>
          <h3 className='mb-4 text-xl font-semibold'>E. Exámenes y Diagnóstico</h3>
          <Label>Órganos y Sistemas Patológicos</Label>
          <Input {...register('organosSistemasPatologia.0')} />
          <Input {...register('organosSistemasPatologiaDesc.0')} />
          <Label>Examen Físico Patológico</Label>
          <Input {...register('examenFisicoPatologia.0')} />
          <Input {...register('examenFisicoPatologiaDesc.0')} />
          <Label>Diagnóstico</Label>
          <Input {...register('diagnosticosDesc.0')} />
          <Label>Código CIE-10</Label>
          <Input {...register('diagnosticosCie.0')} />
        </section>

        {/* F. Plan de Tratamiento */}
        <section className='mb-4'>
          <h3 className='mb-4 text-xl font-semibold'>F. Plan de Tratamiento</h3>
          <Label>Descripción</Label>
          <Input {...register('planTratamiento')} />
        </section>

        <Button type='submit' className='bg-blue-500 text-white'>Enviar</Button>
      </form>
    </div>
  );
}
