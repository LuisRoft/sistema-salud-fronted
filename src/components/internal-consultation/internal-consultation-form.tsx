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
import AutocompleteCIE from '@/components/cie-10/autocompleteCIE';
import { Patient } from '@/services/patientService';

const formSchema = z.object({
  numeroDeArchivo: z.number().min(1, 'Campo obligatorio'),
  fecha: z.string().min(1, 'Campo obligatorio'),
  motivoConsulta: z.string().min(1, 'Campo obligatorio'),
  servicio: z.string().min(1, 'Campo obligatorio'),
  especialidadConsultada: z.string().min(1, 'Campo obligatorio'),
  esUrgente: z.boolean(),
  cuadroClinicoActual: z.string().min(1, 'Campo obligatorio'),
  examenesResultados: z.array(z.string()).optional(),
  diagnosticoGeneral: z.string().min(1, 'Campo obligatorio'), // Campo agregado
  diagnosticosDesc: z.array(z.string()).optional(),
  diagnosticosCie: z.array(z.string()).optional(),
  diagnosticosPresuntivo: z.array(z.boolean()).optional(),
  diagnosticosDefinitivo: z.array(z.boolean()).optional(),
  planTratamiento: z.string().min(1, 'Campo obligatorio'), // Campo agregado
  cuadroClinicoInterconsulta: z.string().optional(), // Campo agregado
  planDiagnosticoPropuesto: z.string().optional(), // Campo agregado
  planTerapeuticoPropuesto: z.string().min(1, 'Campo obligatorio'),
  patientId: z.string().min(1, 'Campo obligatorio'), // Agregado aquí
});

type FormValues = z.infer<typeof formSchema>;

export default function InternalConsultationForm() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

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
      diagnosticoGeneral: '', 
      diagnosticosDesc: [],
      diagnosticosCie: [],
      diagnosticosPresuntivo: [],
      diagnosticosDefinitivo: [],
      planTratamiento: '', // Valor predeterminado agregado
      cuadroClinicoInterconsulta: '', // Valor predeterminado agregado
      planDiagnosticoPropuesto: '', // Valor predeterminado agregado
      planTerapeuticoPropuesto: '',
    },
  });
   
  const handlePatientSelect = (patient: Patient) => {
    console.log('Paciente seleccionado:', patient); // Verificar el objeto completo
    setSelectedPatient(patient); // Guardar el paciente en el estado
    setValue('numeroDeArchivo', Number(patient.document));
    setValue('fecha', patient.birthday);
    setValue('cuadroClinicoActual', patient.typeDisability);
    setValue('patientId', patient.id); // Utilizar el objeto `patient` directamente
  };
  
  

  const [diagnosticos, setDiagnosticos] = useState<{ desc: string; cie: string; presuntivo: boolean; definitivo: boolean; }[]>([
    { desc: '', cie: '', presuntivo: false, definitivo: false },
  ]);
  const [examenes, setExamenes] = useState(['']);

  const agregarDiagnostico = () => {
    setDiagnosticos([
      ...diagnosticos,
      { desc: '', cie: '', presuntivo: false, definitivo: false },
    ]);
  };

  const eliminarDiagnostico = (index: number) => {
  const nuevosDiagnosticos = [...diagnosticos];
  nuevosDiagnosticos.splice(index, 1);
  setDiagnosticos(nuevosDiagnosticos);
};

  const agregarExamen = () => {
    setExamenes([...examenes, '']);
  };

  const eliminarExamen = (index: number) => {
    const nuevosExamenes = [...examenes];
    nuevosExamenes.splice(index, 1);
    setExamenes(nuevosExamenes);
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
  
      if (!selectedPatient) {
        toast({
          title: 'Error',
          description: 'No se ha seleccionado un paciente',
          variant: 'destructive',
        });
        return;
      }
  
      const token = sessionData.user.access_token;
      const tokenParts = token.split('.');
      const payload = JSON.parse(atob(tokenParts[1]));
      const userId = payload.id;
  
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
        planTratamiento: data.planTratamiento?.trim() ?? '',
        cuadroClinicoInterconsulta: data.cuadroClinicoInterconsulta?.trim() ?? '',
        planDiagnosticoPropuesto: data.planDiagnosticoPropuesto?.trim() ?? '',
        planTerapeuticoPropuesto: data.planTerapeuticoPropuesto?.trim() ?? '',
        user: userId,
        patient: selectedPatient?.id, // Verificar que el paciente esté seleccionado
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

{/* Sección D: Diagnóstico General */}
<section className='mb-4'>
  <h3 className='mb-4 text-xl font-semibold'>D. Diagnóstico</h3>
  <div className='space-y-2'>
    <Label>Diagnóstico General</Label>
    <Input {...register('diagnosticoGeneral')} />
    {errors.diagnosticoGeneral && (
      <p className='text-sm text-red-600 dark:text-red-400'>
        {errors.diagnosticoGeneral.message}
      </p>
    )}
  </div>
</section>

{/* Sección II: Diagnósticos Dinámicos */}
<section className='mb-4'>
  <div className='flex items-center justify-end mb-2'>
    <Button
      type='button'
      onClick={agregarDiagnostico}
      variant='outline'
      className='flex items-center gap-2 rounded-md border border-blue-500 text-blue-400 hover:bg-blue-800 hover:text-white px-4 py-2'
    >
      <svg
        xmlns='http://www.w3.org/2000/svg'
        fill='none'
        viewBox='0 0 24 24'
        strokeWidth={2}
        stroke='currentColor'
        className='w-5 h-5'
      >
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          d='M12 4.5v15m7.5-7.5h-15'
        />
      </svg>
      Agregar Diagnóstico
    </Button>
  </div>

  {diagnosticos.map((diag, index) => (
    <div
      key={index}
      className='relative grid grid-cols-2 gap-x-4 gap-y-2 rounded border bg-input p-4 mb-2'
    >
      <div className='space-y-2'>
        <Label>Descripción del Diagnóstico</Label>
        <Input
          value={diag.desc}
          onChange={(e) => {
            const nuevosDiagnosticos = [...diagnosticos];
            nuevosDiagnosticos[index].desc = e.target.value;
            setDiagnosticos(nuevosDiagnosticos);
          }}
          placeholder='Ej: Hipertensión esencial'
          className='bg-zinc-50 dark:bg-gray-800'
        />
      </div>

      <div className='space-y-2'>
  <Label>Código CIE</Label>
  <AutocompleteCIE
    onSelect={(cie, desc) => {
      const nuevosDiagnosticos = [...diagnosticos];
      nuevosDiagnosticos[index].cie = cie;
      nuevosDiagnosticos[index].desc = desc;
      setDiagnosticos(nuevosDiagnosticos);
    }}
  />
</div>

      {/* Opciones de Diagnóstico: Presuntivo y Definitivo */}
      <div className='flex space-x-4'>
        <label className='flex items-center space-x-2'>
          <input
            type='checkbox'
            checked={diag.presuntivo || false}
            onChange={(e) => {
              const nuevosDiagnosticos = [...diagnosticos];
              nuevosDiagnosticos[index].presuntivo = e.target.checked;
              setDiagnosticos(nuevosDiagnosticos);
            }}
          />
          <span>Presuntivo</span>
        </label>
        <label className='flex items-center space-x-2'>
          <input
            type='checkbox'
            checked={diag.definitivo || false}
            onChange={(e) => {
              const nuevosDiagnosticos = [...diagnosticos];
              nuevosDiagnosticos[index].definitivo = e.target.checked;
              setDiagnosticos(nuevosDiagnosticos);
            }}
          />
          <span>Definitivo</span>
        </label>
      </div>

      {/* Botón de Eliminar */}
      <Button
        type='button'
        variant='ghost'
        size='icon'
        className='absolute top-2 right-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20'
        onClick={() => eliminarDiagnostico(index)}
      >
        <svg
          xmlns='http://www.w3.org/2000/svg'
          fill='currentColor'
          viewBox='0 0 24 24'
          className='w-6 h-6'
        >
          <path d='M9 3v1H4v2h16V4h-5V3H9zM7 8v12c0 1.1.9 2 2 2h6c1.1 0 2-.9 2-2V8H7zm4 2h2v8h-2v-8z' />
        </svg>
      </Button>
    </div>
  ))}
</section>


        {/* Sección: Exámenes */}
        <section className='space-y-4'>
  <div className='flex items-center justify-between'>
    <h3 className='text-xl font-semibold'>Exámenes y Resultados</h3>
    {/* Botón de Agregar Examen */}
    <Button
      type='button'
      onClick={agregarExamen}
      variant='outline'
      className='flex items-center gap-2 rounded-md border border-green-500 text-green-400 hover:bg-green-800 hover:text-white px-4 py-2'
    >
      <svg
        xmlns='http://www.w3.org/2000/svg'
        fill='none'
        viewBox='0 0 24 24'
        strokeWidth={2}
        stroke='currentColor'
        className='w-5 h-5'
      >
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          d='M12 4.5v15m7.5-7.5h-15'
        />
      </svg>
      Agregar Examen
    </Button>
  </div>

  {examenes.map((examen, index) => (
    <div
      key={index}
      className='relative flex items-center gap-4 rounded border bg-input p-4'
    >
      <Input
        value={examen}
        onChange={(e) => {
          const nuevosExamenes = [...examenes];
          nuevosExamenes[index] = e.target.value;
          setExamenes(nuevosExamenes);
        }}
        placeholder='Ej: Hemograma normal'
        className='flex-1'
      />

      {/* Botón de Eliminar Examen */}
      <Button
        type='button'
        variant='ghost'
        size='icon'
        className='ml-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20'
        onClick={() => eliminarExamen(index)}
      >
        <svg
          xmlns='http://www.w3.org/2000/svg'
          fill='currentColor'
          viewBox='0 0 24 24'
          className='w-6 h-6'
        >
          <path d='M9 3v1H4v2h16V4h-5V3H9zM7 8v12c0 1.1.9 2 2 2h6c1.1 0 2-.9 2-2V8H7zm4 2h2v8h-2v-8z' />
        </svg>
      </Button>
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
