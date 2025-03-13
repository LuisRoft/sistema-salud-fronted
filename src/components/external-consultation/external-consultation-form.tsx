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
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { createInitialConsultation } from '@/services/consultation.service';
import { useToast } from '@/components/ui/use-toast';
import { useEffect, useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { PatientSelector } from '../shared/patient-selector';
import { Patient } from '@/services/patientService';

// Esquema de validación con Zod
const formSchema = z.object({
  institucionSistema: z.string().min(1, 'Campo obligatorio'),
  unicodigo: z.string().min(1, 'Campo obligatorio'),
  establecimientoSalud: z.string().min(1, 'Campo obligatorio'),
  numeroHistoriaClinica: z.string().min(1, 'Campo obligatorio'),
  numeroArchivo: z.string().min(1, 'Campo obligatorio'),
  numeroHoja: z.string().min(1, 'Campo obligatorio'),
  primerApellido: z.string().min(1, 'Campo obligatorio'),
  segundoApellido: z.string().optional(),
  primerNombre: z.string().min(1, 'Campo obligatorio'),
  segundoNombre: z.string().optional(),
  sexo: z.string().min(1, 'Campo obligatorio'),
  edad: z.number().min(0, 'La edad debe ser un número positivo'),
  motivoConsulta: z.string().min(1, 'Campo obligatorio'),
  motivoConsultaPrimera: z.string().min(1, 'Campo obligatorio'),
  motivoConsultaSubsecuente: z.string().optional(),
  antecedentesPatologicosPersonales: z.array(z.string()).optional(),
  antecedentesPatologicosPersonalesDesc: z.string().optional(),
  antecedentesPatologicosFamiliares: z.array(z.string()).optional(),
  antecedentesPatologicosFamiliaresDesc: z.string().optional(),
  enfermedadActual: z.string().min(1, 'Campo obligatorio'),
  constantesVitales: z.object({
    fecha: z.string().min(1, 'Campo obligatorio'),
    hora: z.string().min(1, 'Campo obligatorio'),
    temperatura: z.number(),
    presionArterial: z.string(),
    frecuenciaCardiaca: z.number(),
    frecuenciaRespiratoria: z.number(),
    peso: z.number(),
    talla: z.number(),
    imc: z.number(),
    perimetroAbdominal: z.number(),
    hemoglobinaCapilar: z.number(),
    glucosaCapilar: z.number(),
    pulsioximetria: z.number(),
  }),
  revisionOrganosSistemas: z.object({
    pielAnexos: z.string().optional(),
    organosSentidos: z.string().optional(),
    respiratorio: z.string().optional(),
    cardioVascular: z.string().optional(),
    digestivo: z.string().optional(),
    genitoUrinario: z.string().optional(),
    musculoEsqueletico: z.string().optional(),
    endocrino: z.string().optional(),
    hemolinfatico: z.string().optional(),
    nervioso: z.string().optional(),
  }),
  examenFisico: z.object({
    pielFaneras: z.string().optional(),
    cabeza: z.string().optional(),
    ojos: z.string().optional(),
    oidos: z.string().optional(),
    nariz: z.string().optional(),
    boca: z.string().optional(),
    cuello: z.string().optional(),
    torax: z.string().optional(),
    abdomen: z.string().optional(),
    genital: z.string().optional(),
    miembrosSuperiores: z.string().optional(),
    miembrosInferiores: z.string().optional(),
    columnaVertebral: z.string().optional(),
    inglePerine: z.string().optional(),
    axilasMamas: z.string().optional(),
  }),
  diagnostico: z.string().min(1, 'Campo obligatorio'),
  planTratamiento: z.string().min(1, 'Campo obligatorio'),
  antecedentesPersonales: z.object({
    cardiopatia: z.boolean(),
    hipertension: z.boolean(),
    ebyec: z.boolean(),
    problemaMetabolico: z.boolean(),
    cancer: z.boolean(),
    tuberculosis: z.boolean(),
    enfMental: z.boolean(),
    enfInfecciosa: z.boolean(),
    malformacion: z.boolean(),
    otro: z.string().optional(),
  }),
  antecedentesFamiliares: z.object({
    cardiopatia: z.boolean(),
    hipertension: z.boolean(),
    ebyec: z.boolean(),
    problemaMetabolico: z.boolean(),
    cancer: z.boolean(),
    tuberculosis: z.boolean(),
    enfMental: z.boolean(),
    enfInfecciosa: z.boolean(),
    malformacion: z.boolean(),
    otro: z.string().optional(),
  }),
});

type FormValues = z.infer<typeof formSchema>;

export default function ExternalConsultationForm() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const patient = session?.user?.team?.patient;

  // Obtener los datos guardados del localStorage
  const getSavedFormData = () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('consultationFormData');
      return saved ? JSON.parse(saved) : null;
    }
    return null;
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    // Usar los datos guardados como valores por defecto
    defaultValues: getSavedFormData() || {
      institucionSistema: 'Pucem',
      unicodigo: '',
      establecimientoSalud: 'Medicina',
      numeroHistoriaClinica: '',
      numeroArchivo: '',
      numeroHoja: '',
      primerApellido: '',
      segundoApellido: '',
      primerNombre: '',
      segundoNombre: '',
      sexo: '',
      edad: 0,
      motivoConsulta: '',
      motivoConsultaPrimera: '',
      motivoConsultaSubsecuente: '',
      antecedentesPatologicosPersonales: [],
      antecedentesPatologicosPersonalesDesc: '',
      antecedentesPatologicosFamiliares: [],
      antecedentesPatologicosFamiliaresDesc: '',
      enfermedadActual: '',
      constantesVitales: {
        fecha: '',
        hora: '',
        temperatura: 0,
        presionArterial: '',
        frecuenciaCardiaca: 0,
        frecuenciaRespiratoria: 0,
        peso: 0,
        talla: 0,
        imc: 0,
        perimetroAbdominal: 0,
        hemoglobinaCapilar: 0,
        glucosaCapilar: 0,
        pulsioximetria: 0,
      },
      revisionOrganosSistemas: {
        pielAnexos: '',
        organosSentidos: '',
        respiratorio: '',
        cardioVascular: '',
        digestivo: '',
        genitoUrinario: '',
        musculoEsqueletico: '',
        endocrino: '',
        hemolinfatico: '',
        nervioso: '',
      },
      examenFisico: {
        pielFaneras: '',
        cabeza: '',
        ojos: '',
        oidos: '',
        nariz: '',
        boca: '',
        cuello: '',
        torax: '',
        abdomen: '',
        genital: '',
        miembrosSuperiores: '',
        miembrosInferiores: '',
        columnaVertebral: '',
        inglePerine: '',
        axilasMamas: '',
      },
      diagnostico: '',
      planTratamiento: '',
      antecedentesPersonales: {
        cardiopatia: false,
        hipertension: false,
        ebyec: false,
        problemaMetabolico: false,
        cancer: false,
        tuberculosis: false,
        enfMental: false,
        enfInfecciosa: false,
        malformacion: false,
        otro: '',
      },
      antecedentesFamiliares: {
        cardiopatia: false,
        hipertension: false,
        ebyec: false,
        problemaMetabolico: false,
        cancer: false,
        tuberculosis: false,
        enfMental: false,
        enfInfecciosa: false,
        malformacion: false,
        otro: '',
      },
    },
  });

  // Guardar los datos en localStorage cuando cambien
  const formData = watch();
  useEffect(() => {
    localStorage.setItem('consultationFormData', JSON.stringify(formData));
  }, [formData]);

  const handlePatientSelect = (patient: Patient) => {
    // Auto-fill patient data
    setValue('primerApellido', patient.lastName);
    setValue('primerNombre', patient.name);
    setValue('sexo', patient.gender);
    setValue('numeroArchivo', patient.document);
    setValue('numeroHistoriaClinica', patient.document);

    // Calculate age from birthday if available
    if (patient.birthday) {
      const birthDate = new Date(patient.birthday);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      setValue('edad', age);
    }

    // Store patient ID for submission
    setValue('patientId', patient.id);
  };

  const onSubmit = async (data: any) => {
    try {
      if (!session?.user) {
        toast({
          title: 'Error',
          description: 'No hay información del usuario',
          variant: 'destructive',
        });
        return;
      }

      // Extraer el ID del usuario del token JWT
      const token = session.user.access_token;
      const tokenParts = token.split('.');
      const payload = JSON.parse(atob(tokenParts[1]));
      const userId = payload.id; // Este es el UUID que necesitamos: 5b33f942-102a-4621-94bc-343cfea257f0

      console.log('User ID from token:', userId);

      if (!userId || !patient?.id) {
        toast({
          title: 'Error',
          description: 'No se pudo obtener el ID del usuario o paciente',
          variant: 'destructive',
        });
        return;
      }

      // Obtener la hora actual en formato HH:mm
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      const formattedData = {
        // Datos del establecimiento
        institucionSistema: data.institucionSistema || '',
        unicodigo: data.unicodigo || '',
        establecimientoSalud: data.establecimientoSalud || '',
        numeroHistoriaClinica: data.numeroHistoriaClinica || '',
        numeroArchivo: data.numeroArchivo || '',
        numeroHoja: data.numeroHoja || '',

        // Datos del paciente
        primerApellido: data.primerApellido || '',
        segundoApellido: data.segundoApellido || '',
        primerNombre: data.primerNombre || '',
        segundoNombre: data.segundoNombre || '',
        sexo: data.sexo || '',
        edad: parseInt(data.edad) || 0,

        // Datos de la consulta
        motivoConsulta: data.motivoConsulta || data.motivoConsultaPrimera || '',
        motivoConsultaPrimera:
          data.motivoConsulta || data.motivoConsultaPrimera || '',
        motivoConsultaSubsecuente: data.motivoConsultaSubsecuente || '',
        antecedentesPatologicosPersonales:
          data.antecedentesPatologicosPersonales || [],
        antecedentesPatologicosPersonalesDesc:
          data.antecedentesPatologicosPersonalesDesc ||
          'Sin antecedentes personales',
        antecedentesPatologicosFamiliares:
          data.antecedentesPatologicosFamiliares || [],
        antecedentesPatologicosFamiliaresDesc:
          data.antecedentesPatologicosFamiliaresDesc ||
          'Sin antecedentes familiares',
        enfermedadProblemaActual: data.enfermedadActual || '',
        enfermedadActual: data.enfermedadActual || '',

        // Antecedentes
        antecedentesPersonales: {
          cardiopatia: Boolean(data.antecedentesPersonales?.cardiopatia),
          hipertension: Boolean(data.antecedentesPersonales?.hipertension),
          ebyec: Boolean(data.antecedentesPersonales?.ebyec),
          problemaMetabolico: Boolean(
            data.antecedentesPersonales?.problemaMetabolico
          ),
          cancer: Boolean(data.antecedentesPersonales?.cancer),
          tuberculosis: Boolean(data.antecedentesPersonales?.tuberculosis),
          enfMental: Boolean(data.antecedentesPersonales?.enfMental),
          enfInfecciosa: Boolean(data.antecedentesPersonales?.enfInfecciosa),
          malformacion: Boolean(data.antecedentesPersonales?.malformacion),
          otro: data.antecedentesPersonales?.otro || '',
        },

        antecedentesFamiliares: {
          cardiopatia: Boolean(data.antecedentesFamiliares?.cardiopatia),
          hipertension: Boolean(data.antecedentesFamiliares?.hipertension),
          ebyec: Boolean(data.antecedentesFamiliares?.ebyec),
          problemaMetabolico: Boolean(
            data.antecedentesFamiliares?.problemaMetabolico
          ),
          cancer: Boolean(data.antecedentesFamiliares?.cancer),
          tuberculosis: Boolean(data.antecedentesFamiliares?.tuberculosis),
          enfMental: Boolean(data.antecedentesFamiliares?.enfMental),
          enfInfecciosa: Boolean(data.antecedentesFamiliares?.enfInfecciosa),
          malformacion: Boolean(data.antecedentesFamiliares?.malformacion),
          otro: data.antecedentesFamiliares?.otro || '',
        },

        // Datos CVA
        cvaFecha: new Date().toISOString(),
        cvaHora: currentTime,
        cvaTemperatura: String(data.cvaTemperatura || ''),
        cvaPresionArterial: data.cvaPresionArterial || '',
        cvaPulso: String(data.cvaPulso || ''),
        cvaFrecuenciaRespiratoria: String(data.cvaFrecuenciaRespiratoria || ''),
        cvaPeso: String(data.cvaPeso || ''),
        cvaTalla: String(data.cvaTalla || ''),
        cvaImc: String(data.cvaImc || ''),
        cvaPerimetroAbdominal: String(data.cvaPerimetroAbdominal || ''),
        cvaHemoglobinaCapilar: String(data.cvaHemoglobinaCapilar || ''),
        cvaGlucosaCapilar: String(data.cvaGlucosaCapilar || ''),
        cvaPulsioximetria: String(data.cvaPulsioximetria || ''),

        // Constantes vitales como objeto
        constantesVitales: {
          fecha: new Date().toISOString(),
          hora: currentTime,
          temperatura: parseFloat(data.cvaTemperatura) || 0,
          presionArterial: data.cvaPresionArterial || '',
          frecuenciaCardiaca: parseFloat(data.cvaPulso) || 0,
          frecuenciaRespiratoria:
            parseFloat(data.cvaFrecuenciaRespiratoria) || 0,
          peso: parseFloat(data.cvaPeso) || 0,
          talla: parseFloat(data.cvaTalla) || 0,
          imc: parseFloat(data.cvaImc) || 0,
          perimetroAbdominal: parseFloat(data.cvaPerimetroAbdominal) || 0,
          hemoglobinaCapilar: parseFloat(data.cvaHemoglobinaCapilar) || 0,
          glucosaCapilar: parseFloat(data.cvaGlucosaCapilar) || 0,
          pulsioximetria: parseFloat(data.cvaPulsioximetria) || 0,
        },

        // Patologías y exámenes
        organosSistemasPatologia: Array.isArray(data.organosSistemasPatologia)
          ? data.organosSistemasPatologia
          : [],
        organosSistemasPatologiaDesc: Array.isArray(
          data.organosSistemasPatologiaDesc
        )
          ? data.organosSistemasPatologiaDesc
          : [],
        examenFisicoPatologia: Array.isArray(data.examenFisicoPatologia)
          ? data.examenFisicoPatologia
          : [],
        examenFisicoPatologiaDesc: Array.isArray(data.examenFisicoPatologiaDesc)
          ? data.examenFisicoPatologiaDesc
          : [],
        diagnosticosDesc: Array.isArray(data.diagnosticosDesc)
          ? data.diagnosticosDesc
          : [],
        diagnosticosCie: Array.isArray(data.diagnosticosCie)
          ? data.diagnosticosCie
          : [],

        // Plan de tratamiento
        planTratamiento: data.planTratamiento || '',

        // IDs
        user: userId,
        patient: patient.id,
      };

      console.log('Datos a enviar:', formattedData);

      const response = await createInitialConsultation(formattedData);
      toast({
        title: 'Éxito',
        description: 'Consulta creada correctamente',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Error al crear la consulta',
      });
    }
  };

  // Botón para limpiar el formulario
  const handleReset = () => {
    localStorage.removeItem('consultationFormData');
    window.location.reload();
  };

  return (
    <div className='rounded-lg bg-zinc-50 p-6 shadow dark:bg-gray-800'>
      <div className='space-y-6'>
        <div className='flex items-center justify-between'>
          <h2 className='text-2xl font-bold'>
            Consulta Externa - Anamnesis y Examen Físico
          </h2>
          <div className="flex gap-2">
            <PatientSelector onSelect={handlePatientSelect} />
            <Button
              type='button'
              variant='outline'
              onClick={handleReset}
              className='ml-4'
            >
              Limpiar Formulario
            </Button>
          </div>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <section className='mb-4'>
            <h3 className='mb-4 text-xl font-semibold'>
              A. Datos del Establecimiento y Usuario/Paciente
            </h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Institución del Sistema</TableHead>
                  <TableHead>Unicódigo</TableHead>
                  <TableHead>Establecimiento de Salud</TableHead>
                  <TableHead>Número de Historia Clínica Única</TableHead>
                  <TableHead>Número de Archivo</TableHead>
                  <TableHead>No. Hoja</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>
                    <Input {...register('institucionSistema')} />
                    {errors.institucionSistema && (
                      <p className='text-sm text-red-600 dark:text-red-400'>
                        {errors.institucionSistema.message}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>
                    <Input {...register('unicodigo')} />
                    {errors.unicodigo && (
                      <p className='text-sm text-red-600 dark:text-red-400'>
                        {errors.unicodigo.message}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>
                    <Input {...register('establecimientoSalud')} />
                    {errors.establecimientoSalud && (
                      <p className='text-sm text-red-600 dark:text-red-400'>
                        {errors.establecimientoSalud.message}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>
                    <Input {...register('numeroHistoriaClinica')} />
                    {errors.numeroHistoriaClinica && (
                      <p className='text-sm text-red-600 dark:text-red-400'>
                        {errors.numeroHistoriaClinica.message}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>
                    <Input {...register('numeroArchivo')} />
                    {errors.numeroArchivo && (
                      <p className='text-sm text-red-600 dark:text-red-400'>
                        {errors.numeroArchivo.message}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>
                    <Input {...register('numeroHoja')} />
                    {errors.numeroHoja && (
                      <p className='text-sm text-red-600 dark:text-red-400'>
                        {errors.numeroHoja.message}
                      </p>
                    )}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>

            <div className='mt-4 grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label>Primer Apellido</Label>
                <Input {...register('primerApellido')} />
                {errors.primerApellido && (
                  <p className='text-sm text-red-600 dark:text-red-400'>
                    {errors.primerApellido.message}
                  </p>
                )}
              </div>
              <div className='space-y-2'>
                <Label>Segundo Apellido</Label>
                <Input {...register('segundoApellido')} />
              </div>
              <div className='space-y-2'>
                <Label>Primer Nombre</Label>
                <Input {...register('primerNombre')} />
                {errors.primerNombre && (
                  <p className='text-sm text-red-600 dark:text-red-400'>
                    {errors.primerNombre.message}
                  </p>
                )}
              </div>
              <div className='space-y-2'>
                <Label>Segundo Nombre</Label>
                <Input {...register('segundoNombre')} />
              </div>
              <div className='space-y-2'>
                <Label>Sexo</Label>
                <Input {...register('sexo')} />
                {errors.sexo && (
                  <p className='text-sm text-red-600 dark:text-red-400'>
                    {errors.sexo.message}
                  </p>
                )}
              </div>
              <div className='space-y-2'>
                <Label>Edad (Años)</Label>
                <Input
                  type='number'
                  {...register('edad', { valueAsNumber: true })}
                />
                {errors.edad && (
                  <p className='text-sm text-red-600 dark:text-red-400'>
                    {errors.edad.message}
                  </p>
                )}
              </div>
            </div>
          </section>

          <section className='mb-4'>
            <h3 className='mb-4 text-xl font-semibold'>
              B. Motivo de Consulta y Enfermedad
            </h3>
            <div className='grid gap-4'>
              <div>
                <Label htmlFor='motivoConsulta'>Motivo de Consulta</Label>
                <Textarea
                  id='motivoConsulta'
                  {...register('motivoConsulta', {
                    required: 'Este campo es requerido',
                  })}
                  onChange={(e) => {
                    // Actualizar ambos campos al mismo tiempo
                    setValue('motivoConsulta', e.target.value);
                    setValue('motivoConsultaPrimera', e.target.value);
                  }}
                />
                {errors.motivoConsulta && (
                  <p className='text-sm text-red-600'>
                    {errors.motivoConsulta.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor='enfermedadActual'>Enfermedad Actual</Label>
                <Textarea
                  id='enfermedadActual'
                  {...register('enfermedadActual', {
                    required: 'Este campo es requerido',
                  })}
                />
                {errors.enfermedadActual && (
                  <p className='text-sm text-red-600'>
                    {errors.enfermedadActual.message}
                  </p>
                )}
              </div>
            </div>
          </section>

          <section className='mb-4'>
            <h3 className='mb-4 text-xl font-semibold'>C. Antecedentes</h3>
            <div className='grid gap-6'>
              {/* Antecedentes Patológicos Personales */}
              <div>
                <Label>Antecedentes Patológicos Personales</Label>
                <div className='space-y-4'>
                  <div className='grid grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <Label>Lista de Antecedentes</Label>
                      <Input
                        type='text'
                        {...register('antecedentesPatologicosPersonales')}
                        placeholder='Separar con comas (ej: Diabetes, Hipertensión)'
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label>Descripción</Label>
                      <Textarea
                        {...register('antecedentesPatologicosPersonalesDesc', {
                          required: 'Este campo es requerido',
                        })}
                      />
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <h4 className='font-medium'>
                      Antecedentes Personales Detallados
                    </h4>
                    <div className='grid grid-cols-3 gap-2 gap-y-3'>
                      <div className='flex items-center space-x-2'>
                        <Checkbox
                          {...register('antecedentesPersonales.cardiopatia')}
                        />
                        <Label>Cardiopatía</Label>
                      </div>
                      <div className='flex items-center space-x-2'>
                        <Checkbox
                          {...register('antecedentesPersonales.hipertension')}
                        />
                        <Label>Hipertensión</Label>
                      </div>
                      <div className='flex items-center space-x-2'>
                        <Checkbox
                          {...register('antecedentesPersonales.ebyec')}
                        />
                        <Label>EBYEC</Label>
                      </div>
                      <div className='flex items-center space-x-2'>
                        <Checkbox
                          {...register(
                            'antecedentesPersonales.problemaMetabolico'
                          )}
                        />
                        <Label>Problema Metabólico</Label>
                      </div>
                      <div className='flex items-center space-x-2'>
                        <Checkbox
                          {...register('antecedentesPersonales.cancer')}
                        />
                        <Label>Cáncer</Label>
                      </div>
                      <div className='flex items-center space-x-2'>
                        <Checkbox
                          {...register('antecedentesPersonales.tuberculosis')}
                        />
                        <Label>Tuberculosis</Label>
                      </div>
                      <div className='flex items-center space-x-2'>
                        <Checkbox
                          {...register('antecedentesPersonales.enfMental')}
                        />
                        <Label>Enfermedad Mental</Label>
                      </div>
                      <div className='flex items-center space-x-2'>
                        <Checkbox
                          {...register('antecedentesPersonales.enfInfecciosa')}
                        />
                        <Label>Enfermedad Infecciosa</Label>
                      </div>
                      <div className='flex items-center space-x-2'>
                        <Checkbox
                          {...register('antecedentesPersonales.malformacion')}
                        />
                        <Label>Malformación</Label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Antecedentes Patológicos Familiares */}
              <div>
                <Label>Antecedentes Patológicos Familiares</Label>
                <div className='space-y-4'>
                  <div className='grid grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <Label>Lista de Antecedentes</Label>
                      <Input
                        type='text'
                        {...register('antecedentesPatologicosFamiliares')}
                        placeholder='Separar con comas (ej: Cáncer, Diabetes)'
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label>Descripción</Label>
                      <Textarea
                        {...register('antecedentesPatologicosFamiliaresDesc', {
                          required: 'Este campo es requerido',
                        })}
                      />
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <h4 className='font-medium'>
                      Antecedentes Familiares Detallados
                    </h4>
                    <div className='grid grid-cols-3 gap-2 gap-y-3'>
                      <div className='flex items-center space-x-2'>
                        <Checkbox
                          {...register('antecedentesFamiliares.cardiopatia')}
                        />
                        <Label>Cardiopatía</Label>
                      </div>
                      <div className='flex items-center space-x-2'>
                        <Checkbox
                          {...register('antecedentesFamiliares.hipertension')}
                        />
                        <Label>Hipertensión</Label>
                      </div>
                      <div className='flex items-center space-x-2'>
                        <Checkbox
                          {...register('antecedentesFamiliares.ebyec')}
                        />
                        <Label>EBYEC</Label>
                      </div>
                      <div className='flex items-center space-x-2'>
                        <Checkbox
                          {...register(
                            'antecedentesFamiliares.problemaMetabolico'
                          )}
                        />
                        <Label>Problema Metabólico</Label>
                      </div>
                      <div className='flex items-center space-x-2'>
                        <Checkbox
                          {...register('antecedentesFamiliares.cancer')}
                        />
                        <Label>Cáncer</Label>
                      </div>
                      <div className='flex items-center space-x-2'>
                        <Checkbox
                          {...register('antecedentesFamiliares.tuberculosis')}
                        />
                        <Label>Tuberculosis</Label>
                      </div>
                      <div className='flex items-center space-x-2'>
                        <Checkbox
                          {...register('antecedentesFamiliares.enfMental')}
                        />
                        <Label>Enfermedad Mental</Label>
                      </div>
                      <div className='flex items-center space-x-2'>
                        <Checkbox
                          {...register('antecedentesFamiliares.enfInfecciosa')}
                        />
                        <Label>Enfermedad Infecciosa</Label>
                      </div>
                      <div className='flex items-center space-x-2'>
                        <Checkbox
                          {...register('antecedentesFamiliares.malformacion')}
                        />
                        <Label>Malformación</Label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Sección F: Constantes Vitales y Antropometría */}
          <section className='mb-4'>
            <h3 className='mb-4 text-xl font-semibold'>
              F. Constantes Vitales y Antropometría
            </h3>
            <div className='grid grid-cols-3 gap-4'>
              <div className='space-y-2'>
                <Label>Fecha</Label>
                <Input type='date' {...register('constantesVitales.fecha')} />
                {errors.constantesVitales?.fecha && (
                  <p className='text-sm text-red-600 dark:text-red-400'>
                    {errors.constantesVitales.fecha.message}
                  </p>
                )}
              </div>
              <div className='space-y-2'>
                <Label>Hora</Label>
                <Input type='time' {...register('constantesVitales.hora')} />
                {errors.constantesVitales?.hora && (
                  <p className='text-sm text-red-600 dark:text-red-400'>
                    {errors.constantesVitales.hora.message}
                  </p>
                )}
              </div>
              <div className='space-y-2'>
                <Label>Temperatura (°C)</Label>
                <Input
                  type='number'
                  {...register('constantesVitales.temperatura', {
                    valueAsNumber: true,
                  })}
                />
                {errors.constantesVitales?.temperatura && (
                  <p className='text-sm text-red-600 dark:text-red-400'>
                    {errors.constantesVitales.temperatura.message}
                  </p>
                )}
              </div>
              <div className='space-y-2'>
                <Label>Presión Arterial (mmHg)</Label>
                <Input {...register('constantesVitales.presionArterial')} />
                {errors.constantesVitales?.presionArterial && (
                  <p className='text-sm text-red-600 dark:text-red-400'>
                    {errors.constantesVitales.presionArterial.message}
                  </p>
                )}
              </div>
              <div className='space-y-2'>
                <Label>Frecuencia Cardíaca (/min)</Label>
                <Input
                  type='number'
                  {...register('constantesVitales.frecuenciaCardiaca', {
                    valueAsNumber: true,
                  })}
                />
                {errors.constantesVitales?.frecuenciaCardiaca && (
                  <p className='text-sm text-red-600 dark:text-red-400'>
                    {errors.constantesVitales.frecuenciaCardiaca.message}
                  </p>
                )}
              </div>
              <div className='space-y-2'>
                <Label>Frecuencia Respiratoria (/min)</Label>
                <Input
                  type='number'
                  {...register('constantesVitales.frecuenciaRespiratoria', {
                    valueAsNumber: true,
                  })}
                />
                {errors.constantesVitales?.frecuenciaRespiratoria && (
                  <p className='text-sm text-red-600 dark:text-red-400'>
                    {errors.constantesVitales.frecuenciaRespiratoria.message}
                  </p>
                )}
              </div>
              <div className='space-y-2'>
                <Label>Peso (kg)</Label>
                <Input
                  type='number'
                  {...register('constantesVitales.peso', {
                    valueAsNumber: true,
                  })}
                />
                {errors.constantesVitales?.peso && (
                  <p className='text-sm text-red-600 dark:text-red-400'>
                    {errors.constantesVitales.peso.message}
                  </p>
                )}
              </div>
              <div className='space-y-2'>
                <Label>Talla (cm)</Label>
                <Input
                  type='number'
                  {...register('constantesVitales.talla', {
                    valueAsNumber: true,
                  })}
                />
                {errors.constantesVitales?.talla && (
                  <p className='text-sm text-red-600 dark:text-red-400'>
                    {errors.constantesVitales.talla.message}
                  </p>
                )}
              </div>
              <div className='space-y-2'>
                <Label>IMC (kg/m²)</Label>
                <Input
                  type='number'
                  {...register('constantesVitales.imc', {
                    valueAsNumber: true,
                  })}
                />
                {errors.constantesVitales?.imc && (
                  <p className='text-sm text-red-600 dark:text-red-400'>
                    {errors.constantesVitales.imc.message}
                  </p>
                )}
              </div>
              <div className='space-y-2'>
                <Label>Perímetro Abdominal (cm)</Label>
                <Input
                  type='number'
                  {...register('constantesVitales.perimetroAbdominal', {
                    valueAsNumber: true,
                  })}
                />
                {errors.constantesVitales?.perimetroAbdominal && (
                  <p className='text-sm text-red-600 dark:text-red-400'>
                    {errors.constantesVitales.perimetroAbdominal.message}
                  </p>
                )}
              </div>
              <div className='space-y-2'>
                <Label>Hemoglobina Capilar (g/dl)</Label>
                <Input
                  type='number'
                  {...register('constantesVitales.hemoglobinaCapilar', {
                    valueAsNumber: true,
                  })}
                />
                {errors.constantesVitales?.hemoglobinaCapilar && (
                  <p className='text-sm text-red-600 dark:text-red-400'>
                    {errors.constantesVitales.hemoglobinaCapilar.message}
                  </p>
                )}
              </div>
              <div className='space-y-2'>
                <Label>Glucosa Capilar (mg/dl)</Label>
                <Input
                  type='number'
                  {...register('constantesVitales.glucosaCapilar', {
                    valueAsNumber: true,
                  })}
                />
                {errors.constantesVitales?.glucosaCapilar && (
                  <p className='text-sm text-red-600 dark:text-red-400'>
                    {errors.constantesVitales.glucosaCapilar.message}
                  </p>
                )}
              </div>
              <div className='space-y-2'>
                <Label>Pulsoximetría (%)</Label>
                <Input
                  type='number'
                  {...register('constantesVitales.pulsioximetria', {
                    valueAsNumber: true,
                  })}
                />
                {errors.constantesVitales?.pulsioximetria && (
                  <p className='text-sm text-red-600 dark:text-red-400'>
                    {errors.constantesVitales.pulsioximetria.message}
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Sección G: Revisión de Órganos y Sistemas */}
          <section className='mb-4'>
            <h3 className='mb-4 text-xl font-semibold'>
              G. Revisión de Órganos y Sistemas
            </h3>
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label>Piel y Anexos</Label>
                <Input {...register('revisionOrganosSistemas.pielAnexos')} />
              </div>
              <div className='space-y-2'>
                <Label>Órganos de los Sentidos</Label>
                <Input
                  {...register('revisionOrganosSistemas.organosSentidos')}
                />
              </div>
              <div className='space-y-2'>
                <Label>Respiratorio</Label>
                <Input {...register('revisionOrganosSistemas.respiratorio')} />
              </div>
              <div className='space-y-2'>
                <Label>Cardio - Vascular</Label>
                <Input
                  {...register('revisionOrganosSistemas.cardioVascular')}
                />
              </div>
              <div className='space-y-2'>
                <Label>Digestivo</Label>
                <Input {...register('revisionOrganosSistemas.digestivo')} />
              </div>
              <div className='space-y-2'>
                <Label>Genito - Urinario</Label>
                <Input
                  {...register('revisionOrganosSistemas.genitoUrinario')}
                />
              </div>
              <div className='space-y-2'>
                <Label>Músculo - Esquelético</Label>
                <Input
                  {...register('revisionOrganosSistemas.musculoEsqueletico')}
                />
              </div>
              <div className='space-y-2'>
                <Label>Endocrino</Label>
                <Input {...register('revisionOrganosSistemas.endocrino')} />
              </div>
              <div className='space-y-2'>
                <Label>Hemo - Linfático</Label>
                <Input {...register('revisionOrganosSistemas.hemolinfatico')} />
              </div>
              <div className='space-y-2'>
                <Label>Nervioso</Label>
                <Input {...register('revisionOrganosSistemas.nervioso')} />
              </div>
            </div>
          </section>

          {/* Sección H: Examen Físico */}
          <section className='mb-4'>
            <h3 className='mb-4 text-xl font-semibold'>H. Examen Físico</h3>
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label>Piel y Faneras</Label>
                <Input {...register('examenFisico.pielFaneras')} />
              </div>
              <div className='space-y-2'>
                <Label>Cabeza</Label>
                <Input {...register('examenFisico.cabeza')} />
              </div>
              <div className='space-y-2'>
                <Label>Ojos</Label>
                <Input {...register('examenFisico.ojos')} />
              </div>
              <div className='space-y-2'>
                <Label>Oídos</Label>
                <Input {...register('examenFisico.oidos')} />
              </div>
              <div className='space-y-2'>
                <Label>Nariz</Label>
                <Input {...register('examenFisico.nariz')} />
              </div>
              <div className='space-y-2'>
                <Label>Boca</Label>
                <Input {...register('examenFisico.boca')} />
              </div>
              <div className='space-y-2'>
                <Label>Cuello</Label>
                <Input {...register('examenFisico.cuello')} />
              </div>
              <div className='space-y-2'>
                <Label>Tórax</Label>
                <Input {...register('examenFisico.torax')} />
              </div>
              <div className='space-y-2'>
                <Label>Abdomen</Label>
                <Input {...register('examenFisico.abdomen')} />
              </div>
              <div className='space-y-2'>
                <Label>Genital</Label>
                <Input {...register('examenFisico.genital')} />
              </div>
              <div className='space-y-2'>
                <Label>Miembros Superiores</Label>
                <Input {...register('examenFisico.miembrosSuperiores')} />
              </div>
              <div className='space-y-2'>
                <Label>Miembros Inferiores</Label>
                <Input {...register('examenFisico.miembrosInferiores')} />
              </div>
              <div className='space-y-2'>
                <Label>Columna Vertebral</Label>
                <Input {...register('examenFisico.columnaVertebral')} />
              </div>
              <div className='space-y-2'>
                <Label>Ingle - Periné</Label>
                <Input {...register('examenFisico.inglePerine')} />
              </div>
              <div className='space-y-2'>
                <Label>Axilas - Mamas</Label>
                <Input {...register('examenFisico.axilasMamas')} />
              </div>
            </div>
          </section>

          {/* Sección I: Diagnóstico */}
          <section className='mb-4'>
            <h3 className='mb-4 text-xl font-semibold'>I. Diagnóstico</h3>
            <div className='space-y-2'>
              <Label>Diagnóstico</Label>
              <Input {...register('diagnostico')} />
              {errors.diagnostico && (
                <p className='text-sm text-red-600 dark:text-red-400'>
                  {errors.diagnostico.message}
                </p>
              )}
            </div>
          </section>

          {/* Sección J: Plan de Tratamiento */}
          <section className='mb-4'>
            <h3 className='mb-4 text-xl font-semibold'>
              J. Plan de Tratamiento
            </h3>
            <div className='space-y-2'>
              <Label>Plan de Tratamiento</Label>
              <Input {...register('planTratamiento')} />
              {errors.planTratamiento && (
                <p className='text-sm text-red-600 dark:text-red-400'>
                  {errors.planTratamiento.message}
                </p>
              )}
            </div>
          </section>

          {/* Botón de envío */}
          <div className='mt-6'>
            <Button type='submit' className='bg-primary text-white'>
              Guardar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
