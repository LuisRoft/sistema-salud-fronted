'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useSession, getSession } from 'next-auth/react';
import { useToast } from '@/components/ui/use-toast';
import { createInternalConsultation } from '@/services/internalConsultation.service';
import { useState } from 'react';
import { PatientSelector } from '@/components/shared/patient-selector';

const formSchema = z.object({
  numeroDeArchivo: z.number().min(1, 'Campo obligatorio'),
  fecha: z.string().min(1, 'Campo obligatorio'),
  motivoConsulta: z.string().min(1, 'Campo obligatorio'),
  servicio: z.string().min(1, 'Campo obligatorio'),
  especialidadConsultada: z.string().min(1, 'Campo obligatorio'),
  esUrgente: z.boolean(),
  cuadroClinicoActual: z.string().min(1, 'Campo obligatorio'),
  examenesResultados: z.array(z.string()),
  diagnosticosDesc: z.array(z.string()),
  diagnosticosCie: z.array(z.string()),
  diagnosticosPresuntivo: z.array(z.boolean()),
  diagnosticosDefinitivo: z.array(z.boolean()),
  planTratamiento: z.string().min(1, 'Campo obligatorio'),
  cuadroClinicoInterconsulta: z.string().min(1, 'Campo obligatorio'),
  planDiagnosticoPropuesto: z.string(),
  planTerapeuticoPropuesto: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

export default function InternalConsultationForm() {
  const { data: session } = useSession();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      numeroDeArchivo: 0,
      fecha: new Date().toISOString().split('T')[0],
      motivoConsulta: '',
      servicio: 'CONSULTA EXTERNA',
      especialidadConsultada: '',
      esUrgente: false,
      cuadroClinicoActual: '',
      examenesResultados: [],
      diagnosticosDesc: [],
      diagnosticosCie: [],
      diagnosticosPresuntivo: [],
      diagnosticosDefinitivo: [],
      planTratamiento: '',
      cuadroClinicoInterconsulta: '',
      planDiagnosticoPropuesto: '',
      planTerapeuticoPropuesto: '',
    },
  });

  const handlePatientSelect = (patient: any) => {
    setValue('numeroDeArchivo', Number(patient.document));
    setValue('fecha', patient.birthday);
    setValue('cuadroClinicoActual', patient.typeDisability);
  };

  const [diagnosticos, setDiagnosticos] = useState([
    { desc: '', cie: '', presuntivo: false, definitivo: false },
  ]);
  const [examenes, setExamenes] = useState(['']);

  const agregarDiagnostico = () => {
    setDiagnosticos([
      ...diagnosticos,
      { desc: '', cie: '', presuntivo: false, definitivo: false },
    ]);
  };

  const agregarExamen = () => {
    setExamenes([...examenes, '']);
  };

  const onSubmit = async (data: FormValues) => {
    try {
      const sessionData = await getSession();
      if (!sessionData?.user?.access_token) {
        toast({
          title: 'Error',
          description: 'No hay información del usuario',
          variant: 'destructive',
        });
        return;
      }

      const token = sessionData.user.access_token;
      const tokenParts = token.split('.');
      const payload = JSON.parse(atob(tokenParts[1]));
      const userId = payload.id;

      const patientId = sessionData.user.team?.patient?.id;
      if (!patientId) {
        toast({
          title: 'Error',
          description: 'No se pudo obtener el ID del paciente',
          variant: 'destructive',
        });
        return;
      }

      const formattedData = {
        numeroDeArchivo: Number(data.numeroDeArchivo),
        fecha: data.fecha,
        motivoConsulta: data.motivoConsulta.trim(),
        servicio: data.servicio.trim(),
        especialidadConsultada: data.especialidadConsultada.trim(),
        esUrgente: Boolean(data.esUrgente),
        cuadroClinicoActual: data.cuadroClinicoActual.trim(),
        examenesResultados: examenes.filter(Boolean),
        diagnosticosDesc: diagnosticos.map((d) => d.desc).filter(Boolean),
        diagnosticosCie: diagnosticos.map((d) => d.cie).filter(Boolean),
        diagnosticosPresuntivo: diagnosticos.map((d) => d.presuntivo),
        diagnosticosDefinitivo: diagnosticos.map((d) => d.definitivo),
        planTratamiento: data.planTratamiento.trim(),
        cuadroClinicoInterconsulta: data.cuadroClinicoInterconsulta.trim(),
        planDiagnosticoPropuesto: data.planDiagnosticoPropuesto.trim(),
        planTerapeuticoPropuesto: data.planTerapeuticoPropuesto.trim(),
        user: userId,
        patient: patientId,
      };

      console.log('📝 Datos formateados a enviar:', formattedData);

      const response = await createInternalConsultation(formattedData, token);
      console.log('✅ Respuesta del servidor:', response);

      toast({
        title: 'Éxito',
        description: 'Interconsulta creada correctamente',
      });
    } catch (error) {
      console.error('❌ Error completo:', error);
      if (error instanceof Error && (error as any).response) {
        console.error('Detalles del error del servidor:', (error as any).response.data);
      }
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Error al crear la Interconsulta';
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
      });
    }
  };

  return (
    <div className='rounded-lg bg-zinc-50 p-6 shadow dark:bg-gray-800'>
      <div className='flex items-center justify-between mb-6'>
        <h2 className='text-2xl font-bold'>Formulario de Interconsulta</h2>
        <PatientSelector onSelect={handlePatientSelect} />
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className='space-y-8'>
        <h2 className='mb-6 text-2xl font-bold'>
        </h2>
        
        {/* Sección A: Datos básicos */}
        <section className='space-y-4'>
          <h3 className='text-xl font-semibold'>A. Datos Básicos</h3>
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label>Número de Archivo</Label>
              <Input
                type='number'
                {...register('numeroDeArchivo', { valueAsNumber: true })}
              />
              {errors.numeroDeArchivo && (
                <span className='text-sm text-red-500'>
                  {errors.numeroDeArchivo.message}
                </span>
              )}
            </div>

            <div className='space-y-2'>
              <Label>Fecha</Label>
              <Input type='date' {...register('fecha')} />
              {errors.fecha && (
                <span className='text-sm text-red-500'>
                  {errors.fecha.message}
                </span>
              )}
            </div>
          </div>
        </section>

        {/* Sección B: Detalles de la consulta */}
        <section className='space-y-4'>
          <h3 className='text-xl font-semibold'>B. Detalles de la Consulta</h3>
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label>Motivo de Consulta</Label>
              <Textarea {...register('motivoConsulta')} />
              {errors.motivoConsulta && (
                <span className='text-sm text-red-500'>
                  {errors.motivoConsulta.message}
                </span>
              )}
            </div>

            <div className='space-y-2'>
              <Label>Servicio</Label>
              <select
                {...register('servicio')}
                className='w-full rounded border bg-input p-2'
              >
                <option value='EMERGENCIA'>Emergencia</option>
                <option value='CONSULTA EXTERNA'>Consulta Externa</option>
                <option value='HOSPITALIZACIÓN'>Hospitalización</option>
              </select>
              {errors.servicio && (
                <span className='text-sm text-red-500'>
                  {errors.servicio.message}
                </span>
              )}
            </div>

            <div className='space-y-2'>
              <Label>Especialidad</Label>
              <Input {...register('especialidadConsultada')} />
              {errors.especialidadConsultada && (
                <span className='text-sm text-red-500'>
                  {errors.especialidadConsultada.message}
                </span>
              )}
            </div>

            <div className='flex items-center space-x-2'>
              <Label>Es Urgente</Label>
              <input
                type='checkbox'
                {...register('esUrgente')}
                className='h-4 w-4'
              />
            </div>
          </div>
        </section>

        {/* Sección C: Cuadro Clínico */}
        <section className='space-y-4'>
          <h3 className='text-xl font-semibold'>C. Cuadro Clínico</h3>
          <div className='space-y-2'>
            <Label>Cuadro Clínico Actual</Label>
            <Textarea
              {...register('cuadroClinicoActual')}
              className='min-h-[100px]'
            />
            {errors.cuadroClinicoActual && (
              <span className='text-sm text-red-500'>
                {errors.cuadroClinicoActual.message}
              </span>
            )}
          </div>
        </section>

        {/* Sección D: Diagnósticos */}
        <section className='space-y-4'>
          <div className='flex items-center justify-between'>
            <h3 className='text-xl font-semibold'>D. Diagnósticos</h3>
            <Button
              type='button'
              onClick={agregarDiagnostico}
              variant='outline'
            >
              Agregar Diagnóstico
            </Button>
          </div>

          {diagnosticos.map((diag, index) => (
            <div
              key={index}
              className='grid grid-cols-2 gap-x-4 gap-y-2 rounded border bg-input p-4'
            >
              <div className='space-y-2'>
                <Label>Diagnóstico {index + 1}</Label>
                <Textarea
                  value={diag.desc}
                  onChange={(e) => {
                    const newDiags = [...diagnosticos];
                    newDiags[index].desc = e.target.value;
                    setDiagnosticos(newDiags);
                  }}
                  placeholder='Ej: Hipertensión esencial'
                  className='bg-zinc-50 dark:bg-gray-800'
                />
              </div>
              <div className='space-y-2'>
                <Label>Código CIE</Label>
                <Input
                  value={diag.cie}
                  onChange={(e) => {
                    const newDiags = [...diagnosticos];
                    newDiags[index].cie = e.target.value;
                    setDiagnosticos(newDiags);
                  }}
                  placeholder='Ej: I10'
                  className='bg-zinc-50 dark:bg-gray-800'
                />
              </div>
              <div className='flex space-x-4'>
                <label className='flex items-center space-x-2'>
                  <input
                    type='checkbox'
                    checked={diag.presuntivo}
                    onChange={(e) => {
                      const newDiags = [...diagnosticos];
                      newDiags[index].presuntivo = e.target.checked;
                      setDiagnosticos(newDiags);
                    }}
                  />
                  <span>Presuntivo</span>
                </label>
                <label className='flex items-center space-x-2'>
                  <input
                    type='checkbox'
                    checked={diag.definitivo}
                    onChange={(e) => {
                      const newDiags = [...diagnosticos];
                      newDiags[index].definitivo = e.target.checked;
                      setDiagnosticos(newDiags);
                    }}
                  />
                  <span>Definitivo</span>
                </label>
              </div>
            </div>
          ))}
        </section>

        {/* Sección: Exámenes */}
        <section className='space-y-4'>
          <div className='flex items-center justify-between'>
            <h3 className='text-xl font-semibold'>Exámenes y Resultados</h3>
            <Button type='button' onClick={agregarExamen} variant='outline'>
              Agregar Examen
            </Button>
          </div>

          {examenes.map((examen, index) => (
            <div key={index} className='flex gap-4'>
              <Input
                value={examen}
                onChange={(e) => {
                  const newExamenes = [...examenes];
                  newExamenes[index] = e.target.value;
                  setExamenes(newExamenes);
                }}
                placeholder='Ej: Hemograma normal'
              />
            </div>
          ))}
        </section>

        {/* Sección E: Plan de Tratamiento */}
        <section className='space-y-4'>
          <h3 className='text-xl font-semibold'>E. Plan de Tratamiento</h3>
          <div className='space-y-2'>
            <Label>Plan de Tratamiento</Label>
            <Textarea
              {...register('planTratamiento')}
              className='min-h-[100px]'
            />
            {errors.planTratamiento && (
              <span className='text-sm text-red-500'>
                {errors.planTratamiento.message}
              </span>
            )}
          </div>
        </section>

        {/* Sección F: Planes Propuestos */}
        <section className='space-y-4'>
          <h3 className='text-xl font-semibold'>F. Planes Propuestos</h3>
          <div className='grid gap-4'>
            <div className='space-y-2'>
              <Label>Plan Diagnóstico Propuesto</Label>
              <Textarea {...register('planDiagnosticoPropuesto')} />
            </div>
            <div className='space-y-2'>
              <Label>Plan Terapéutico Propuesto</Label>
              <Textarea {...register('planTerapeuticoPropuesto')} />
            </div>
          </div>
        </section>

        {/* Sección G: Cuadro Clínico Interconsulta */}
        <section className='space-y-4'>
          <h3 className='text-xl font-semibold'>
            Cuadro Clínico Interconsulta
          </h3>
          <div className='space-y-2'>
            <Label>Cuadro Clínico de Interconsulta</Label>
            <Textarea
              {...register('cuadroClinicoInterconsulta')}
              className='min-h-[100px]'
              placeholder='Describa el cuadro clínico de la interconsulta'
            />
            {errors.cuadroClinicoInterconsulta && (
              <span className='text-sm text-red-500'>
                {errors.cuadroClinicoInterconsulta.message}
              </span>
            )}
          </div>
        </section>

        <Button type='submit' className='bg-primary text-white'>
          Crear Interconsulta
        </Button>
      </form>
    </div>
  );
}
