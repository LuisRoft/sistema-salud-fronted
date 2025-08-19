/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createLaboratoryRequest } from '@/services/labRequestService';
import { useToast } from '@/hooks/use-toast';
import { getSession, useSession } from 'next-auth/react';
import { CreateLaboratoryRequestDTO } from '@/types/labrequest/create-laboratory-request';
import { useEffect } from "react";
import { PatientSelector } from '@/components/shared/patient-selector';
import { 
  FileText, 
  User, 
  Calendar, 
  Stethoscope, 
  TestTube, 
  Droplets, 
  HeartPulse,
  Activity,
  FlaskConical,
  Microscope,
  CircuitBoard,
  ClipboardCheck,
  Save,
  RotateCcw,
  MapPin
} from 'lucide-react';

const labFormSchema = z.object({
  numero_de_archivo: z.string().min(1, 'Campo obligatorio'),
  cedula: z.string().optional(),
  primer_nombre: z.string().min(1, 'Campo obligatorio'),
  primer_apellido: z.string().min(1, 'Campo obligatorio'),
  segundo_nombre: z.string().optional(),
  segundo_apellido: z.string().optional(),
  diagnostico_descripcion1: z.string().min(1, 'Campo obligatorio'),
  gender: z.string().min(1, 'Campo obligatorio'),
  birthday: z.string().min(1, 'Campo obligatorio'),
  typeDisability: z.string().min(1, 'Campo obligatorio'),
  percentageDisability: z.string().min(1, 'Campo obligatorio'),
  zone: z.string().min(1, 'Campo obligatorio'),
  diagnostico_cie1: z.string().min(1, 'Campo obligatorio'),
  diagnostico_descripcion2: z.string().min(1, 'Campo obligatorio'),
  diagnostico_cie2: z.string().min(1, 'Campo obligatorio'),
  fecha: z.string().min(1, 'Campo obligatorio'),
  prioridad: z.enum(['URGENTE', 'RUTINA']),
  hematologia_examenes: z.array(z.string()).optional().default([]),
  coagulacion_examenes: z.array(z.string()).optional().default([]),
  quimica_sanguinea_examenes: z.array(z.string()).optional().default([]),
  orina_examenes: z.array(z.string()).optional().default([]),
  heces_examenes: z.array(z.string()).optional().default([]),
  hormonas_examenes: z.array(z.string()).optional().default([]),
  serologia_examenes: z.array(z.string()).optional().default([]),
  userId: z.string().uuid(),
  patientId: z.string().uuid(),
  microbiologia: z.object({
    muestra: z.string().min(1, 'Campo obligatorio'),
    sitio_anatomico: z.string().min(1, 'Campo obligatorio'),
    cultivo_y_antibiograma: z.boolean().optional(),
    cristalografia: z.boolean().optional(),
    gram: z.boolean().optional(),
    fresco: z.boolean().optional(),
    estudio_micologico_koh: z.string(),
    cultivo_micotico: z.string(),
    investigacion_paragonimus_spp: z.string(),
    investigacion_histoplasma_spp: z.string(),
    coloracion_zhiel_nielsen: z.string(),
  }).optional(),
});

type LabFormValues = z.infer<typeof labFormSchema>;

export default function LabRequestForm() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { register, handleSubmit, formState: { errors }, setValue, getValues, reset } = useForm<LabFormValues>({
    resolver: zodResolver(labFormSchema),
    mode: "onChange",
  });

  const handlePatientSelect = (patient: {
    document?: string;
    name?: string;
    lastName?: string;
    secondName?: string;
    secondLastName?: string;
    gender?: string;
    birthday?: string;
    typeDisability?: string;
    percentageDisability?: string;
    zone?: string;
    id?: string;
  }) => {
    console.log("Selecting patient: ", patient);
    setValue('cedula', String(patient.document || ''));
    setValue('primer_nombre', String(patient.name || ''));
    setValue('primer_apellido', String(patient.lastName || ''));
    setValue('segundo_nombre', String(patient.secondName || ''));
    setValue('segundo_apellido', String(patient.secondLastName || ''));
    setValue('gender', String(patient.gender || ''));
    setValue('birthday', String(patient.birthday || ''));
    setValue('typeDisability', String(patient.typeDisability || ''));
    setValue('percentageDisability', String(patient.percentageDisability || ''));
    setValue('zone', String(patient.zone || ''));
    setValue('patientId', String(patient.id || ''));
  };

  // Fetch session data
  useEffect(() => {
    const fetchSessionData = async () => {
      const sessionData = await getSession();
      if (sessionData?.user?.access_token) {
        const token = sessionData.user.access_token;
        const tokenParts = token.split('.');
        const payload = JSON.parse(atob(tokenParts[1]));
        const userId = payload.id;
        
        if (userId) {
          setValue("userId", userId);
        }
        
        const patientId = sessionData.user.team?.patient?.id;
        if (patientId) {
          setValue("patientId", patientId);
        }
      }
    };
    
    fetchSessionData();
  }, [setValue]);

  const mutation = useMutation({
    mutationFn: async (data: CreateLaboratoryRequestDTO) => {
      const session = await getSession();
      const token = session?.user.access_token;
      if (!token) throw new Error('No token found');
      
      return await createLaboratoryRequest(data, token);
    },
    onSuccess: () => {
      toast({
        title: 'Éxito',
        description: 'Solicitud de laboratorio creada correctamente',
      });
      reset();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error al crear la solicitud',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = async (data: LabFormValues) => {
    try {
      const sessionData = await getSession();
      if (!sessionData?.user?.access_token) {
        toast({
          title: "Error",
          description: "No hay información del usuario",
          variant: "destructive",
        });
        return;
      }

      const token = sessionData.user.access_token;
      const tokenParts = token.split('.');
      const payload = JSON.parse(atob(tokenParts[1]));
      const userId = payload.id;
      const patientId = getValues("patientId");

      if (!patientId) {
        toast({
          title: "Error",
          description: "No se pudo obtener el ID del paciente",
          variant: "destructive",
        });
        return;
      }

      // Filter out visual fields
      const {
        primer_nombre,
        primer_apellido,
        segundo_nombre,
        segundo_apellido,
        gender,
        birthday,
        typeDisability,
        percentageDisability,
        zone,
        cedula,
        ...filteredData
      } = data;

      const formattedData = {
        ...filteredData,
        userId: userId,
        patientId: patientId,
        fecha: data.fecha,
      };

      mutation.mutate(formattedData);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error al crear el pedido de laboratorio',
      });
    }
  };

  const handleReset = () => {
    reset({
      numero_de_archivo: '',
      cedula: '',
      primer_nombre: '',
      primer_apellido: '',
      segundo_nombre: '',
      segundo_apellido: '',
      diagnostico_descripcion1: '',
      gender: '',
      birthday: '',
      typeDisability: '',
      percentageDisability: '',
      zone: '',
      diagnostico_cie1: '',
      diagnostico_descripcion2: '',
      diagnostico_cie2: '',
      fecha: '',
      prioridad: 'RUTINA',
      hematologia_examenes: [],
      coagulacion_examenes: [],
      quimica_sanguinea_examenes: [],
      orina_examenes: [],
      heces_examenes: [],
      hormonas_examenes: [],
      serologia_examenes: [],
      microbiologia: {
        muestra: '',
        sitio_anatomico: '',
        cultivo_y_antibiograma: false,
        cristalografia: false,
        gram: false,
        fresco: false,
        estudio_micologico_koh: '',
        cultivo_micotico: '',
        investigacion_paragonimus_spp: '',
        investigacion_histoplasma_spp: '',
        coloracion_zhiel_nielsen: '',
      },
    });
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card className="border-l-4 border-l-emerald-500">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-lg">
                  <TestTube className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <CardTitle className="text-2xl text-gray-900 dark:text-gray-100">
                    Solicitud de Laboratorio
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Formulario para solicitar exámenes de laboratorio
                  </CardDescription>
                </div>
              </div>
              <PatientSelector onSelect={handlePatientSelect} />
            </div>
          </CardHeader>
        </Card>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Sección A: Datos del Paciente */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-lg">A. Datos del Paciente</CardTitle>
                  <CardDescription>
                    Información básica del paciente y datos administrativos
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    <FileText className="inline h-4 w-4 mr-1" />
                    Número de Archivo *
                  </Label>
                  <Input 
                    className="w-full" 
                    {...register('numero_de_archivo')} 
                    placeholder="Ingrese el número de archivo"
                  />
                  {errors.numero_de_archivo && (
                    <p className="text-sm text-red-500">{errors.numero_de_archivo.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    <User className="inline h-4 w-4 mr-1" />
                    Cédula
                  </Label>
                  <Input 
                    className="w-full bg-gray-50 dark:bg-gray-800" 
                    {...register('cedula')} 
                    readOnly
                    placeholder="Se completará automáticamente"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    <Calendar className="inline h-4 w-4 mr-1" />
                    Fecha *
                  </Label>
                  <Input 
                    type="date"
                    className="w-full" 
                    {...register('fecha')} 
                  />
                  {errors.fecha && (
                    <p className="text-sm text-red-500">{errors.fecha.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    <Stethoscope className="inline h-4 w-4 mr-1" />
                    Diagnóstico 1 *
                  </Label>
                  <Input 
                    className="w-full" 
                    {...register('diagnostico_descripcion1')} 
                    placeholder="Descripción del diagnóstico principal"
                  />
                  {errors.diagnostico_descripcion1 && (
                    <p className="text-sm text-red-500">{errors.diagnostico_descripcion1.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    CIE-10 (1) *
                  </Label>
                  <Input 
                    className="w-full" 
                    {...register('diagnostico_cie1')} 
                    placeholder="Código CIE-10"
                  />
                  {errors.diagnostico_cie1 && (
                    <p className="text-sm text-red-500">{errors.diagnostico_cie1.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    <Stethoscope className="inline h-4 w-4 mr-1" />
                    Diagnóstico 2 *
                  </Label>
                  <Input 
                    className="w-full" 
                    {...register('diagnostico_descripcion2')} 
                    placeholder="Descripción del diagnóstico secundario"
                  />
                  {errors.diagnostico_descripcion2 && (
                    <p className="text-sm text-red-500">{errors.diagnostico_descripcion2.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    CIE-10 (2) *
                  </Label>
                  <Input 
                    className="w-full" 
                    {...register('diagnostico_cie2')} 
                    placeholder="Código CIE-10"
                  />
                  {errors.diagnostico_cie2 && (
                    <p className="text-sm text-red-500">{errors.diagnostico_cie2.message}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sección B: Servicio y Prioridad */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                  <ClipboardCheck className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <CardTitle className="text-lg">B. Servicio y Prioridad</CardTitle>
                  <CardDescription>
                    Configuración de la solicitud de laboratorio
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  <Activity className="inline h-4 w-4 mr-1" />
                  Prioridad *
                </Label>
                <select 
                  {...register('prioridad')} 
                  className="w-full md:w-48 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="RUTINA">🔵 Rutina</option>
                  <option value="URGENTE">🔴 Urgente</option>
                </select>
                {errors.prioridad && (
                  <p className="text-sm text-red-500">{errors.prioridad.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Sección C: Exámenes de Laboratorio */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                  <FlaskConical className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <CardTitle className="text-lg">C. Exámenes de Laboratorio</CardTitle>
                  <CardDescription>
                    Seleccione los exámenes requeridos por categoría
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Hematología */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <Droplets className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Hematología
                    </h3>
                    <Badge variant="outline" className="text-xs">
                      Estudios de sangre y componentes sanguíneos
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    'Biometría Hemática', 'Hematocrito (HCTO)', 'Hemoglobina (HB)', 
                    'Plaquetas', 'Reticulocitos', 'Velocidad de Eritrosedimentación', 
                    'Hierro Sérico', 'Fijación Hierro', 'Porcentaje Saturación Transferrina', 
                    'Transferrina', 'Ferritina', 'Fragilidad Osmótica Eritrocitaria', 
                    'Metabisulfito', 'Hematozoario', 'Investigación de Leishmania', 
                    'Eosinófilo en Moco Nasal', 'Frotis Sangre Periférica', 'Ácido Fólico', 
                    'Vitamina B12'
                  ].map((examen) => (
                    <label 
                      key={examen} 
                      className="flex items-start space-x-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors cursor-pointer group"
                    >
                      <Checkbox 
                        className="mt-0.5 border-gray-300 dark:border-gray-400 text-blue-600 dark:text-blue-400 h-4 w-4 rounded focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                        checked={(Array.isArray(getValues("hematologia_examenes")) && 
                                 getValues("hematologia_examenes").includes(examen)) || false}
                        onCheckedChange={(checked) => {
                          const currentValues = Array.isArray(getValues("hematologia_examenes")) ? 
                                              getValues("hematologia_examenes") : [];
                          setValue(
                            "hematologia_examenes",
                            checked ? [...currentValues, examen] : currentValues.filter(v => v !== examen),
                            { shouldValidate: true }
                          );
                        }}
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-200 group-hover:text-blue-900 dark:group-hover:text-blue-100 transition-colors leading-relaxed">
                        {examen}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Coagulación y Hemostasia */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <HeartPulse className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Coagulación y Hemostasia
                    </h3>
                    <Badge variant="outline" className="text-xs">
                      Estudios de coagulación sanguínea
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    'Tiempo de Protrombina (TP)', 'Tiempo de Tromboplastina Parcial (TTP)',
                    'Tiempo de Trombina (TT)', 'INR', 'Factor Coagulación VII', 
                    'Factor Coagulación IX', 'Factor Von Willebrand', 'Fibrinógeno', 
                    'Dímero-D', 'Identificación de Inhibidores'
                  ].map((examen) => (
                    <label 
                      key={examen} 
                      className="flex items-start space-x-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600 hover:bg-green-50 dark:hover:bg-green-950 transition-colors cursor-pointer group"
                    >
                      <Checkbox 
                        className="mt-0.5 border-gray-300 dark:border-gray-400 text-green-600 dark:text-green-400 h-4 w-4 rounded focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400"
                        checked={(Array.isArray(getValues("coagulacion_examenes")) && 
                                 getValues("coagulacion_examenes").includes(examen)) || false}
                        onCheckedChange={(checked) => {
                          const currentValues = Array.isArray(getValues("coagulacion_examenes")) ? 
                                              getValues("coagulacion_examenes") : [];
                          setValue(
                            "coagulacion_examenes",
                            checked ? [...currentValues, examen] : currentValues.filter(v => v !== examen),
                            { shouldValidate: true }
                          );
                        }}
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-200 group-hover:text-green-900 dark:group-hover:text-green-100 transition-colors leading-relaxed">
                        {examen}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Química Sanguínea */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                    <Activity className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Química Sanguínea
                    </h3>
                    <Badge variant="outline" className="text-xs">
                      Análisis bioquímicos de sangre
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    'Glucosa Basal', 'Glucosa Post Prandial 2 horas', 'Glucosa al Azar',
                    'Sobrecarga Glucosa 75g', 'Test de Sullivan (Glucosa 50g)', 'Urea', 
                    'Creatinina', 'Ácido Úrico', 'Fosfatasa Alcalina', 'Deshidrogenasa Láctica (LDH)', 
                    'Aspartato Aminotransferasa (AST/TGO)', 'Alanina Aminotransferasa (ALT/TGP)',
                    'Gamma-Glutaril Transferasa (GGT)', 'Amilasa', 'Lipasa', 'Bilirrubina Total', 
                    'Bilirrubina Directa', 'Bilirrubina Indirecta', 'Colesterol Total',
                    'HDL', 'LDL', 'VLDL', 'Triglicéridos', 'Albúmina', 'Proteínas Totales', 
                    'Hemoglobina Glicosilada (HBA1C)', 'CPK Total', 'Fructosamina', 'PCR Cuantitativo'
                  ].map((examen) => (
                    <label 
                      key={examen} 
                      className="flex items-start space-x-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-yellow-300 dark:hover:border-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-950 transition-colors cursor-pointer group"
                    >
                      <Checkbox 
                        className="mt-0.5 border-gray-300 dark:border-gray-400 text-yellow-600 dark:text-yellow-400 h-4 w-4 rounded focus:ring-2 focus:ring-yellow-500 dark:focus:ring-yellow-400"
                        checked={(Array.isArray(getValues("quimica_sanguinea_examenes")) ? 
                                 getValues("quimica_sanguinea_examenes") : []).includes(examen)}
                        onCheckedChange={(checked) => {
                          const currentValues = Array.isArray(getValues("quimica_sanguinea_examenes")) ? 
                                              getValues("quimica_sanguinea_examenes") : [];
                          setValue(
                            "quimica_sanguinea_examenes",
                            checked ? [...currentValues, examen] : currentValues.filter(v => v !== examen),
                            { shouldValidate: true }
                          );
                        }}
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-200 group-hover:text-yellow-900 dark:group-hover:text-yellow-100 transition-colors leading-relaxed">
                        {examen}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Exámenes de Orina */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <FlaskConical className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Exámenes de Orina
                    </h3>
                    <Badge variant="outline" className="text-xs">
                      Análisis de orina y función renal
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    'Citoquímico de Orina', 'Urocultivo y Antibiograma', 'Aclaramiento de Creatinina',
                    'Microalbúmina Urinaria', 'Proteinuria de 24 horas', 'Leucocitos en Orina'
                  ].map((examen) => (
                    <label 
                      key={examen} 
                      className="flex items-start space-x-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950 transition-colors cursor-pointer group"
                    >
                      <Checkbox 
                        className="mt-0.5 border-gray-300 dark:border-gray-400 text-purple-600 dark:text-purple-400 h-4 w-4 rounded focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                        checked={(Array.isArray(getValues("orina_examenes")) ? 
                                 getValues("orina_examenes") : []).includes(examen)}
                        onCheckedChange={(checked) => {
                          const currentValues = Array.isArray(getValues("orina_examenes")) ? 
                                              getValues("orina_examenes") : [];
                          setValue(
                            "orina_examenes",
                            checked ? [...currentValues, examen] : currentValues.filter(v => v !== examen),
                            { shouldValidate: true }
                          );
                        }}
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-200 group-hover:text-purple-900 dark:group-hover:text-purple-100 transition-colors leading-relaxed">
                        {examen}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Exámenes de Heces */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-pink-100 dark:bg-pink-900 rounded-lg">
                    <Microscope className="h-5 w-5 text-pink-600 dark:text-pink-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Exámenes de Heces
                    </h3>
                    <Badge variant="outline" className="text-xs">
                      Análisis parasitológicos y digestivos
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    'Coproparasitario', 'Coprocultivo y Antibiograma', 'Grasas fecales',
                    'Test de Sangre Oculta en Heces', 'Rotavirus'
                  ].map((examen) => (
                    <label 
                      key={examen} 
                      className="flex items-start space-x-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-pink-300 dark:hover:border-pink-600 hover:bg-pink-50 dark:hover:bg-pink-950 transition-colors cursor-pointer group"
                    >
                      <Checkbox 
                        className="mt-0.5 border-gray-300 dark:border-gray-400 text-pink-600 dark:text-pink-400 h-4 w-4 rounded focus:ring-2 focus:ring-pink-500 dark:focus:ring-pink-400"
                        checked={(Array.isArray(getValues("heces_examenes")) ? 
                                 getValues("heces_examenes") : []).includes(examen)}
                        onCheckedChange={(checked) => {
                          const currentValues = Array.isArray(getValues("heces_examenes")) ? 
                                              getValues("heces_examenes") : [];
                          setValue(
                            "heces_examenes",
                            checked ? [...currentValues, examen] : currentValues.filter(v => v !== examen),
                            { shouldValidate: true }
                          );
                        }}
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-200 group-hover:text-pink-900 dark:group-hover:text-pink-100 transition-colors leading-relaxed">
                        {examen}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Hormonas */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                    <CircuitBoard className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Hormonas
                    </h3>
                    <Badge variant="outline" className="text-xs">
                      Estudios endocrinológicos
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    'TSH', 'T3 Libre', 'T4 Libre', 'Prolactina', 'Insulina', 
                    'Hormona del Crecimiento', 'Cortisol', 'Testosterona', 'Estradiol',
                    'Progesterona', 'LH', 'FSH'
                  ].map((examen) => (
                    <label 
                      key={examen} 
                      className="flex items-start space-x-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-colors cursor-pointer group"
                    >
                      <Checkbox 
                        className="mt-0.5 border-gray-300 dark:border-gray-400 text-indigo-600 dark:text-indigo-400 h-4 w-4 rounded focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                        checked={(Array.isArray(getValues("hormonas_examenes")) ? 
                                 getValues("hormonas_examenes") : []).includes(examen)}
                        onCheckedChange={(checked) => {
                          const currentValues = Array.isArray(getValues("hormonas_examenes")) ? 
                                              getValues("hormonas_examenes") : [];
                          setValue(
                            "hormonas_examenes",
                            checked ? [...currentValues, examen] : currentValues.filter(v => v !== examen),
                            { shouldValidate: true }
                          );
                        }}
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-200 group-hover:text-indigo-900 dark:group-hover:text-indigo-100 transition-colors leading-relaxed">
                        {examen}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Serología */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                    <TestTube className="h-5 w-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Serología
                    </h3>
                    <Badge variant="outline" className="text-xs">
                      Estudios inmunológicos e infecciosos
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    'VDRL', 'VIH', 'Hepatitis B (HBsAg)', 'Hepatitis C (Anti-HCV)',
                    'Toxoplasma IgG/IgM', 'Rubéola IgG/IgM', 'Citomegalovirus IgG/IgM',
                    'Chagas'
                  ].map((examen) => (
                    <label 
                      key={examen} 
                      className="flex items-start space-x-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-600 hover:bg-red-50 dark:hover:bg-red-950 transition-colors cursor-pointer group"
                    >
                      <Checkbox 
                        className="mt-0.5 border-gray-300 dark:border-gray-400 text-red-600 dark:text-red-400 h-4 w-4 rounded focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400"
                        checked={(Array.isArray(getValues("serologia_examenes")) ? 
                                 getValues("serologia_examenes") : []).includes(examen)}
                        onCheckedChange={(checked) => {
                          const currentValues = Array.isArray(getValues("serologia_examenes")) ? 
                                              getValues("serologia_examenes") : [];
                          setValue(
                            "serologia_examenes",
                            checked ? [...currentValues, examen] : currentValues.filter(v => v !== examen),
                            { shouldValidate: true }
                          );
                        }}
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-200 group-hover:text-red-900 dark:group-hover:text-red-100 transition-colors leading-relaxed">
                        {examen}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sección D: Microbiología */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-teal-100 dark:bg-teal-900 rounded-lg">
                  <Microscope className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                </div>
                <div>
                  <CardTitle className="text-lg">D. Microbiología</CardTitle>
                  <CardDescription>
                    Estudios microbiológicos y cultivos
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Información de la muestra */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    <FlaskConical className="inline h-4 w-4 mr-1" />
                    Muestra *
                  </Label>
                  <Input 
                    className="w-full" 
                    {...register('microbiologia.muestra')} 
                    placeholder="Tipo de muestra"
                  />
                  {errors.microbiologia?.muestra && (
                    <p className="text-sm text-red-500">{errors.microbiologia.muestra.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    <MapPin className="inline h-4 w-4 mr-1" />
                    Sitio Anatómico *
                  </Label>
                  <Input 
                    className="w-full" 
                    {...register('microbiologia.sitio_anatomico')} 
                    placeholder="Ubicación anatómica"
                  />
                  {errors.microbiologia?.sitio_anatomico && (
                    <p className="text-sm text-red-500">{errors.microbiologia.sitio_anatomico.message}</p>
                  )}
                </div>
              </div>

              {/* Estudios básicos */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Estudios Básicos
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <label className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-teal-300 dark:hover:border-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950 transition-colors cursor-pointer">
                    <Checkbox 
                      className="border-gray-300 dark:border-gray-400 text-teal-600 dark:text-teal-400"
                      {...register('microbiologia.cultivo_y_antibiograma', { setValueAs: v => v === true })} 
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-200">
                      Cultivo y Antibiograma
                    </span>
                  </label>
                  
                  <label className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-teal-300 dark:hover:border-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950 transition-colors cursor-pointer">
                    <Checkbox 
                      className="border-gray-300 dark:border-gray-400 text-teal-600 dark:text-teal-400"
                      {...register('microbiologia.cristalografia', { setValueAs: v => v === true })} 
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-200">
                      Cristalografía
                    </span>
                  </label>
                  
                  <label className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-teal-300 dark:hover:border-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950 transition-colors cursor-pointer">
                    <Checkbox 
                      className="border-gray-300 dark:border-gray-400 text-teal-600 dark:text-teal-400"
                      {...register('microbiologia.gram', { setValueAs: v => v === true })} 
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-200">
                      Gram
                    </span>
                  </label>
                  
                  <label className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-teal-300 dark:hover:border-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950 transition-colors cursor-pointer">
                    <Checkbox 
                      className="border-gray-300 dark:border-gray-400 text-teal-600 dark:text-teal-400"
                      {...register('microbiologia.fresco', { setValueAs: v => v === true })} 
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-200">
                      Fresco
                    </span>
                  </label>
                </div>
              </div>

              {/* Estudios especializados */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Estudios Especializados
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      Estudio Micológico KOH
                    </Label>
                    <Input 
                      className="w-full" 
                      {...register('microbiologia.estudio_micologico_koh')} 
                      placeholder="Detalles del estudio"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      Cultivo Micótico
                    </Label>
                    <Input 
                      className="w-full" 
                      {...register('microbiologia.cultivo_micotico')} 
                      placeholder="Detalles del cultivo"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      Investigación Paragonimus spp
                    </Label>
                    <Input 
                      className="w-full" 
                      {...register('microbiologia.investigacion_paragonimus_spp')} 
                      placeholder="Detalles de la investigación"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      Investigación Histoplasma spp
                    </Label>
                    <Input 
                      className="w-full" 
                      {...register('microbiologia.investigacion_histoplasma_spp')} 
                      placeholder="Detalles de la investigación"
                    />
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      Coloración Ziehl-Neelsen
                    </Label>
                    <Input 
                      className="w-full" 
                      {...register('microbiologia.coloracion_zhiel_nielsen')} 
                      placeholder="Detalles de la coloración"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Botones de acción */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4 justify-end">
                <Button 
                  type="button"
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={handleReset}
                >
                  <RotateCcw className="h-4 w-4" />
                  Limpiar Formulario
                </Button>
                
                <Button 
                  type="submit"
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                  disabled={mutation.isPending}
                >
                  <Save className="h-4 w-4" />
                  {mutation.isPending ? 'Guardando...' : 'Crear Solicitud'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}
