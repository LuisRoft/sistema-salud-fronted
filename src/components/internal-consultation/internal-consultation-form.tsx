'use client';

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
import { Textarea } from '@/components/ui/textarea';

const interconsultSchema = z.object({
  institucionSistema: z.string().min(1, 'Campo obligatorio'),
  unicodigo: z.string().min(1, 'Campo obligatorio'),
  establecimientoSalud: z.string().min(1, 'Campo obligatorio'),
  numeroHistoriaClinica: z.string().min(1, 'Campo obligatorio'),
  numeroArchivo: z.string().min(1, 'Campo obligatorio'),
  hoja: z.string().min(1, 'Campo obligatorio'),
  paciente: z.object({
    primerApellido: z.string().min(1, 'Campo obligatorio'),
    segundoApellido: z.string().optional(),
    primerNombre: z.string().min(1, 'Campo obligatorio'),
    segundoNombre: z.string().optional(),
    sexo: z.enum(['M', 'F']),
    edad: z.number().min(0, 'Edad inválida'),
    condicionEdad: z.enum(['H', 'D', 'M', 'A']),
  }),
  solicitud: z.object({
    servicio: z.enum(['EMERGENCIA', 'CONSULTA EXTERNA', 'HOSPITALIZACIÓN']),
    especialidad: z.string().min(1, 'Campo obligatorio'),
    cama: z.string().optional(),
    sala: z.string().optional(),
    urgente: z.boolean(),
  }),
  motivo: z.string().min(1, 'Descripción obligatoria'),
  cuadroClinico: z.string().min(1, 'Campo obligatorio'),
  resultadosExamenes: z.string().min(1, 'Campo obligatorio'),
  diagnosticos: z.array(
    z.object({
      descripcion: z.string(),
      ce: z.string(),
      pre: z.string(),
      def: z.string(),
    })
  ),
  planTerapeutico: z.string().min(1, 'Campo obligatorio'),
  profesional: z.object({
    fecha: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato inválido (aaaa-mm-dd)'),
    hora: z.string().regex(/^\d{2}:\d{2}$/, 'Formato inválido (hh:mm)'),
    nombre: z.string().min(1, 'Campo obligatorio'),
    apellido: z.string().min(1, 'Campo obligatorio'),
    documento: z.string().min(1, 'Campo obligatorio'),
    firma: z.string().optional(),
  }),
});

type InterconsultFormValues = z.infer<typeof interconsultSchema>;

export default function InterConsultForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InterconsultFormValues>({
    resolver: zodResolver(interconsultSchema),
    defaultValues: {
      diagnosticos: [{}, {}, {}, {}, {}, {}], // 6 diagnósticos como en el PDF
    },
  });

  const onSubmit = (data: InterconsultFormValues) => {
    console.log(data);
  };

  return (
    <div className='rounded-lg bg-zinc-50 p-6 shadow dark:bg-gray-800'>
      <div className='space-y-6 p-4'>
        <h2 className='text-2xl font-bold'>Formulario de Interconsulta 007</h2>

        {/* Sección A: Datos del Establecimiento y Paciente */}
        <section>
          <h3 className='mb-4 text-xl font-semibold'>
            A. Datos del Establecimiento y Paciente
          </h3>
          <Table className='mb-4'>
            <TableHeader>
              <TableRow>
                <TableHead>Institución</TableHead>
                <TableHead>Unicódigo</TableHead>
                <TableHead>Establecimiento</TableHead>
                <TableHead>N° Historia Clínica</TableHead>
                <TableHead>N° Archivo</TableHead>
                <TableHead>No. Hoja</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                {[
                  'institucionSistema',
                  'unicodigo',
                  'establecimientoSalud',
                  'numeroHistoriaClinica',
                  'numeroArchivo',
                  'hoja',
                ].map((field) => (
                  <TableCell key={field}>
                    <Input
                      {...register(field as keyof InterconsultFormValues)}
                    />
                    {errors[field as keyof typeof errors] && (
                      <span className='text-sm text-red-500'>
                        {errors[field as keyof typeof errors]?.message}
                      </span>
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>

          <div className='mb-4 grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label>Primer Apellido</Label>
              <Input {...register('paciente.primerApellido')} />
              {errors.paciente?.primerApellido && (
                <span className='text-sm text-red-500'>
                  {errors.paciente.primerApellido.message}
                </span>
              )}
            </div>
            <div className='space-y-2'>
              <Label>Segundo Apellido</Label>
              <Input {...register('paciente.segundoApellido')} />
            </div>
            <div className='space-y-2'>
              <Label>Primer Nombre</Label>
              <Input {...register('paciente.primerNombre')} />
              {errors.paciente?.primerNombre && (
                <span className='text-sm text-red-500'>
                  {errors.paciente.primerNombre.message}
                </span>
              )}
            </div>
            <div className='space-y-2'>
              <Label>Segundo Nombre</Label>
              <Input {...register('paciente.segundoNombre')} />
            </div>
            <div className='space-y-2'>
              <Label>Sexo</Label>
              <select
                {...register('paciente.sexo')}
                className='w-full rounded border bg-input p-2'
              >
                <option value='M'>Masculino</option>
                <option value='F'>Femenino</option>
              </select>
            </div>
            <div className='space-y-2'>
              <Label>Edad</Label>
              <Input
                type='number'
                {...register('paciente.edad', { valueAsNumber: true })}
              />
              {errors.paciente?.edad && (
                <span className='text-sm text-red-500'>
                  {errors.paciente.edad.message}
                </span>
              )}
            </div>
            <div className='space-y-2'>
              <Label>Condición Edad</Label>
              <select
                {...register('paciente.condicionEdad')}
                className='w-full rounded border bg-input p-2'
              >
                <option value='H'>Horas</option>
                <option value='D'>Días</option>
                <option value='M'>Meses</option>
                <option value='A'>Años</option>
              </select>
            </div>
          </div>
        </section>

        {/* Sección B: Características de la Solicitud */}
        <section>
          <h3 className='mb-4 text-xl font-semibold'>
            B. Características de la Solicitud
          </h3>
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label>Servicio</Label>
              <select
                {...register('solicitud.servicio')}
                className='w-full rounded border bg-input p-2'
              >
                <option value='EMERGENCIA'>Emergencia</option>
                <option value='CONSULTA EXTERNA'>Consulta Externa</option>
                <option value='HOSPITALIZACIÓN'>Hospitalización</option>
              </select>
            </div>
            <div className='space-y-2'>
              <Label>Especialidad</Label>
              <Input {...register('solicitud.especialidad')} />
              {errors.solicitud?.especialidad && (
                <span className='text-sm text-red-500'>
                  {errors.solicitud.especialidad.message}
                </span>
              )}
            </div>
            <div className='space-y-2'>
              <Label>No. Cama (opcional)</Label>
              <Input {...register('solicitud.cama')} />
            </div>
            <div className='flex items-center space-x-2'>
              <Label>Urgente</Label>
              <input
                type='checkbox'
                {...register('solicitud.urgente')}
                className='ml-2'
              />
            </div>
          </div>
        </section>

        {/* Sección C: Cuadro Clínico */}
        <section>
          <h3 className='mb-4 text-xl font-semibold'>
            C. Cuadro Clínico Actual
          </h3>
          <Textarea {...register('cuadroClinico')} className='min-h-[100px]' />
          {errors.cuadroClinico && (
            <span className='text-sm text-red-500'>
              {errors.cuadroClinico.message}
            </span>
          )}
        </section>

        {/* Sección E: Diagnósticos */}
        <section>
          <h3 className='mb-4 text-xl font-semibold'>
            E. Diagnóstico Pre-presuntivo
          </h3>
          <div className='grid grid-cols-3 gap-4'>
            {[...Array(6)].map((_, index) => (
              <div key={index} className='space-y-2'>
                <Label>Diagnóstico {index + 1}</Label>
                <Input {...register(`diagnosticos.${index}.descripcion`)} />
                <div className='grid grid-cols-3 gap-2'>
                  <Input
                    placeholder='CE'
                    {...register(`diagnosticos.${index}.ce`)}
                  />
                  <Input
                    placeholder='PRE'
                    {...register(`diagnosticos.${index}.pre`)}
                  />
                  <Input
                    placeholder='DEF'
                    {...register(`diagnosticos.${index}.def`)}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Sección G: Profesional Responsable */}
        <section>
          <h3 className='mb-4 text-xl font-semibold'>
            G. Datos del Profesional
          </h3>
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label>Fecha (aaaa-mm-dd)</Label>
              <Input {...register('profesional.fecha')} />
              {errors.profesional?.fecha && (
                <span className='text-sm text-red-500'>
                  {errors.profesional.fecha.message}
                </span>
              )}
            </div>
            <div className='space-y-2'>
              <Label>Hora (hh:mm)</Label>
              <Input {...register('profesional.hora')} />
              {errors.profesional?.hora && (
                <span className='text-sm text-red-500'>
                  {errors.profesional.hora.message}
                </span>
              )}
            </div>
            <div className='space-y-2'>
              <Label>Nombre</Label>
              <Input {...register('profesional.nombre')} />
              {errors.profesional?.nombre && (
                <span className='text-sm text-red-500'>
                  {errors.profesional.nombre.message}
                </span>
              )}
            </div>
            <div className='space-y-2'>
              <Label>Apellido</Label>
              <Input {...register('profesional.apellido')} />
              {errors.profesional?.apellido && (
                <span className='text-sm text-red-500'>
                  {errors.profesional.apellido.message}
                </span>
              )}
            </div>
            <div className='space-y-2'>
              <Label>Documento</Label>
              <Input {...register('profesional.documento')} />
              {errors.profesional?.documento && (
                <span className='text-sm text-red-500'>
                  {errors.profesional.documento.message}
                </span>
              )}
            </div>
          </div>
        </section>

        <Button
          type='submit'
          className='mt-6 bg-primary text-white'
          onClick={handleSubmit(onSubmit)}
        >
          Enviar Interconsulta
        </Button>
      </div>
    </div>
  );
}
