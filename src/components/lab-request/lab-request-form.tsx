

/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createLaboratoryRequest } from '@/services/labRequestService';
import { useToast } from '@/hooks/use-toast';
import { getSession, useSession } from 'next-auth/react';
import { CreateLaboratoryRequestDTO } from '@/types/labrequest/create-laboratory-request';
import { useEffect } from "react";
import { PatientSelector } from '@/components/shared/patient-selector';



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

  const { register, handleSubmit, formState: { errors }, setValue, getValues } = useForm<LabFormValues>({
    resolver: zodResolver(labFormSchema),
    mode: "onChange",
  });

  const handlePatientSelect = (patient: any) => {
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
  

  /** 🔹 Fetch session data (userId y patientId) */
  useEffect(() => {
    const fetchSessionData = async () => {
      const sessionData = await getSession();
      console.log("🔑 Sesión obtenida:", sessionData);
  
      if (sessionData?.user?.access_token) {
        // Extraer el ID del usuario del token JWT
        const token = sessionData.user.access_token;
        const tokenParts = token.split('.');
        const payload = JSON.parse(atob(tokenParts[1]));
        const userId = payload.id; // Este es el UUID que necesitamos
  
        if (userId) {
          setValue("userId", userId);
          console.log(`✅ userId asignado correctamente: ${userId}`);
        } else {
          console.warn("⚠️ No se encontró el UUID en el token.");
        }
  
        // Accedemos al patientId
        const patientId = sessionData.user.team?.patient?.id;
        if (patientId) {
          setValue("patientId", patientId);
          console.log(`✅ patientId asignado correctamente: ${patientId}`);
        } else {
          console.warn("⚠️ No se encontró `patientId` en la sesión.");
        }
      } else {
        console.error("🚨 No se encontró el token de acceso en la sesión.");
      }
    };
  
    fetchSessionData();
  }, [setValue]);
  
  const mutation = useMutation({
    mutationFn: async (data: CreateLaboratoryRequestDTO) => {
      console.log("🛠️ `mutationFn` ejecutándose con datos:", data);
      
      const session = await getSession();
      console.log("🔑 Sesión obtenida:", session);

      const token = session?.user.access_token;
      if (!token) {
        console.error("🚨 No se encontró el token. No se puede hacer la solicitud.");
        return;
      }

      try {
        const response = await createLaboratoryRequest(data, token);
        console.log("📤 Respuesta del servidor:", response);
        return response;
      } catch (error) {
        console.error("❌ Error al enviar la solicitud:", error);
        throw error;
      }
    },
    onSuccess: () => console.log("✅ Mutación ejecutada con éxito"),
    onError: (error) => console.error("❌ Error en `mutation.mutate()`:", error),
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
  
      // Verificamos si el patientId ya fue obtenido en el handlePatientSelect
      const patientId = getValues("patientId");
      if (!patientId) {
        toast({
          title: "Error",
          description: "No se pudo obtener el ID del paciente",
          variant: "destructive",
        });
        return;
      }
  
      // Extraer el ID del usuario del token JWT
      const tokenParts = token.split('.');
      const payload = JSON.parse(atob(tokenParts[1]));
      const userId = payload.id;
  
      console.log('User ID from token:', userId);
  
      // Obtener la fecha actual del sistema en formato ISO (YYYY-MM-DD)
      const fechaActual = new Date().toISOString().split('T')[0];
      console.log('Fecha actual:', fechaActual);
  
      // Filtrar campos visuales que no deben enviarse al backend
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
        cedula, // 👈 Excluir la cédula
        ...filteredData
      } = data;
  
      const formattedData = {
        ...filteredData,
        userId: userId,
        patientId: patientId,
        fecha: data.fecha,  // Incluir la fecha
      };
  
      console.log('Datos a enviar:', formattedData);
  
      // Hacemos la solicitud al backend
      const response = await createLaboratoryRequest(formattedData, token);
  
      if (response) {
        toast({
          title: 'Éxito',
          description: 'Pedido de laboratorio creado correctamente',
          variant: 'default',
        });
        console.log("✅ Solicitud creada con éxito:", response);
      } else {
        toast({
          title: 'Error',
          description: 'No se pudo crear la solicitud',
          variant: 'destructive',
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al crear el pedido de laboratorio';
      console.error("❌ Error al crear la solicitud:", errorMessage);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
      });
    }
  };
  
  

  /** 🔹 Muestra errores en la consola para debugging */
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      console.error("🚨 Errores en el formulario:", errors);
    }
  }, [errors]);

  return (
          <div className='rounded-lg bg-zinc-50 p-6 shadow dark:bg-gray-800'>
      <div className='flex items-center justify-between mb-6'>
        <h2 className='text-2xl font-bold'>Formulario de Solicitud de Laboratorio</h2>
        <PatientSelector onSelect={handlePatientSelect} />
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className='space-y-8'>
        <h2 className='mb-6 text-2xl font-bold'>
        </h2>

{/* Sección A: Datos del Paciente */}
<h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 bg-gray-50 dark:bg-[#1E293B] p-3 rounded-md">
  A. Datos del Paciente
</h2>

<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  <div className="space-y-2">
    <Label className="text-sm font-medium text-gray-700 dark:text-gray-200">
      Número de Archivo
    </Label>
    <Input 
      className="w-full bg-white dark:bg-[#1E293B] border-gray-200 
               dark:border-transparent focus:border-blue-500 
               dark:focus:border-transparent text-gray-900 dark:text-gray-100" 
      {...register('numero_de_archivo')} 
    />
  </div>
  <div className="space-y-2">
    <Label className="text-sm font-medium text-gray-700 dark:text-gray-200">
      Cédula
    </Label>
    <Input 
      className="w-full bg-white dark:bg-[#1E293B] border-gray-200 
               dark:border-transparent focus:border-blue-500 
               dark:focus:border-transparent text-gray-900 dark:text-gray-100" 
      {...register('cedula')} 
      readOnly
    />
  </div>
  <div className="space-y-2">
    <Label className="text-sm font-medium text-gray-700 dark:text-gray-200">
      Diagnóstico 1
    </Label>
    <Input 
      className="w-full bg-white dark:bg-[#1E293B] border-gray-200 
               dark:border-transparent focus:border-blue-500 
               dark:focus:border-transparent text-gray-900 dark:text-gray-100" 
      {...register('diagnostico_descripcion1')} 
    />
  </div>
  <div className="space-y-2">
    <Label className="text-sm font-medium text-gray-700 dark:text-gray-200">
      CIE 1
    </Label>
    <Input 
      className="w-full bg-white dark:bg-[#1E293B] border-gray-200 
               dark:border-transparent focus:border-blue-500 
               dark:focus:border-transparent text-gray-900 dark:text-gray-100" 
      {...register('diagnostico_cie1')} 
    />
  </div>
  <div className="space-y-2">
    <Label className="text-sm font-medium text-gray-700 dark:text-gray-200">
      Diagnóstico 2
    </Label>
    <Input 
      className="w-full bg-white dark:bg-[#1E293B] border-gray-200 
               dark:border-transparent focus:border-blue-500 
               dark:focus:border-transparent text-gray-900 dark:text-gray-100" 
      {...register('diagnostico_descripcion2')} 
    />
  </div>
  <div className="space-y-2">
    <Label className="text-sm font-medium text-gray-700 dark:text-gray-200">
      CIE 2
    </Label>
    <Input 
      className="w-full bg-white dark:bg-[#1E293B] border-gray-200 
               dark:border-transparent focus:border-blue-500 
               dark:focus:border-transparent text-gray-900 dark:text-gray-100" 
      {...register('diagnostico_cie2')} 
    />
  </div>
  <div className="space-y-2">
  <Label className="text-sm font-medium text-gray-700 dark:text-gray-200">
    Fecha
  </Label>
  <Input 
    type="date"
    className="w-full bg-white dark:bg-[#1E293B] border-gray-200 
             dark:border-transparent focus:border-blue-500 
             dark:focus:border-transparent text-gray-900 dark:text-gray-100" 
    {...register('fecha')} 
  />
</div>

</div>





          {/* Sección B: Servicio y Prioridad */}
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 bg-gray-50 dark:bg-[#1E293B] p-3 rounded-md mt-8">
            B. Servicio y Prioridad
          </h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Prioridad</Label>
              <select {...register('prioridad')} className='w-full rounded border p-2'>
                <option value='URGENTE'>Urgente</option>
                <option value='RUTINA'>Rutina</option>
              </select>
            </div>
          </div>

          {/* Sección C: Exámenes de Laboratorio */}
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 bg-gray-50 dark:bg-[#1E293B] p-3 rounded-md mt-8">
            C. Exámenes de Laboratorio
          </h2>

          {/* Hematología */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4 pl-2 border-l-4 border-blue-500">
              Hematología
            </h3>
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
                  className="flex items-center space-x-3 p-3 rounded-lg 
                            bg-gray-50 dark:bg-[#1E293B] border-transparent
                            hover:bg-gray-100 dark:hover:bg-[#2D3B4F] 
                            transition-colors cursor-pointer group"
                >
                  <Checkbox 
                    className="border-gray-300 dark:border-gray-400 
                              dark:bg-[#1E293B] dark:hover:bg-[#2D3B4F]
                              text-blue-600 dark:text-blue-400
                              h-5 w-5 rounded
                              focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
                              focus:ring-offset-2 dark:focus:ring-offset-[#0B1120]"
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
                  <span className="text-gray-700 dark:text-gray-200 group-hover:text-gray-900 
                                    dark:group-hover:text-white transition-colors">
                    {examen}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Coagulación y Hemostasia */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4 pl-2 border-l-4 border-green-500">
              Coagulación y Hemostasia
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                'Tiempo de Protrombina (TP)', 'Tiempo de Tromboplastina Parcial (TTP)',
                'Tiempo de Trombina (TT)', 'INR', 'Factor Coagulación VII', 
                'Factor Coagulación IX', 'Factor Von Willebrand', 'Fibrinógeno', 
                'Dímero-D', 'Identificación de Inhibidores'
              ].map((examen) => (
                <label 
                  key={examen} 
                  className="flex items-center space-x-3 p-3 rounded-lg 
                            bg-gray-50 dark:bg-[#1E293B] border-transparent
                            hover:bg-gray-100 dark:hover:bg-[#2D3B4F] 
                            transition-colors cursor-pointer group"
                >
                  <Checkbox 
                    className="border-gray-300 dark:border-gray-400 
                              dark:bg-[#1E293B] dark:hover:bg-[#2D3B4F]
                              text-green-600 dark:text-green-400
                              h-5 w-5 rounded
                              focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400
                              focus:ring-offset-2 dark:focus:ring-offset-[#0B1120]"
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
                  <span className="text-gray-700 dark:text-gray-200 group-hover:text-gray-900 
                                    dark:group-hover:text-white transition-colors">
                    {examen}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Química Sanguínea */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4 pl-2 border-l-4 border-yellow-500">
              Química Sanguínea
            </h3>
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
                  className="flex items-center space-x-3 p-3 rounded-lg 
                            bg-gray-50 dark:bg-[#1E293B] border-transparent
                            hover:bg-gray-100 dark:hover:bg-[#2D3B4F] 
                            transition-colors cursor-pointer group"
                >
                  <Checkbox 
                    className="border-gray-300 dark:border-gray-400 
                              dark:bg-[#1E293B] dark:hover:bg-[#2D3B4F]
                              text-yellow-600 dark:text-yellow-400
                              h-5 w-5 rounded
                              focus:ring-2 focus:ring-yellow-500 dark:focus:ring-yellow-400
                              focus:ring-offset-2 dark:focus:ring-offset-[#0B1120]"
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
                  <span className="text-gray-700 dark:text-gray-200 group-hover:text-gray-900 
                                    dark:group-hover:text-white transition-colors">
                    {examen}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Orina */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4 pl-2 border-l-4 border-purple-500">
              Orina
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                'Elemental y Microscópico (EMO)', 'Gram Gota Fresca', 'Osmolaridad Urinaria',
                'Sodio en Orina Parcial', 'Potasio en Orina Parcial', 'Cloro en Orina Parcial',
                'Calcio Urinario', 'Fósforo en Orina Parcial', 'Magnesio en Orina Parcial',
                'Glucosa en Orina Parcial', 'Urea en Orina Parcial', 'Creatinina en Orina Parcial',
                'Nitrógeno Uréico en Orina Parcial', 'Ácido Úrico en Orina Parcial', 
                'Proteínas en Orina Parcial', 'Fósforo en Orina 24 Horas', 'Potasio en Orina 24 Horas',
                'Depuración Creatinina Orina 24 Horas', 'Ácido Úrico en Orina 24 Horas', 
                'Calcio en Orina 24 Horas', 'Amilasa en Orina 24 Horas', 'Azúcares Reductores',
                'Drogas de Abuso en Orina', 'Albuminuria'
              ].map((examen) => (
                <label 
                  key={examen} 
                  className="flex items-center space-x-3 p-3 rounded-lg 
                            bg-gray-50 dark:bg-[#1E293B] border-transparent
                            hover:bg-gray-100 dark:hover:bg-[#2D3B4F] 
                            transition-colors cursor-pointer group"
                >
                  <Checkbox 
                    className="border-gray-300 dark:border-gray-400 
                              dark:bg-[#1E293B] dark:hover:bg-[#2D3B4F]
                              text-purple-600 dark:text-purple-400
                              h-5 w-5 rounded
                              focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400
                              focus:ring-offset-2 dark:focus:ring-offset-[#0B1120]"
                    checked={(Array.isArray(getValues("orina_examenes")) && 
                             getValues("orina_examenes").includes(examen)) || false}
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
                  <span className="text-gray-700 dark:text-gray-200 group-hover:text-gray-900 
                                    dark:group-hover:text-white transition-colors">
                    {examen}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Hormonal */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4 pl-2 border-l-4 border-pink-500">
              Hormonal
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                'T3', 'FT3', 'T4', 'FT4', 'TSH', 'PTH', 'FSH', 'Androstenediona',
                'Factor de Crecimiento Insulinoide Tipo 1 (IGF-1)', 'Factor de Unión del IGF-1 (IGFBP3)',
                'B-HCG Cualitativa', 'B-HCG Cuantitativa', 'Hormona de Crecimiento',
                'Progesterona', 'Insulina', 'ACTH', 'Prolactina', 'Vitamina D', 
                'Estradiol (E2)', 'LH', 'Cortisol', 'Testosterona Total', 'Testosterona Libre', 'DHEA-S'
              ].map((examen) => (
                <label 
                  key={examen} 
                  className="flex items-center space-x-3 p-3 rounded-lg 
                            bg-gray-50 dark:bg-[#1E293B] border-transparent
                            hover:bg-gray-100 dark:hover:bg-[#2D3B4F] 
                            transition-colors cursor-pointer group"
                >
                  <Checkbox 
                    className="border-gray-300 dark:border-gray-400 
                              dark:bg-[#1E293B] dark:hover:bg-[#2D3B4F]
                              text-pink-600 dark:text-pink-400
                              h-5 w-5 rounded
                              focus:ring-2 focus:ring-pink-500 dark:focus:ring-pink-400
                              focus:ring-offset-2 dark:focus:ring-offset-[#0B1120]"
                    checked={(Array.isArray(getValues("hormonas_examenes")) && 
                             getValues("hormonas_examenes").includes(examen)) || false}
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
                  <span className="text-gray-700 dark:text-gray-200 group-hover:text-gray-900 
                                    dark:group-hover:text-white transition-colors">
                    {examen}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Heces */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4 pl-2 border-l-4 border-orange-500">
              Heces
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                'Parásitos en Heces', 'Sangre Oculta en Heces', 'Leucocitos en Heces',
                'Grasas en Heces', 'Azúcares Reductores en Heces', 'pH en Heces',
                'Coloración de Lugol', 'Moco en Heces', 'Bacterias en Heces'
              ].map((examen) => (
                <label 
                  key={examen} 
                  className="flex items-center space-x-3 p-3 rounded-lg 
                            bg-gray-50 dark:bg-[#1E293B] border-transparent
                            hover:bg-gray-100 dark:hover:bg-[#2D3B4F] 
                            transition-colors cursor-pointer group"
                >
                  <Checkbox 
                    className="border-gray-300 dark:border-gray-400 
                              dark:bg-[#1E293B] dark:hover:bg-[#2D3B4F]
                              text-orange-600 dark:text-orange-400
                              h-5 w-5 rounded
                              focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400
                              focus:ring-offset-2 dark:focus:ring-offset-[#0B1120]"
                    checked={(Array.isArray(getValues("heces_examenes")) && 
                             getValues("heces_examenes").includes(examen)) || false}
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
                  <span className="text-gray-700 dark:text-gray-200 group-hover:text-gray-900 
                                    dark:group-hover:text-white transition-colors">
                    {examen}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Serología */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4 pl-2 border-l-4 border-red-500">
              Serología
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                'Aglutinación Febriles', 'ASTO', 'FR-Latex', 'Dengue (PCR)', 'Chlamydia (PCR)',
                'Pepsinógeno', 'VDRL', 'PCR Semicuantitativa', 'Malaria (PCR)',
                'Sífilis (PCR)', 'Helicobacter Pylori'
              ].map((examen) => (
                <label 
                  key={examen} 
                  className="flex items-center space-x-3 p-3 rounded-lg 
                            bg-gray-50 dark:bg-[#1E293B] border-transparent
                            hover:bg-gray-100 dark:hover:bg-[#2D3B4F] 
                            transition-colors cursor-pointer group"
                >
                  <Checkbox 
                    className="border-gray-300 dark:border-gray-400 
                              dark:bg-[#1E293B] dark:hover:bg-[#2D3B4F]
                              text-red-600 dark:text-red-400
                              h-5 w-5 rounded
                              focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400
                              focus:ring-offset-2 dark:focus:ring-offset-[#0B1120]"
                    checked={(Array.isArray(getValues("serologia_examenes")) && 
                             getValues("serologia_examenes").includes(examen)) || false}
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
                  <span className="text-gray-700 dark:text-gray-200 group-hover:text-gray-900 
                                    dark:group-hover:text-white transition-colors">
                    {examen}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Sección D: Microbiología */}
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 bg-gray-50 dark:bg-[#1E293B] p-3 rounded-md mt-8">
            D. Microbiología
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Muestra</Label>
              <Input {...register('microbiologia.muestra')} />
            </div>
            <div>
              <Label>Sitio Anatómico</Label>
              <Input {...register('microbiologia.sitio_anatomico')} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                {...register('microbiologia.cultivo_y_antibiograma', { setValueAs: v => v === true })} 
              />
              <Label>Cultivo y Antibiograma</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                {...register('microbiologia.cristalografia', { setValueAs: v => v === true })} 
              />
              <Label>Cristalografía</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                {...register('microbiologia.gram', { setValueAs: v => v === true })} 
              />
              <Label>Gram</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                {...register('microbiologia.fresco', { setValueAs: v => v === true })} 
              />
              <Label>Fresco</Label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <Label>Estudio Micologico KOH</Label>
              <Input {...register('microbiologia.estudio_micologico_koh')} />
            </div>
            <div>
              <Label>Cultivo Micótico</Label>
              <Input {...register('microbiologia.cultivo_micotico')} />
            </div>
            <div>
              <Label>Investigación Paragonimus spp</Label>
              <Input {...register('microbiologia.investigacion_paragonimus_spp')} />
            </div>
            <div>
              <Label>Investigación Histoplasma spp</Label>
              <Input {...register('microbiologia.investigacion_histoplasma_spp')} />
            </div>
            <div>
              <Label>Coloración Ziehl-Neelsen</Label>
              <Input {...register('microbiologia.coloracion_zhiel_nielsen')} />
            </div>
          </div>

          {/* Botón de envío */}
          <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button 
              type="submit"
              className="w-full md:w-auto bg-blue-600 dark:bg-[#1E293B] 
                       hover:bg-blue-700 dark:hover:bg-[#2D3B4F] 
                       text-white font-medium py-3 px-8 rounded-lg 
                       transition-all"
            >
              Crear Solicitud
            </Button>
          </div>
        </form>
      </div>
  );
}

