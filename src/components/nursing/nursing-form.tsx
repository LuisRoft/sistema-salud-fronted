'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { getSession, useSession } from 'next-auth/react';
import { useEffect } from "react";
import { PlusCircle, Trash2 } from 'lucide-react';
import { createNursingForm } from '@/services/nursingService';

// Esquema para validación
const nursingFormSchema = z.object({
  numero_de_archivo: z.string().min(1, 'Campo obligatorio'),
  // NANDA
  nanda_dominio: z.string().optional(),
  nanda_clase: z.string().optional(),
  nanda_etiqueta_diagnostica: z.string().optional(),
  nanda_factor_relacionado: z.string().optional(),
  nanda_planteamiento_del_diagnostico: z.string().optional(),
  // NOC
  noc_resultado_noc: z.string().optional(),
  noc_dominio: z.string().optional(),
  noc_clase: z.string().optional(),
  noc_indicador: z.array(z.string()).optional().default([]),
  noc_rango: z.array(z.string()).optional().default([]),
  noc_diana_inicial: z.array(z.string()).optional().default([]),
  noc_diana_esperada: z.array(z.string()).optional().default([]),
  noc_evaluacion: z.array(z.string()).optional().default([]),
  // NIC
  nic_intervencion: z.array(z.string()).optional().default([]),
  nic_clase: z.array(z.string()).optional().default([]),
  nic_actividades: z.array(z.string()).optional().default([]),
  // IDs
  userId: z.string().uuid(),
  patientId: z.string().uuid(),
});

type NursingFormValues = z.infer<typeof nursingFormSchema>;

export default function NursingNNNForm() {
  const { data: session } = useSession();
  const { toast } = useToast();

  const { register, handleSubmit, control, formState: { errors }, setValue } = useForm<NursingFormValues>({
    resolver: zodResolver(nursingFormSchema),
    mode: "onChange",
    defaultValues: {
      noc_indicador: [''],
      noc_rango: [''],
      noc_diana_inicial: [''],
      noc_diana_esperada: [''],
      noc_evaluacion: [''],
      nic_intervencion: [''],
      nic_clase: [''],
      nic_actividades: [''],
    }
  });

  // Configuración de campos de array para NOC
  const nocIndicadores = useFieldArray({
    control,
    name: "noc_indicador"
  });

  const nocRangos = useFieldArray({
    control,
    name: "noc_rango"
  });

  const nocDianaInicial = useFieldArray({
    control,
    name: "noc_diana_inicial"
  });

  const nocDianaEsperada = useFieldArray({
    control,
    name: "noc_diana_esperada"
  });

  const nocEvaluacion = useFieldArray({
    control,
    name: "noc_evaluacion"
  });

  // Configuración de campos de array para NIC
  const nicIntervencion = useFieldArray({
    control,
    name: "nic_intervencion"
  });

  const nicClase = useFieldArray({
    control,
    name: "nic_clase"
  });

  const nicActividades = useFieldArray({
    control,
    name: "nic_actividades"
  });

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
        const userId = payload.id;

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

  // Mutación para enviar el formulario
  const mutation = useMutation({
    mutationFn: async (data: NursingFormValues) => {
      const session = await getSession();
      const token = session?.user.access_token;

      if (!token) {
        throw new Error("No se encontró el token de acceso");
      }

      // Aquí iría la llamada a tu API
      const response = await createNursingForm(data, token);
      return response;

      // Simulación provisional
      console.log("Datos enviados:", data);
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: 'Éxito',
        description: 'Formulario de enfermería creado correctamente',
      });
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Error al crear el formulario';
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
      });
    }
  });

  const onSubmit = async (data: NursingFormValues) => {
    try {
      await mutation.mutateAsync(data);
    } catch (error) {
      console.error("Error en submit:", error);
    }
  };

  /** 🔹 Muestra errores en la consola para debugging */
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      console.error("🚨 Errores en el formulario:", errors);
    }
  }, [errors]);

  return (
    <div className="container mx-auto p-6 bg-[#f0f4f8] dark:bg-[#0B1120] rounded-lg">
      <div className="bg-white dark:bg-[#0B1120] p-6 rounded-lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 border-b border-gray-200 dark:border-gray-800 pb-2">
            Formulario de Enfermería NNN (NANDA-NOC-NIC)
          </h1>

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
              {errors.numero_de_archivo && (
                <p className="text-sm text-red-500">{errors.numero_de_archivo.message}</p>
              )}
            </div>
          </div>

          {/* Sección B: NANDA - Diagnóstico de Enfermería */}
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 bg-gray-50 dark:bg-[#1E293B] p-3 rounded-md mt-8">
            B. NANDA - Diagnóstico de Enfermería
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Dominio
              </Label>
              <Input
                className="w-full bg-white dark:bg-[#1E293B] border-gray-200 
                         dark:border-transparent focus:border-blue-500 
                         dark:focus:border-transparent text-gray-900 dark:text-gray-100"
                {...register('nanda_dominio')}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Clase
              </Label>
              <Input
                className="w-full bg-white dark:bg-[#1E293B] border-gray-200 
                         dark:border-transparent focus:border-blue-500 
                         dark:focus:border-transparent text-gray-900 dark:text-gray-100"
                {...register('nanda_clase')}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Etiqueta Diagnóstica
              </Label>
              <Input
                className="w-full bg-white dark:bg-[#1E293B] border-gray-200 
                         dark:border-transparent focus:border-blue-500 
                         dark:focus:border-transparent text-gray-900 dark:text-gray-100"
                {...register('nanda_etiqueta_diagnostica')}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Factor Relacionado
              </Label>
              <Input
                className="w-full bg-white dark:bg-[#1E293B] border-gray-200 
                         dark:border-transparent focus:border-blue-500 
                         dark:focus:border-transparent text-gray-900 dark:text-gray-100"
                {...register('nanda_factor_relacionado')}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Planteamiento del Diagnóstico
              </Label>
              <Textarea
                className="w-full bg-white dark:bg-[#1E293B] border-gray-200 
                         dark:border-transparent focus:border-blue-500 
                         dark:focus:border-transparent text-gray-900 dark:text-gray-100 min-h-32"
                {...register('nanda_planteamiento_del_diagnostico')}
              />
            </div>
          </div>

          {/* Sección C: NOC - Resultados de Enfermería */}
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 bg-gray-50 dark:bg-[#1E293B] p-3 rounded-md mt-8">
            C. NOC - Resultados de Enfermería
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Resultado NOC
              </Label>
              <Input
                className="w-full bg-white dark:bg-[#1E293B] border-gray-200 
                         dark:border-transparent focus:border-blue-500 
                         dark:focus:border-transparent text-gray-900 dark:text-gray-100"
                {...register('noc_resultado_noc')}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Dominio
              </Label>
              <Input
                className="w-full bg-white dark:bg-[#1E293B] border-gray-200 
                         dark:border-transparent focus:border-blue-500 
                         dark:focus:border-transparent text-gray-900 dark:text-gray-100"
                {...register('noc_dominio')}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Clase
              </Label>
              <Input
                className="w-full bg-white dark:bg-[#1E293B] border-gray-200 
                         dark:border-transparent focus:border-blue-500 
                         dark:focus:border-transparent text-gray-900 dark:text-gray-100"
                {...register('noc_clase')}
              />
            </div>
          </div>

          {/* NOC Indicadores - Campos dinámicos */}
          <div className="mt-6 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-800 dark:text-white">
                Indicadores y Escalas NOC
              </h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  nocIndicadores.append('');
                  nocRangos.append('');
                  nocDianaInicial.append('');
                  nocDianaEsperada.append('');
                  nocEvaluacion.append('');
                }}
                className="flex items-center gap-1 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800"
              >
                <PlusCircle className="h-4 w-4" />
                Añadir indicador
              </Button>
            </div>

            {nocIndicadores.fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4 pb-4 border-b border-gray-100 dark:border-gray-800">
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                    Indicador
                  </Label>
                  <Input
                    className="w-full bg-white dark:bg-[#1E293B]"
                    {...register(`noc_indicador.${index}`)}
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                    Rango
                  </Label>
                  <Input
                    className="w-full bg-white dark:bg-[#1E293B]"
                    {...register(`noc_rango.${index}`)}
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                    Diana Inicial
                  </Label>
                  <Input
                    className="w-full bg-white dark:bg-[#1E293B]"
                    {...register(`noc_diana_inicial.${index}`)}
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                    Diana Esperada
                  </Label>
                  <Input
                    className="w-full bg-white dark:bg-[#1E293B]"
                    {...register(`noc_diana_esperada.${index}`)}
                  />
                </div>
                <div className="flex items-end">
                  <div className="flex-1">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                      Evaluación
                    </Label>
                    <Input
                      className="w-full bg-white dark:bg-[#1E293B]"
                      {...register(`noc_evaluacion.${index}`)}
                    />
                  </div>
                  {index > 0 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="ml-2 mb-1 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      onClick={() => {
                        nocIndicadores.remove(index);
                        nocRangos.remove(index);
                        nocDianaInicial.remove(index);
                        nocDianaEsperada.remove(index);
                        nocEvaluacion.remove(index);
                      }}
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Sección D: NIC - Intervenciones de Enfermería */}
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 bg-gray-50 dark:bg-[#1E293B] p-3 rounded-md mt-8">
            D. NIC - Intervenciones de Enfermería
          </h2>

          <div className="mt-6 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-800 dark:text-white">
                Intervenciones y Actividades
              </h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  nicIntervencion.append('');
                  nicClase.append('');
                  nicActividades.append('');
                }}
                className="flex items-center gap-1 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800"
              >
                <PlusCircle className="h-4 w-4" />
                Añadir intervención
              </Button>
            </div>

            {nicIntervencion.fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 pb-4 border-b border-gray-100 dark:border-gray-800">
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                    Intervención
                  </Label>
                  <Input
                    className="w-full bg-white dark:bg-[#1E293B]"
                    {...register(`nic_intervencion.${index}`)}
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                    Clase
                  </Label>
                  <Input
                    className="w-full bg-white dark:bg-[#1E293B]"
                    {...register(`nic_clase.${index}`)}
                  />
                </div>
                <div className="flex items-end">
                  <div className="flex-1">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                      Actividades
                    </Label>
                    <Textarea
                      className="w-full bg-white dark:bg-[#1E293B] min-h-24"
                      {...register(`nic_actividades.${index}`)}
                      placeholder="Describa las actividades relacionadas con esta intervención"
                    />
                  </div>
                  {index > 0 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="ml-2 mb-1 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      onClick={() => {
                        nicIntervencion.remove(index);
                        nicClase.remove(index);
                        nicActividades.remove(index);
                      }}
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
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
              Crear Formulario de Enfermería
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
