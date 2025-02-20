'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';

const labFormSchema = z.object({
  institucionSistema: z.string().min(1, 'Campo obligatorio'),
  unicodigo: z.string().min(1, 'Campo obligatorio'),
  establecimientoSalud: z.string().min(1, 'Campo obligatorio'),
  numeroHistoriaClinica: z.string().min(1, 'Campo obligatorio'),
  numeroArchivo: z.string().min(1, 'Campo obligatorio'),
  paciente: z.object({
    primerApellido: z.string().min(1, 'Campo obligatorio'),
    segundoApellido: z.string().optional(),
    primerNombre: z.string().min(1, 'Campo obligatorio'),
    segundoNombre: z.string().optional(),
    sexo: z.enum(['M', 'F']),
    edad: z.number().min(0, 'Edad inválida'),
  }),
  servicio: z.object({
    tipoServicio: z.enum(['CONSULTA EXTERNA', 'HOSPITALIZACION']),
    prioridad: z.enum(['URGENTE', 'RUTINA']),
    sala: z.string().optional(),
  }),
  examenes: z.object({
    hematologia: z.array(z.string()).optional(),
    coagulacion: z.array(z.string()).optional(),
    quimicaSanguinea: z.array(z.string()).optional(),
    inmunologia: z.array(z.string()).optional(),
    marcadoresCardio: z.array(z.string()).optional(),
    hormonas: z.array(z.string()).optional(),
  }),
  tuberculosis: z.object({
    tipoAfectado: z.enum(['Nuevo', 'Recaida', 'Fracaso']).optional(),
    tipoMuestra: z.enum(['Esputo', 'Liquido cefalorraquideo']).optional(),
    diagnostico: z.enum(['TB sensible', 'TB resistente']).optional(),
  }),
  profesional: z.object({
    nombre: z.string().min(1, 'Campo obligatorio'),
    apellido: z.string().min(1, 'Campo obligatorio'),
    documento: z.string().min(1, 'Campo obligatorio'),
    fechaSolicitud: z.string().min(1, 'Campo obligatorio'),
    firma: z.string().optional(),
  }),
});

type LabFormValues = z.infer<typeof labFormSchema>;

export default function LaboratoryRequestForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
  } = useForm<LabFormValues>({
    resolver: zodResolver(labFormSchema),
  });

  const onSubmit = (data: LabFormValues) => {
    console.log(data);
  };

  const handleCheckboxChange = (
    category: keyof LabFormValues['examenes'],
    value: string
  ) => {
    return (checked: boolean) => {
      const currentValues = getValues(`examenes.${category}`) || [];
      if (checked) {
        setValue(`examenes.${category}`, [...currentValues, value]);
      } else {
        setValue(
          `examenes.${category}`,
          currentValues.filter((item) => item !== value)
        );
      }
    };
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6 p-4'>
      <h2 className='text-2xl font-bold'>
        Formulario de Solicitud de Laboratorio 10A
      </h2>

      {/* Sección A: Datos del Establecimiento y Paciente */}
      <section>
        <h3 className='mb-4 text-xl font-semibold'>
          A. Datos del Establecimiento y Paciente
        </h3>
        <Table className='mb-4'>
          <TableHeader>
            <TableRow>
              <TableHead>Institución del Sistema</TableHead>
              <TableHead>Unicódigo</TableHead>
              <TableHead>Establecimiento de Salud</TableHead>
              <TableHead>N° Historia Clínica</TableHead>
              <TableHead>N° Archivo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>
                <Input {...register('institucionSistema')} />
                {errors.institucionSistema && (
                  <span className='text-sm text-red-500'>
                    {errors.institucionSistema.message}
                  </span>
                )}
              </TableCell>
              <TableCell>
                <Input {...register('unicodigo')} />
                {errors.unicodigo && (
                  <span className='text-sm text-red-500'>
                    {errors.unicodigo.message}
                  </span>
                )}
              </TableCell>
              <TableCell>
                <Input {...register('establecimientoSalud')} />
                {errors.establecimientoSalud && (
                  <span className='text-sm text-red-500'>
                    {errors.establecimientoSalud.message}
                  </span>
                )}
              </TableCell>
              <TableCell>
                <Input {...register('numeroHistoriaClinica')} />
                {errors.numeroHistoriaClinica && (
                  <span className='text-sm text-red-500'>
                    {errors.numeroHistoriaClinica.message}
                  </span>
                )}
              </TableCell>
              <TableCell>
                <Input {...register('numeroArchivo')} />
                {errors.numeroArchivo && (
                  <span className='text-sm text-red-500'>
                    {errors.numeroArchivo.message}
                  </span>
                )}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <div className='mb-4 grid grid-cols-2 gap-4'>
          <div>
            <Label>Primer Apellido</Label>
            <Input {...register('paciente.primerApellido')} />
            {errors.paciente?.primerApellido && (
              <span className='text-sm text-red-500'>
                {errors.paciente.primerApellido.message}
              </span>
            )}
          </div>
          <div>
            <Label>Segundo Apellido</Label>
            <Input {...register('paciente.segundoApellido')} />
          </div>
          <div>
            <Label>Primer Nombre</Label>
            <Input {...register('paciente.primerNombre')} />
            {errors.paciente?.primerNombre && (
              <span className='text-sm text-red-500'>
                {errors.paciente.primerNombre.message}
              </span>
            )}
          </div>
          <div>
            <Label>Segundo Nombre</Label>
            <Input {...register('paciente.segundoNombre')} />
          </div>
          <div>
            <Label>Sexo</Label>
            <select
              {...register('paciente.sexo')}
              className='w-full rounded border p-2'
            >
              <option value='M'>Masculino</option>
              <option value='F'>Femenino</option>
            </select>
          </div>
          <div>
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
        </div>
      </section>

      {/* Sección B: Servicio y Prioridad */}
      <section>
        <h3 className='mb-4 text-xl font-semibold'>B. Servicio y Prioridad</h3>
        <div className='grid grid-cols-2 gap-4'>
          <div>
            <Label>Tipo de Servicio</Label>
            <select
              {...register('servicio.tipoServicio')}
              className='w-full rounded border p-2'
            >
              <option value='CONSULTA EXTERNA'>Consulta Externa</option>
              <option value='HOSPITALIZACION'>Hospitalización</option>
            </select>
          </div>
          <div>
            <Label>Prioridad</Label>
            <select
              {...register('servicio.prioridad')}
              className='w-full rounded border p-2'
            >
              <option value='URGENTE'>Urgente</option>
              <option value='RUTINA'>Rutina</option>
            </select>
          </div>
          <div>
            <Label>Sala (opcional)</Label>
            <Input {...register('servicio.sala')} />
          </div>
        </div>
      </section>

      {/* Sección C: Listado de Exámenes */}
      <section>
        <h3 className='mb-4 text-xl font-semibold'>C. Listado de Exámenes</h3>

        <div className='mb-6'>
          <h4 className='mb-2 font-medium'>Hematología</h4>
          <div className='grid grid-cols-3 gap-2'>
            {['Hemoglobina', 'Hematocrito', 'Leucocitos', 'Plaquetas'].map(
              (item) => (
                <label key={item} className='flex items-center space-x-2'>
                  <Checkbox
                    onCheckedChange={handleCheckboxChange('hematologia', item)}
                  />
                  <span>{item}</span>
                </label>
              )
            )}
          </div>
        </div>

        <Separator className='my-4' />

        <div className='mb-6'>
          <h4 className='mb-2 font-medium'>Química Sanguínea</h4>
          <div className='grid grid-cols-3 gap-2'>
            {['Glucosa', 'Creatinina', 'Colesterol', 'Triglicéridos'].map(
              (item) => (
                <label key={item} className='flex items-center space-x-2'>
                  <Checkbox
                    onCheckedChange={handleCheckboxChange(
                      'quimicaSanguinea',
                      item
                    )}
                  />
                  <span>{item}</span>
                </label>
              )
            )}
          </div>
        </div>

        {/* Agregar más secciones de exámenes siguiendo el mismo patrón */}
      </section>

      {/* Sección Tuberculosis */}
      <section>
        <h3 className='mb-4 text-xl font-semibold'>Tuberculosis</h3>
        <div className='grid grid-cols-3 gap-4'>
          <div>
            <Label>Tipo de afectado</Label>
            <select
              {...register('tuberculosis.tipoAfectado')}
              className='w-full rounded border p-2'
            >
              <option value='Nuevo'>Nuevo</option>
              <option value='Recaida'>Recaída</option>
              <option value='Fracaso'>Fracaso</option>
            </select>
          </div>
          <div>
            <Label>Tipo de muestra</Label>
            <select
              {...register('tuberculosis.tipoMuestra')}
              className='w-full rounded border p-2'
            >
              <option value='Esputo'>Esputo</option>
              <option value='Liquido cefalorraquideo'>LCR</option>
            </select>
          </div>
          <div>
            <Label>Diagnóstico</Label>
            <select
              {...register('tuberculosis.diagnostico')}
              className='w-full rounded border p-2'
            >
              <option value='TB sensible'>TB sensible</option>
              <option value='TB resistente'>TB resistente</option>
            </select>
          </div>
        </div>
      </section>

      {/* Sección Profesional Responsable */}
      <section>
        <h3 className='mb-4 text-xl font-semibold'>D. Datos del Profesional</h3>
        <div className='grid grid-cols-2 gap-4'>
          <div>
            <Label>Nombre</Label>
            <Input {...register('profesional.nombre')} />
            {errors.profesional?.nombre && (
              <span className='text-sm text-red-500'>
                {errors.profesional.nombre.message}
              </span>
            )}
          </div>
          <div>
            <Label>Apellido</Label>
            <Input {...register('profesional.apellido')} />
            {errors.profesional?.apellido && (
              <span className='text-sm text-red-500'>
                {errors.profesional.apellido.message}
              </span>
            )}
          </div>
          <div>
            <Label>Documento</Label>
            <Input {...register('profesional.documento')} />
            {errors.profesional?.documento && (
              <span className='text-sm text-red-500'>
                {errors.profesional.documento.message}
              </span>
            )}
          </div>
          <div>
            <Label>Fecha de Solicitud</Label>
            <Input type='date' {...register('profesional.fechaSolicitud')} />
            {errors.profesional?.fechaSolicitud && (
              <span className='text-sm text-red-500'>
                {errors.profesional.fechaSolicitud.message}
              </span>
            )}
          </div>
        </div>
      </section>

      <Button
        type='submit'
        className='mt-6 bg-blue-600 text-white hover:bg-blue-700'
      >
        Enviar Solicitud
      </Button>
    </form>
  );
}
