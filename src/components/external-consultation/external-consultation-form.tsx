'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Users, 
  FileText, 
  Heart, 
  Activity, 
  Stethoscope, 
  ClipboardList, 
  Plus, 
  Trash2,
  Save,
  RotateCcw,
  AlertCircle,
  Calendar,
  Clock
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { createInitialConsultation } from '@/services/consultation.service';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';
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
      return 'Ninguno';
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
      return 'Ninguno';
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

export default function ExternalConsultationFormImproved() {
  const { data: session } = useSession();
  const { toast } = useToast();
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
    formState: { errors, isValid, isSubmitting },
    watch,
    setValue,
    reset,
    trigger,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
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
      antecedentesPatologicosPersonalesDesc: 'Ninguno',
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
  
    if (patient.birthday) {
      const birthDate = new Date(patient.birthday);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      setValue('edad', age);
    }
  
    if (selectedPatient) {
      setValue('patientId', selectedPatient.id);
    }
  };

  const onSubmit = async (data: FormValues) => {
    try {
      console.log('🔄 INICIO DEL SUBMIT - Función onSubmit ejecutada');
      console.log('📊 Datos del formulario recibidos:', data);
      console.log('👤 Sesión actual:', session);
      console.log('🏥 Paciente seleccionado:', selectedPatient);
      console.log('🩺 Diagnósticos:', diagnosticos);
      console.log('❗ Errores de validación actuales:', errors);

      if (!session?.user) {
        console.error('❌ No hay sesión de usuario');
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
        console.error('❌ Falta userId o patientId:', { userId, patientId: selectedPatient?.id });
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
        diagnosticosDesc: [data.diagnostico, ...diagnosticos.map(diag => diag.desc)].filter(Boolean),
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
        motivoConsultaPrimera: data.motivoConsulta, // Auto-llenar desde motivoConsulta
        motivoConsultaSubsecuente: data.motivoConsultaSubsecuente || '',
        antecedentesPersonales: { ...data.antecedentesPersonales },
        antecedentesFamiliares: { ...data.antecedentesFamiliares },
        enfermedadActual: data.enfermedadActual,
        constantesVitales: { ...data.constantesVitales },
      };

      console.log('📤 Datos formateados para envío:', formattedData);
  
      const response = await createInitialConsultation(formattedData);
      console.log('✅ Respuesta del servidor:', response);
  
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
      console.error('❌ Error al enviar consulta:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: (error as Error).message || 'Error al crear la consulta',
      });
    }
  };

  const handleReset = () => {
    localStorage.removeItem('consultationFormData');
    
    // Reset all form fields to default values
    reset({
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
      antecedentesPatologicosPersonalesDesc: 'Ninguno',
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
    });
    
    // Reset local states
    setSelectedPatient(null);
    setDiagnosticos([{ desc: '', cie: '', presuntivo: false, definitivo: false }]);
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg dark:bg-blue-900">
                  <Stethoscope className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                    Consulta Externa
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-300">
                    Anamnesis y Examen Físico Completo
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {selectedPatient && (
                  <Badge variant="secondary" className="flex items-center space-x-2">
                    <Users className="w-4 h-4" />
                    <span>{selectedPatient.name} {selectedPatient.lastName}</span>
                  </Badge>
                )}
                <PatientSelector onSelect={handlePatientSelect} />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                  className="flex items-center space-x-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Limpiar</span>
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        <form onSubmit={(e) => {
          console.log('🖱️ EVENTO SUBMIT CAPTURADO - Formulario enviado');
          console.log('📋 Es válido?:', isValid);
          console.log('📋 Está enviando?:', isSubmitting);
          console.log('❗ Errores visibles:', errors);
          console.log('🔍 Todos los errores (incluyendo ocultos):', Object.keys(errors).length > 0 ? errors : 'No hay errores en el objeto');
          
          // Vamos a obtener los datos actuales del formulario para ver qué falta
          const currentData = watch();
          console.log('📊 Datos actuales del formulario:', currentData);
          
          handleSubmit(onSubmit)(e);
        }} className="space-y-6">
          {/* Datos del Establecimiento */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-gray-600" />
                <span>A. Datos del Establecimiento y Paciente</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Primera fila - Datos del establecimiento */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="institucionSistema" className="text-sm font-medium">
                    Institución del Sistema *
                  </Label>
                  <Input 
                    id="institucionSistema"
                    {...register('institucionSistema')} 
                    className={errors.institucionSistema ? "border-red-500" : ""}
                  />
                  {errors.institucionSistema && (
                    <p className="text-sm text-red-600 flex items-center space-x-1">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errors.institucionSistema.message}</span>
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unicodigo" className="text-sm font-medium">
                    Unicódigo *
                  </Label>
                  <Input 
                    id="unicodigo"
                    {...register('unicodigo')} 
                    className={errors.unicodigo ? "border-red-500" : ""}
                  />
                  {errors.unicodigo && (
                    <p className="text-sm text-red-600 flex items-center space-x-1">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errors.unicodigo.message}</span>
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="establecimientoSalud" className="text-sm font-medium">
                    Establecimiento de Salud *
                  </Label>
                  <Input 
                    id="establecimientoSalud"
                    {...register('establecimientoSalud')} 
                    className={errors.establecimientoSalud ? "border-red-500" : ""}
                  />
                  {errors.establecimientoSalud && (
                    <p className="text-sm text-red-600 flex items-center space-x-1">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errors.establecimientoSalud.message}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Segunda fila - Números de archivo */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="numeroHistoriaClinica" className="text-sm font-medium">
                    No. Historia Clínica *
                  </Label>
                  <Input 
                    id="numeroHistoriaClinica"
                    {...register('numeroHistoriaClinica')} 
                    className={errors.numeroHistoriaClinica ? "border-red-500" : ""}
                  />
                  {errors.numeroHistoriaClinica && (
                    <p className="text-sm text-red-600 flex items-center space-x-1">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errors.numeroHistoriaClinica.message}</span>
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="numeroArchivo" className="text-sm font-medium">
                    No. Archivo *
                  </Label>
                  <Input 
                    id="numeroArchivo"
                    {...register('numeroArchivo')} 
                    className={errors.numeroArchivo ? "border-red-500" : ""}
                  />
                  {errors.numeroArchivo && (
                    <p className="text-sm text-red-600 flex items-center space-x-1">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errors.numeroArchivo.message}</span>
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="numeroHoja" className="text-sm font-medium">
                    No. Hoja *
                  </Label>
                  <Input 
                    id="numeroHoja"
                    {...register('numeroHoja')} 
                    className={errors.numeroHoja ? "border-red-500" : ""}
                  />
                  {errors.numeroHoja && (
                    <p className="text-sm text-red-600 flex items-center space-x-1">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errors.numeroHoja.message}</span>
                    </p>
                  )}
                </div>
              </div>

              <Separator />

              {/* Datos del paciente */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Información del Paciente</span>
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="primerApellido" className="text-sm font-medium">
                      Primer Apellido *
                    </Label>
                    <Input 
                      id="primerApellido"
                      {...register('primerApellido')} 
                      className={errors.primerApellido ? "border-red-500" : ""}
                    />
                    {errors.primerApellido && (
                      <p className="text-sm text-red-600 flex items-center space-x-1">
                        <AlertCircle className="w-4 h-4" />
                        <span>{errors.primerApellido.message}</span>
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="segundoApellido" className="text-sm font-medium">
                      Segundo Apellido
                    </Label>
                    <Input 
                      id="segundoApellido"
                      {...register('segundoApellido')} 
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="primerNombre" className="text-sm font-medium">
                      Primer Nombre *
                    </Label>
                    <Input 
                      id="primerNombre"
                      {...register('primerNombre')} 
                      className={errors.primerNombre ? "border-red-500" : ""}
                    />
                    {errors.primerNombre && (
                      <p className="text-sm text-red-600 flex items-center space-x-1">
                        <AlertCircle className="w-4 h-4" />
                        <span>{errors.primerNombre.message}</span>
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="segundoNombre" className="text-sm font-medium">
                      Segundo Nombre
                    </Label>
                    <Input 
                      id="segundoNombre"
                      {...register('segundoNombre')} 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sexo" className="text-sm font-medium">
                      Sexo *
                    </Label>
                    <Input 
                      id="sexo"
                      {...register('sexo')} 
                      className={errors.sexo ? "border-red-500" : ""}
                    />
                    {errors.sexo && (
                      <p className="text-sm text-red-600 flex items-center space-x-1">
                        <AlertCircle className="w-4 h-4" />
                        <span>{errors.sexo.message}</span>
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edad" className="text-sm font-medium">
                      Edad *
                    </Label>
                    <Input 
                      id="edad"
                      type="number"
                      {...register('edad')} 
                      className={errors.edad ? "border-red-500" : ""}
                    />
                    {errors.edad && (
                      <p className="text-sm text-red-600 flex items-center space-x-1">
                        <AlertCircle className="w-4 h-4" />
                        <span>{errors.edad.message}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Motivo de Consulta */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ClipboardList className="w-5 h-5 text-gray-600" />
                <span>B. Motivo de Consulta y Enfermedad</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="motivoConsulta" className="text-sm font-medium">
                    Motivo de Consulta *
                  </Label>
                  <Textarea 
                    id="motivoConsulta"
                    {...register('motivoConsulta')} 
                    onChange={(e) => {
                      // Actualizar ambos campos al mismo tiempo
                      setValue('motivoConsulta', e.target.value);
                      setValue('motivoConsultaPrimera', e.target.value);
                    }}
                    className={`min-h-[100px] ${errors.motivoConsulta ? "border-red-500" : ""}`}
                    placeholder="Describa el motivo principal de la consulta..."
                  />
                  {errors.motivoConsulta && (
                    <p className="text-sm text-red-600 flex items-center space-x-1">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errors.motivoConsulta.message}</span>
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="enfermedadActual" className="text-sm font-medium">
                    Enfermedad o Problema Actual *
                  </Label>
                  <Textarea 
                    id="enfermedadActual"
                    {...register('enfermedadActual')} 
                    className={`min-h-[120px] ${errors.enfermedadActual ? "border-red-500" : ""}`}
                    placeholder="Describa la enfermedad o problema actual del paciente..."
                  />
                  {errors.enfermedadActual && (
                    <p className="text-sm text-red-600 flex items-center space-x-1">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errors.enfermedadActual.message}</span>
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Constantes Vitales */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-gray-600" />
                <span>F. Constantes Vitales y Antropometría</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="constantesVitales.fecha" className="text-sm font-medium flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>Fecha *</span>
                  </Label>
                  <Input 
                    id="constantesVitales.fecha"
                    type="date"
                    {...register('constantesVitales.fecha')} 
                    className={errors.constantesVitales?.fecha ? "border-red-500" : ""}
                  />
                  {errors.constantesVitales?.fecha && (
                    <p className="text-sm text-red-600 flex items-center space-x-1">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errors.constantesVitales.fecha.message}</span>
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="constantesVitales.hora" className="text-sm font-medium flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>Hora *</span>
                  </Label>
                  <Input 
                    id="constantesVitales.hora"
                    type="time"
                    {...register('constantesVitales.hora')} 
                    className={errors.constantesVitales?.hora ? "border-red-500" : ""}
                  />
                  {errors.constantesVitales?.hora && (
                    <p className="text-sm text-red-600 flex items-center space-x-1">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errors.constantesVitales.hora.message}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="constantesVitales.temperatura" className="text-sm font-medium">
                    Temperatura (°C)
                  </Label>
                  <Input 
                    id="constantesVitales.temperatura"
                    type="number"
                    step="0.1"
                    {...register('constantesVitales.temperatura')} 
                    placeholder="36.5"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="constantesVitales.presionArterial" className="text-sm font-medium">
                    Presión Arterial
                  </Label>
                  <Input 
                    id="constantesVitales.presionArterial"
                    {...register('constantesVitales.presionArterial')} 
                    placeholder="120/80"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="constantesVitales.frecuenciaCardiaca" className="text-sm font-medium">
                    Freq. Cardíaca (bpm)
                  </Label>
                  <Input 
                    id="constantesVitales.frecuenciaCardiaca"
                    type="number"
                    {...register('constantesVitales.frecuenciaCardiaca')} 
                    placeholder="72"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="constantesVitales.frecuenciaRespiratoria" className="text-sm font-medium">
                    Freq. Respiratoria (rpm)
                  </Label>
                  <Input 
                    id="constantesVitales.frecuenciaRespiratoria"
                    type="number"
                    {...register('constantesVitales.frecuenciaRespiratoria')} 
                    placeholder="18"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="constantesVitales.peso" className="text-sm font-medium">
                    Peso (kg)
                  </Label>
                  <Input 
                    id="constantesVitales.peso"
                    type="number"
                    step="0.1"
                    {...register('constantesVitales.peso')} 
                    placeholder="70.5"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="constantesVitales.talla" className="text-sm font-medium">
                    Talla (m)
                  </Label>
                  <Input 
                    id="constantesVitales.talla"
                    type="number"
                    step="0.01"
                    {...register('constantesVitales.talla')} 
                    placeholder="1.75"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="constantesVitales.imc" className="text-sm font-medium">
                    IMC
                  </Label>
                  <Input 
                    id="constantesVitales.imc"
                    type="number"
                    step="0.1"
                    {...register('constantesVitales.imc')} 
                    placeholder="23.0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="constantesVitales.perimetroAbdominal" className="text-sm font-medium">
                    Perímetro Abdominal (cm)
                  </Label>
                  <Input 
                    id="constantesVitales.perimetroAbdominal"
                    type="number"
                    {...register('constantesVitales.perimetroAbdominal')} 
                    placeholder="85"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="constantesVitales.hemoglobinaCapilar" className="text-sm font-medium">
                    Hemoglobina Capilar (g/dL)
                  </Label>
                  <Input 
                    id="constantesVitales.hemoglobinaCapilar"
                    type="number"
                    step="0.1"
                    {...register('constantesVitales.hemoglobinaCapilar')} 
                    placeholder="14.5"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="constantesVitales.glucosaCapilar" className="text-sm font-medium">
                    Glucosa Capilar (mg/dL)
                  </Label>
                  <Input 
                    id="constantesVitales.glucosaCapilar"
                    type="number"
                    {...register('constantesVitales.glucosaCapilar')} 
                    placeholder="95"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="constantesVitales.pulsioximetria" className="text-sm font-medium">
                    Pulsioximetría (%)
                  </Label>
                  <Input 
                    id="constantesVitales.pulsioximetria"
                    type="number"
                    {...register('constantesVitales.pulsioximetria')} 
                    placeholder="98"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Antecedentes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-gray-600" />
                <span>C. Antecedentes</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Antecedentes Patológicos Personales */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2">
                  Antecedentes Patológicos Personales
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="antecedentesPatologicosPersonales" className="text-sm font-medium">
                      Lista de Antecedentes
                    </Label>
                    <Input
                      id="antecedentesPatologicosPersonales"
                      {...register('antecedentesPatologicosPersonales', {
                        setValueAs: (val) => {
                          if (typeof val === 'string' && val.trim() !== '') {
                            return val.split(',').map((item) => item.trim());
                          }
                          return [];
                        }
                      })}
                      placeholder="Separar con comas (ej: Diabetes, Hipertensión)"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="antecedentesPatologicosPersonalesDesc" className="text-sm font-medium">
                      Descripción *
                    </Label>
                    <Textarea
                      id="antecedentesPatologicosPersonalesDesc"
                      {...register('antecedentesPatologicosPersonalesDesc')}
                      className={`min-h-[80px] ${errors.antecedentesPatologicosPersonalesDesc ? "border-red-500" : ""}`}
                      placeholder="Describa los antecedentes patológicos personales..."
                    />
                    {errors.antecedentesPatologicosPersonalesDesc && (
                      <p className="text-sm text-red-600 flex items-center space-x-1">
                        <AlertCircle className="w-4 h-4" />
                        <span>{errors.antecedentesPatologicosPersonalesDesc.message}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h5 className="font-medium text-gray-800 dark:text-gray-200">
                    Antecedentes Personales Detallados
                  </h5>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="cardiopatiaPersonal"
                        {...register('antecedentesPersonales.cardiopatia', {
                          setValueAs: (v) => !!v,
                        })}
                      />
                      <Label htmlFor="cardiopatiaPersonal" className="text-sm">Cardiopatía</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="hipertensionPersonal"
                        {...register('antecedentesPersonales.hipertension', {
                          setValueAs: (v) => !!v,
                        })}
                      />
                      <Label htmlFor="hipertensionPersonal" className="text-sm">Hipertensión</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="ebyecPersonal"
                        {...register('antecedentesPersonales.ebyec', {
                          setValueAs: (v) => !!v,
                        })}
                      />
                      <Label htmlFor="ebyecPersonal" className="text-sm">EBYEC</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="problemaMetabolicoPersonal"
                        {...register('antecedentesPersonales.problemaMetabolico', {
                          setValueAs: (v) => !!v,
                        })}
                      />
                      <Label htmlFor="problemaMetabolicoPersonal" className="text-sm">Problema Metabólico</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="cancerPersonal"
                        {...register('antecedentesPersonales.cancer', {
                          setValueAs: (v) => !!v,
                        })}
                      />
                      <Label htmlFor="cancerPersonal" className="text-sm">Cáncer</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="tuberculosisPersonal"
                        {...register('antecedentesPersonales.tuberculosis', {
                          setValueAs: (v) => !!v,
                        })}
                      />
                      <Label htmlFor="tuberculosisPersonal" className="text-sm">Tuberculosis</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="enfMentalPersonal"
                        {...register('antecedentesPersonales.enfMental', {
                          setValueAs: (v) => !!v,
                        })}
                      />
                      <Label htmlFor="enfMentalPersonal" className="text-sm">Enfermedad Mental</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="enfInfecciosaPersonal"
                        {...register('antecedentesPersonales.enfInfecciosa', {
                          setValueAs: (v) => !!v,
                        })}
                      />
                      <Label htmlFor="enfInfecciosaPersonal" className="text-sm">Enfermedad Infecciosa</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="malformacionPersonal"
                        {...register('antecedentesPersonales.malformacion', {
                          setValueAs: (v) => !!v,
                        })}
                      />
                      <Label htmlFor="malformacionPersonal" className="text-sm">Malformación</Label>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="otroPersonal" className="text-sm font-medium">
                      Otro (especificar)
                    </Label>
                    <Input
                      id="otroPersonal"
                      {...register('antecedentesPersonales.otro')}
                      placeholder="Especifique otros antecedentes..."
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Antecedentes Patológicos Familiares */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2">
                  Antecedentes Patológicos Familiares
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="antecedentesPatologicosFamiliares" className="text-sm font-medium">
                      Lista de Antecedentes
                    </Label>
                    <Input
                      id="antecedentesPatologicosFamiliares"
                      {...register('antecedentesPatologicosFamiliares', {
                        setValueAs: (val) => {
                          if (typeof val === 'string' && val.trim() !== '') {
                            return val.split(',').map((item) => item.trim());
                          }
                          return [];
                        }
                      })}
                      placeholder="Separar con comas (ej: Cáncer, Diabetes)"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="antecedentesPatologicosFamiliaresDesc" className="text-sm font-medium">
                      Descripción *
                    </Label>
                    <Textarea
                      id="antecedentesPatologicosFamiliaresDesc"
                      {...register('antecedentesPatologicosFamiliaresDesc')}
                      className={`min-h-[80px] ${errors.antecedentesPatologicosFamiliaresDesc ? "border-red-500" : ""}`}
                      placeholder="Describa los antecedentes patológicos familiares..."
                    />
                    {errors.antecedentesPatologicosFamiliaresDesc && (
                      <p className="text-sm text-red-600 flex items-center space-x-1">
                        <AlertCircle className="w-4 h-4" />
                        <span>{errors.antecedentesPatologicosFamiliaresDesc.message}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h5 className="font-medium text-gray-800 dark:text-gray-200">
                    Antecedentes Familiares Detallados
                  </h5>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="cardiopatiaFamiliar"
                        {...register('antecedentesFamiliares.cardiopatia', {
                          setValueAs: (v) => !!v,
                        })}
                      />
                      <Label htmlFor="cardiopatiaFamiliar" className="text-sm">Cardiopatía</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="hipertensionFamiliar"
                        {...register('antecedentesFamiliares.hipertension', {
                          setValueAs: (v) => !!v,
                        })}
                      />
                      <Label htmlFor="hipertensionFamiliar" className="text-sm">Hipertensión</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="ebyecFamiliar"
                        {...register('antecedentesFamiliares.ebyec', {
                          setValueAs: (v) => !!v,
                        })}
                      />
                      <Label htmlFor="ebyecFamiliar" className="text-sm">EBYEC</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="problemaMetabolicoFamiliar"
                        {...register('antecedentesFamiliares.problemaMetabolico', {
                          setValueAs: (v) => !!v,
                        })}
                      />
                      <Label htmlFor="problemaMetabolicoFamiliar" className="text-sm">Problema Metabólico</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="cancerFamiliar"
                        {...register('antecedentesFamiliares.cancer', {
                          setValueAs: (v) => !!v,
                        })}
                      />
                      <Label htmlFor="cancerFamiliar" className="text-sm">Cáncer</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="tuberculosisFamiliar"
                        {...register('antecedentesFamiliares.tuberculosis', {
                          setValueAs: (v) => !!v,
                        })}
                      />
                      <Label htmlFor="tuberculosisFamiliar" className="text-sm">Tuberculosis</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="enfMentalFamiliar"
                        {...register('antecedentesFamiliares.enfMental', {
                          setValueAs: (v) => !!v,
                        })}
                      />
                      <Label htmlFor="enfMentalFamiliar" className="text-sm">Enfermedad Mental</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="enfInfecciosaFamiliar"
                        {...register('antecedentesFamiliares.enfInfecciosa', {
                          setValueAs: (v) => !!v,
                        })}
                      />
                      <Label htmlFor="enfInfecciosaFamiliar" className="text-sm">Enfermedad Infecciosa</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="malformacionFamiliar"
                        {...register('antecedentesFamiliares.malformacion', {
                          setValueAs: (v) => !!v,
                        })}
                      />
                      <Label htmlFor="malformacionFamiliar" className="text-sm">Malformación</Label>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="otroFamiliar" className="text-sm font-medium">
                      Otro (especificar)
                    </Label>
                    <Input
                      id="otroFamiliar"
                      {...register('antecedentesFamiliares.otro')}
                      placeholder="Especifique otros antecedentes..."
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Revisión de Órganos y Sistemas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Stethoscope className="w-5 h-5 text-gray-600" />
                <span>G. Revisión de Órganos y Sistemas</span>
              </CardTitle>
              <CardDescription>
                Evaluación sistemática por aparatos y sistemas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="revisionOrganosSistemas.pielAnexos" className="text-sm font-medium">
                    Piel y Anexos
                  </Label>
                  <Textarea
                    id="revisionOrganosSistemas.pielAnexos"
                    {...register('revisionOrganosSistemas.pielAnexos')}
                    className="min-h-[60px]"
                    placeholder="Hallazgos en piel y anexos..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="revisionOrganosSistemas.organosSentidos" className="text-sm font-medium">
                    Órganos de los Sentidos
                  </Label>
                  <Textarea
                    id="revisionOrganosSistemas.organosSentidos"
                    {...register('revisionOrganosSistemas.organosSentidos')}
                    className="min-h-[60px]"
                    placeholder="Hallazgos en órganos de los sentidos..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="revisionOrganosSistemas.respiratorio" className="text-sm font-medium">
                    Sistema Respiratorio
                  </Label>
                  <Textarea
                    id="revisionOrganosSistemas.respiratorio"
                    {...register('revisionOrganosSistemas.respiratorio')}
                    className="min-h-[60px]"
                    placeholder="Hallazgos del sistema respiratorio..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="revisionOrganosSistemas.cardioVascular" className="text-sm font-medium">
                    Sistema Cardiovascular
                  </Label>
                  <Textarea
                    id="revisionOrganosSistemas.cardioVascular"
                    {...register('revisionOrganosSistemas.cardioVascular')}
                    className="min-h-[60px]"
                    placeholder="Hallazgos del sistema cardiovascular..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="revisionOrganosSistemas.digestivo" className="text-sm font-medium">
                    Sistema Digestivo
                  </Label>
                  <Textarea
                    id="revisionOrganosSistemas.digestivo"
                    {...register('revisionOrganosSistemas.digestivo')}
                    className="min-h-[60px]"
                    placeholder="Hallazgos del sistema digestivo..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="revisionOrganosSistemas.genitoUrinario" className="text-sm font-medium">
                    Sistema Genitourinario
                  </Label>
                  <Textarea
                    id="revisionOrganosSistemas.genitoUrinario"
                    {...register('revisionOrganosSistemas.genitoUrinario')}
                    className="min-h-[60px]"
                    placeholder="Hallazgos del sistema genitourinario..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="revisionOrganosSistemas.musculoEsqueletico" className="text-sm font-medium">
                    Sistema Musculoesquelético
                  </Label>
                  <Textarea
                    id="revisionOrganosSistemas.musculoEsqueletico"
                    {...register('revisionOrganosSistemas.musculoEsqueletico')}
                    className="min-h-[60px]"
                    placeholder="Hallazgos del sistema musculoesquelético..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="revisionOrganosSistemas.endocrino" className="text-sm font-medium">
                    Sistema Endocrino
                  </Label>
                  <Textarea
                    id="revisionOrganosSistemas.endocrino"
                    {...register('revisionOrganosSistemas.endocrino')}
                    className="min-h-[60px]"
                    placeholder="Hallazgos del sistema endocrino..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="revisionOrganosSistemas.hemolinfatico" className="text-sm font-medium">
                    Sistema Hemolinfático
                  </Label>
                  <Textarea
                    id="revisionOrganosSistemas.hemolinfatico"
                    {...register('revisionOrganosSistemas.hemolinfatico')}
                    className="min-h-[60px]"
                    placeholder="Hallazgos del sistema hemolinfático..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="revisionOrganosSistemas.nervioso" className="text-sm font-medium">
                    Sistema Nervioso
                  </Label>
                  <Textarea
                    id="revisionOrganosSistemas.nervioso"
                    {...register('revisionOrganosSistemas.nervioso')}
                    className="min-h-[60px]"
                    placeholder="Hallazgos del sistema nervioso..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Examen Físico */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Stethoscope className="w-5 h-5 text-gray-600" />
                <span>H. Examen Físico</span>
              </CardTitle>
              <CardDescription>
                Examen físico segmentario detallado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="examenFisico.pielFaneras" className="text-sm font-medium">
                    Piel y Faneras
                  </Label>
                  <Textarea
                    id="examenFisico.pielFaneras"
                    {...register('examenFisico.pielFaneras')}
                    className="min-h-[60px]"
                    placeholder="Examen de piel y faneras..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="examenFisico.cabeza" className="text-sm font-medium">
                    Cabeza
                  </Label>
                  <Textarea
                    id="examenFisico.cabeza"
                    {...register('examenFisico.cabeza')}
                    className="min-h-[60px]"
                    placeholder="Examen de cabeza..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="examenFisico.ojos" className="text-sm font-medium">
                    Ojos
                  </Label>
                  <Textarea
                    id="examenFisico.ojos"
                    {...register('examenFisico.ojos')}
                    className="min-h-[60px]"
                    placeholder="Examen oftalmológico..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="examenFisico.oidos" className="text-sm font-medium">
                    Oídos
                  </Label>
                  <Textarea
                    id="examenFisico.oidos"
                    {...register('examenFisico.oidos')}
                    className="min-h-[60px]"
                    placeholder="Examen otológico..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="examenFisico.nariz" className="text-sm font-medium">
                    Nariz
                  </Label>
                  <Textarea
                    id="examenFisico.nariz"
                    {...register('examenFisico.nariz')}
                    className="min-h-[60px]"
                    placeholder="Examen nasal..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="examenFisico.boca" className="text-sm font-medium">
                    Boca
                  </Label>
                  <Textarea
                    id="examenFisico.boca"
                    {...register('examenFisico.boca')}
                    className="min-h-[60px]"
                    placeholder="Examen oral..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="examenFisico.cuello" className="text-sm font-medium">
                    Cuello
                  </Label>
                  <Textarea
                    id="examenFisico.cuello"
                    {...register('examenFisico.cuello')}
                    className="min-h-[60px]"
                    placeholder="Examen de cuello..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="examenFisico.torax" className="text-sm font-medium">
                    Tórax
                  </Label>
                  <Textarea
                    id="examenFisico.torax"
                    {...register('examenFisico.torax')}
                    className="min-h-[60px]"
                    placeholder="Examen de tórax..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="examenFisico.abdomen" className="text-sm font-medium">
                    Abdomen
                  </Label>
                  <Textarea
                    id="examenFisico.abdomen"
                    {...register('examenFisico.abdomen')}
                    className="min-h-[60px]"
                    placeholder="Examen abdominal..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="examenFisico.genital" className="text-sm font-medium">
                    Genital
                  </Label>
                  <Textarea
                    id="examenFisico.genital"
                    {...register('examenFisico.genital')}
                    className="min-h-[60px]"
                    placeholder="Examen genital..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="examenFisico.miembrosSuperiores" className="text-sm font-medium">
                    Miembros Superiores
                  </Label>
                  <Textarea
                    id="examenFisico.miembrosSuperiores"
                    {...register('examenFisico.miembrosSuperiores')}
                    className="min-h-[60px]"
                    placeholder="Examen de miembros superiores..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="examenFisico.miembrosInferiores" className="text-sm font-medium">
                    Miembros Inferiores
                  </Label>
                  <Textarea
                    id="examenFisico.miembrosInferiores"
                    {...register('examenFisico.miembrosInferiores')}
                    className="min-h-[60px]"
                    placeholder="Examen de miembros inferiores..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="examenFisico.columnaVertebral" className="text-sm font-medium">
                    Columna Vertebral
                  </Label>
                  <Textarea
                    id="examenFisico.columnaVertebral"
                    {...register('examenFisico.columnaVertebral')}
                    className="min-h-[60px]"
                    placeholder="Examen de columna vertebral..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="examenFisico.inglePerine" className="text-sm font-medium">
                    Ingle y Periné
                  </Label>
                  <Textarea
                    id="examenFisico.inglePerine"
                    {...register('examenFisico.inglePerine')}
                    className="min-h-[60px]"
                    placeholder="Examen de ingle y periné..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="examenFisico.axilasMamas" className="text-sm font-medium">
                    Axilas y Mamas
                  </Label>
                  <Textarea
                    id="examenFisico.axilasMamas"
                    {...register('examenFisico.axilasMamas')}
                    className="min-h-[60px]"
                    placeholder="Examen de axilas y mamas..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Diagnósticos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Heart className="w-5 h-5 text-gray-600" />
                <span>I. Diagnósticos</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Diagnóstico principal */}
              <div className="space-y-2">
                <Label htmlFor="diagnostico" className="text-sm font-medium">
                  Diagnóstico Principal *
                </Label>
                <Textarea 
                  id="diagnostico"
                  {...register('diagnostico')} 
                  className={`min-h-[100px] ${errors.diagnostico ? "border-red-500" : ""}`}
                  placeholder="Ingrese el diagnóstico principal..."
                />
                {errors.diagnostico && (
                  <p className="text-sm text-red-600 flex items-center space-x-1">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.diagnostico.message}</span>
                  </p>
                )}
              </div>

              <Separator />

              {/* Diagnósticos adicionales */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Diagnósticos Adicionales
                </h4>
                
                {diagnosticos.map((diagnostico, index) => (
                  <div key={index} className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <h5 className="font-medium">Diagnóstico {index + 1}</h5>
                      {diagnosticos.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => eliminarDiagnostico(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Descripción</Label>
                        <Textarea
                          value={diagnostico.desc}
                          onChange={(e) => {
                            const nuevos = [...diagnosticos];
                            nuevos[index].desc = e.target.value;
                            setDiagnosticos(nuevos);
                          }}
                          placeholder="Descripción del diagnóstico..."
                          className="min-h-[80px]"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Código CIE-10</Label>
                        <AutocompleteCIE
                          onSelect={(cie, desc) => {
                            const nuevos = [...diagnosticos];
                            nuevos[index].cie = cie;
                            if (!nuevos[index].desc) {
                              nuevos[index].desc = desc;
                            }
                            setDiagnosticos(nuevos);
                          }}
                        />
                      </div>
                    </div>
                    
                    <div className="flex space-x-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`presuntivo-${index}`}
                          checked={diagnostico.presuntivo}
                          onCheckedChange={(checked) => {
                            const nuevos = [...diagnosticos];
                            nuevos[index].presuntivo = checked as boolean;
                            setDiagnosticos(nuevos);
                          }}
                        />
                        <Label htmlFor={`presuntivo-${index}`} className="text-sm">
                          Presuntivo
                        </Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`definitivo-${index}`}
                          checked={diagnostico.definitivo}
                          onCheckedChange={(checked) => {
                            const nuevos = [...diagnosticos];
                            nuevos[index].definitivo = checked as boolean;
                            setDiagnosticos(nuevos);
                          }}
                        />
                        <Label htmlFor={`definitivo-${index}`} className="text-sm">
                          Definitivo
                        </Label>
                      </div>
                    </div>
                  </div>
                ))}
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={agregarDiagnostico}
                  className="w-full flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Agregar Diagnóstico</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Plan de Tratamiento */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ClipboardList className="w-5 h-5 text-gray-600" />
                <span>J. Plan de Tratamiento</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="planTratamiento" className="text-sm font-medium">
                  Plan de Tratamiento *
                </Label>
                <Textarea 
                  id="planTratamiento"
                  {...register('planTratamiento')} 
                  className={`min-h-[150px] ${errors.planTratamiento ? "border-red-500" : ""}`}
                  placeholder="Describa el plan de tratamiento para el paciente..."
                />
                {errors.planTratamiento && (
                  <p className="text-sm text-red-600 flex items-center space-x-1">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.planTratamiento.message}</span>
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Botones de acción */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                  className="flex items-center space-x-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Limpiar Formulario</span>
                </Button>
                
                <Button
                  type="submit"
                  onClick={async () => {
                    console.log('🖱️ BOTÓN SUBMIT CLICKEADO');
                    
                    // Forzar validación manual para ver todos los errores
                    const isValidForm = await trigger();
                    console.log('🔍 Validación manual resultado:', isValidForm);
                    
                    // Verificar campos específicos que podrían estar causando problemas
                    const data = watch();
                    console.log('🔍 Verificación de campos requeridos:');
                    console.log('- motivoConsulta:', data.motivoConsulta ? '✅' : '❌ FALTA');
                    console.log('- enfermedadActual:', data.enfermedadActual ? '✅' : '❌ FALTA');
                    console.log('- constantesVitales.fecha:', data.constantesVitales?.fecha ? '✅' : '❌ FALTA');
                    console.log('- constantesVitales.hora:', data.constantesVitales?.hora ? '✅' : '❌ FALTA');
                    console.log('- constantesVitales.temperatura:', data.constantesVitales?.temperatura ? '✅' : '❌ FALTA');
                    console.log('- constantesVitales.presionArterial:', data.constantesVitales?.presionArterial ? '✅' : '❌ FALTA');
                    console.log('- constantesVitales.frecuenciaCardiaca:', data.constantesVitales?.frecuenciaCardiaca ? '✅' : '❌ FALTA');
                    console.log('- constantesVitales.frecuenciaRespiratoria:', data.constantesVitales?.frecuenciaRespiratoria ? '✅' : '❌ FALTA');
                    console.log('- constantesVitales.peso:', data.constantesVitales?.peso ? '✅' : '❌ FALTA');
                    console.log('- constantesVitales.talla:', data.constantesVitales?.talla ? '✅' : '❌ FALTA');
                    console.log('- constantesVitales.imc:', data.constantesVitales?.imc ? '✅' : '❌ FALTA');
                    console.log('- constantesVitales.pulsioximetria:', data.constantesVitales?.pulsioximetria ? '✅' : '❌ FALTA');
                    console.log('- motivoConsultaPrimera:', data.motivoConsultaPrimera ? '✅' : '❌ FALTA');
                    console.log('- diagnostico:', data.diagnostico ? '✅' : '❌ FALTA');
                    console.log('- planTratamiento:', data.planTratamiento ? '✅' : '❌ FALTA');
                  }}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="w-4 h-4" />
                  <span>Guardar Consulta</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}
