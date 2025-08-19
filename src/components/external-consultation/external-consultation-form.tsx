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
import { createInitialConsultation } from '@/services/consultation.service';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { PatientSelector } from '../shared/patient-selector';
import { Patient } from '@/services/patientService';
import AutocompleteCIE from '@/components/cie-10/autocompleteCIE';

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
  edad: z.preprocess((val) => {
    if (typeof val === 'string' && val !== '') {
      const num = Number(val);
      return isNaN(num) ? val : num;
    }
    return val;
  }, z.number().min(0, 'La edad debe ser un número positivo')),
  motivoConsulta: z.string().min(1, 'Campo obligatorio'),
  motivoConsultaPrimera: z.string().min(1, 'Campo obligatorio'),
  motivoConsultaSubsecuente: z.string().optional(),


  antecedentesPatologicosPersonales: z.preprocess((val) => {
    if (typeof val === 'string') {
      return val.split(',').map((item) => item.trim());
    }
    return Array.isArray(val) ? val : [];
  }, z.array(z.string()).optional().default([])),
  
  
  
  antecedentesPatologicosPersonalesDesc: z.preprocess((val) => {
    if (typeof val === 'string' && val.trim() === '') {
      return 'Ninguno'; // Provide default value instead of empty string
    }
    return val;
  }, z.string().min(1, 'Campo obligatorio')),

    antecedentesPatologicosFamiliares: z.preprocess((val) => {
      if (typeof val === 'string') {
        return val.split(',').map((item) => item.trim());
      }
      return Array.isArray(val) ? val : [];
    }, z.array(z.string()).optional().default([])),
  
  antecedentesPatologicosFamiliaresDesc: z.preprocess((val) => {
    if (typeof val === 'string' && val.trim() === '') {
      return 'Ninguno'; // Provide default value instead of empty string
    }
    return val;
  }, z.string().min(1, 'Campo obligatorio')),
  enfermedadActual: z.string().min(1, 'Campo obligatorio'),
  constantesVitales: z.object({
    fecha: z.string().min(1, 'Campo obligatorio'),
    hora: z.string().min(1, 'Campo obligatorio'),
    temperatura: z.preprocess((val) => {
      if (typeof val === 'string' && val !== '') {
        const num = Number(val);
        return isNaN(num) ? val : num;
      }
      return val;
    }, z.number()),
    presionArterial: z.string(),
    frecuenciaCardiaca: z.preprocess((val) => {
      if (typeof val === 'string' && val !== '') {
        const num = Number(val);
        return isNaN(num) ? val : num;
      }
      return val;
    }, z.number()),
    frecuenciaRespiratoria: z.preprocess((val) => {
      if (typeof val === 'string' && val !== '') {
        const num = Number(val);
        return isNaN(num) ? val : num;
      }
      return val;
    }, z.number()),
    peso: z.preprocess((val) => {
      if (typeof val === 'string' && val !== '') {
        const num = Number(val);
        return isNaN(num) ? val : num;
      }
      return val;
    }, z.number()),
    talla: z.preprocess((val) => {
      if (typeof val === 'string' && val !== '') {
        const num = Number(val);
        return isNaN(num) ? val : num;
      }
      return val;
    }, z.number()),
    imc: z.preprocess((val) => {
      if (typeof val === 'string' && val !== '') {
        const num = Number(val);
        return isNaN(num) ? val : num;
      }
      return val;
    }, z.number()),
    perimetroAbdominal: z.preprocess((val) => {
      if (typeof val === 'string' && val !== '') {
        const num = Number(val);
        return isNaN(num) ? val : num;
      }
      return val;
    }, z.number()),
    hemoglobinaCapilar: z.preprocess((val) => {
      if (typeof val === 'string' && val !== '') {
        const num = Number(val);
        return isNaN(num) ? val : num;
      }
      return val;
    }, z.number()),
    glucosaCapilar: z.preprocess((val) => {
      if (typeof val === 'string' && val !== '') {
        const num = Number(val);
        return isNaN(num) ? val : num;
      }
      return val;
    }, z.number()),
    pulsioximetria: z.preprocess((val) => {
      if (typeof val === 'string' && val !== '') {
        const num = Number(val);
        return isNaN(num) ? val : num;
      }
      return val;
    }, z.number()),
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
  patientId: z.string().optional(), 
});


type FormValues = z.infer<typeof formSchema>;

export default function ExternalConsultationForm() {
  const { data: session } = useSession();
  const { toast } = useToast();
  // const patient = session?.user?.team?.patient;
  const [diagnosticos, setDiagnosticos] = useState([{ desc: '', cie: '', presuntivo: false, definitivo: false }]);

  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);


  const agregarDiagnostico = () => {
    setDiagnosticos([...diagnosticos, { desc: '', cie: '', presuntivo: false, definitivo: false }]);
  };  

const eliminarDiagnostico = (index: number) => {
  const nuevosDiagnosticos = [...diagnosticos];
  nuevosDiagnosticos.splice(index, 1);
  setDiagnosticos(nuevosDiagnosticos);
};


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
    reset,
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
      antecedentesPatologicosFamiliaresDesc: 'Ninguno',
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
    console.log('Paciente seleccionado:', patient);
    setSelectedPatient(patient);
    setValue('primerApellido', patient.lastName);
    setValue('primerNombre', patient.name);
    setValue('sexo', patient.gender);
    setValue('numeroArchivo', patient.document);
    setValue('numeroHistoriaClinica', patient.document);
  
    // Calcular la edad a partir de la fecha de nacimiento
    if (patient.birthday) {
      const birthDate = new Date(patient.birthday);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      setValue('edad', age);
    }
  
    // Almacenar el ID del paciente para el envío
    if (selectedPatient) {
      setValue('patientId', selectedPatient.id);
    }
  };
  

  const onSubmit = async (data: FormValues) => {
    try {
      if (!session?.user) {
        toast({
          title: 'Error',
          description: 'No hay información del usuario',
          variant: 'destructive',
        });
        return;
      }
  
      const token = session.user.access_token;
      const tokenParts = token.split('.');
      const payload = JSON.parse(atob(tokenParts[1]));
      const userId = payload.id;
  
      if (!userId || !selectedPatient?.id) {
        toast({
          title: 'Error',
          description: 'No se pudo obtener el ID del usuario o paciente',
          variant: 'destructive',
        });
        return;
      }
  
      const formattedData = {
        motivoConsulta: data.motivoConsulta,
        antecedentesPatologicosPersonales: data.antecedentesPatologicosPersonales || [],
        antecedentesPatologicosPersonalesDesc: data.antecedentesPatologicosPersonalesDesc || 'Ninguno',
        antecedentesPatologicosFamiliares: data.antecedentesPatologicosFamiliares || [],
        antecedentesPatologicosFamiliaresDesc: data.antecedentesPatologicosFamiliaresDesc || 'Ninguno',
        enfermedadProblemaActual: data.enfermedadActual || '',
        cvaFecha: data.constantesVitales.fecha ? new Date(data.constantesVitales.fecha).toISOString() : '',
        cvaHora: data.constantesVitales.hora || '',
        cvaTemperatura: `${data.constantesVitales.temperatura} °C`,
        cvaPresionArterial: data.constantesVitales.presionArterial || '',
        cvaPulso: `${data.constantesVitales.frecuenciaCardiaca} bpm`,
        cvaFrecuenciaRespiratoria: `${data.constantesVitales.frecuenciaRespiratoria} rpm`,
        cvaPeso: `${data.constantesVitales.peso} kg`,
        cvaTalla: `${data.constantesVitales.talla} m`,
        cvaImc: data.constantesVitales.imc.toString(),
        cvaPerimetroAbdominal: `${data.constantesVitales.perimetroAbdominal} cm`,
        cvaHemoglobinaCapilar: `${data.constantesVitales.hemoglobinaCapilar} g/dL`,
        cvaGlucosaCapilar: `${data.constantesVitales.glucosaCapilar} mg/dL`,
        cvaPulsioximetria: `${data.constantesVitales.pulsioximetria}%`,
        organosSistemasPatologia: Object.keys(data.revisionOrganosSistemas).filter(
          key => data.revisionOrganosSistemas[key as keyof typeof data.revisionOrganosSistemas]
        ),
        organosSistemasPatologiaDesc: Object.values(data.revisionOrganosSistemas).filter(Boolean),
        examenFisicoPatologia: Object.keys(data.examenFisico).filter(
          key => data.examenFisico[key as keyof typeof data.examenFisico]
        ),
        examenFisicoPatologiaDesc: Object.values(data.examenFisico).filter(Boolean),
        diagnosticosDesc: diagnosticos.map(diag => diag.desc).filter(Boolean),
        diagnosticosCie: diagnosticos.map(diag => diag.cie).filter(Boolean),
        planTratamiento: data.planTratamiento || '',
        user: userId,
        patient: selectedPatient ? selectedPatient.id : '',
        institucionSistema: data.institucionSistema,
        unicodigo: data.unicodigo,
        establecimientoSalud: data.establecimientoSalud,
        numeroHistoriaClinica: data.numeroHistoriaClinica,
        numeroArchivo: data.numeroArchivo,
        numeroHoja: data.numeroHoja,
        primerApellido: data.primerApellido,
        segundoApellido: data.segundoApellido,
        primerNombre: data.primerNombre,
        segundoNombre: data.segundoNombre,
        sexo: data.sexo,
        edad: data.edad,
        motivoConsultaPrimera: data.motivoConsultaPrimera,
        motivoConsultaSubsecuente: data.motivoConsultaSubsecuente || '',
        antecedentesPersonales: { ...data.antecedentesPersonales },
        antecedentesFamiliares: { ...data.antecedentesFamiliares },
        enfermedadActual: data.enfermedadActual,
        constantesVitales: { ...data.constantesVitales },
      };
  
      await createInitialConsultation(formattedData);
  
      localStorage.removeItem('consultationFormData');

      // Reset form after successful submission
      reset();
      setSelectedPatient(null);
      setDiagnosticos([{ desc: '', cie: '', presuntivo: false, definitivo: false }]);
  
      toast({
        title: 'Éxito',
        description: 'Consulta creada correctamente',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: (error as Error).message || 'Error al crear la consulta',
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
  {...register('antecedentesPatologicosPersonales', {
    setValueAs: (val) => {
      if (typeof val === 'string' && val.trim() !== '') {
        return val.split(',').map((item) => item.trim());
      }
      return [];
    }
  })}
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
  {...register('antecedentesPersonales.cardiopatia', {
    setValueAs: (v) => !!v, // Convertir a booleano explícitamente
  })}
/>
                        <Label>Cardiopatía</Label>
                      </div>
                      <div className='flex items-center space-x-2'>
                        <Checkbox
                          {...register('antecedentesPersonales.hipertension', {
                            setValueAs: (v) => !!v, // Convertir a booleano explícitamente
                          })}
                        />
                        <Label>Hipertensión</Label>
                      </div>
                      <div className='flex items-center space-x-2'>
                        <Checkbox
                          {...register('antecedentesPersonales.ebyec', {
                            setValueAs: (v) => !!v, // Convertir a booleano explícitamente
                          })}
                        />
                        <Label>EBYEC</Label>
                      </div>
                      <div className='flex items-center space-x-2'>
                        <Checkbox
                          {...register(
                            'antecedentesPersonales.problemaMetabolico'
                            , {
                              setValueAs: (v) => !!v, // Convertir a booleano explícitamente
                            })}
                          />
                        <Label>Problema Metabólico</Label>
                      </div>
                      <div className='flex items-center space-x-2'>
                        <Checkbox
                          {...register('antecedentesPersonales.cancer', {
                            setValueAs: (v) => !!v, // Convertir a booleano explícitamente
                          })}
                        />
                        <Label>Cáncer</Label>
                      </div>
                      <div className='flex items-center space-x-2'>
                        <Checkbox
                          {...register('antecedentesPersonales.tuberculosis', {
                            setValueAs: (v) => !!v, // Convertir a booleano explícitamente
                          })}
                        />
                        <Label>Tuberculosis</Label>
                      </div>
                      <div className='flex items-center space-x-2'>
                        <Checkbox
                          {...register('antecedentesPersonales.enfMental', {
                            setValueAs: (v) => !!v, // Convertir a booleano explícitamente
                          })}
                        />
                        <Label>Enfermedad Mental</Label>
                      </div>
                      <div className='flex items-center space-x-2'>
                        <Checkbox
                          {...register('antecedentesPersonales.enfInfecciosa', {
                            setValueAs: (v) => !!v, // Convertir a booleano explícitamente
                          })}
                        />
                        <Label>Enfermedad Infecciosa</Label>
                      </div>
                      <div className='flex items-center space-x-2'>
                        <Checkbox
                          {...register('antecedentesPersonales.malformacion', {
                            setValueAs: (v) => !!v, // Convertir a booleano explícitamente
                          })}
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
  {...register('antecedentesPatologicosFamiliares', {
    setValueAs: (val) => {
      if (typeof val === 'string' && val.trim() !== '') {
        return val.split(',').map((item) => item.trim());
      }
      return [];
    }
  })}
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
                          {...register('antecedentesFamiliares.cardiopatia', {
                            setValueAs: (v) => !!v, // Convertir a booleano explícitamente
                          })}
                        />
                        <Label>Cardiopatía</Label>
                      </div>
                      <div className='flex items-center space-x-2'>
                        <Checkbox
                          {...register('antecedentesFamiliares.hipertension', {
                            setValueAs: (v) => !!v, // Convertir a booleano explícitamente
                          })}
                        />
                        <Label>Hipertensión</Label>
                      </div>
                      <div className='flex items-center space-x-2'>
                        <Checkbox
                          {...register('antecedentesFamiliares.ebyec', {
                            setValueAs: (v) => !!v, // Convertir a booleano explícitamente
                          })}
                        />
                        <Label>EBYEC</Label>
                      </div>
                      <div className='flex items-center space-x-2'>
                        <Checkbox
                          {...register(
                            'antecedentesFamiliares.problemaMetabolico'
                            , {
                              setValueAs: (v) => !!v, // Convertir a booleano explícitamente
                            })}
                          />
                        <Label>Problema Metabólico</Label>
                      </div>
                      <div className='flex items-center space-x-2'>
                        <Checkbox
                          {...register('antecedentesFamiliares.cancer', {
                            setValueAs: (v) => !!v, // Convertir a booleano explícitamente
                          })}
                        />
                        <Label>Cáncer</Label>
                      </div>
                      <div className='flex items-center space-x-2'>
                        <Checkbox
                          {...register('antecedentesFamiliares.tuberculosis', {
                            setValueAs: (v) => !!v, // Convertir a booleano explícitamente
                          })}
                        />
                        <Label>Tuberculosis</Label>
                      </div>
                      <div className='flex items-center space-x-2'>
                        <Checkbox
                          {...register('antecedentesFamiliares.enfMental', {
                            setValueAs: (v) => !!v, // Convertir a booleano explícitamente
                          })}
                        />
                        <Label>Enfermedad Mental</Label>
                      </div>
                      <div className='flex items-center space-x-2'>
                        <Checkbox
                          {...register('antecedentesFamiliares.enfInfecciosa', {
                            setValueAs: (v) => !!v, // Convertir a booleano explícitamente
                          })}
                        />
                        <Label>Enfermedad Infecciosa</Label>
                      </div>
                      <div className='flex items-center space-x-2'>
                        <Checkbox
                          {...register('antecedentesFamiliares.malformacion', {
    setValueAs: (v) => !!v, // Convertir a booleano explícitamente
  })}
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

{/* Sección I: Diagnósticos Dinámicos */}
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
