'use client';

import { useForm, useFieldArray, FieldValues } from 'react-hook-form';
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
import { AxiosError } from 'axios';

// Esquema para validación
const nursingFormSchema = z.object({
  // NANDA
  nanda_dominio: z.string().min(1, 'Campo requerido'),
  nanda_clase: z.string().min(1, 'Campo requerido'),
  nanda_etiqueta_diagnostica: z.string().min(1, 'Campo requerido'),
  nanda_factor_relacionado: z.string().min(1, 'Campo requerido'),
  nanda_planteamiento_del_diagnostico: z.string().min(1, 'Campo requerido'),
  // NOC
  noc_resultado_noc: z.string().min(1, 'Campo requerido'),
  noc_dominio: z.string().min(1, 'Campo requerido'),
  noc_clase: z.string().min(1, 'Campo requerido'),
  // Arrays
  noc_indicador: z.array(z.object({ value: z.string() })),
  noc_rango: z.array(z.object({ value: z.string() })),
  noc_diana_inicial: z.array(z.object({ value: z.string() })),
  noc_diana_esperada: z.array(z.object({ value: z.string() })),
  noc_evaluacion: z.array(z.object({ value: z.string() })),
  nic_intervencion: z.array(z.object({ value: z.string() })),
  nic_clase: z.array(z.object({ value: z.string() })),
  nic_actividades: z.array(z.object({ value: z.string() })),
  // IDs
  userId: z.string().uuid(),
  patientId: z.string().uuid(),
});

type NursingFormValues = z.infer<typeof nursingFormSchema>;

// Primero, definimos el tipo para los campos de array
type ArrayFieldName = 
  | "noc_indicador"
  | "noc_rango"
  | "noc_diana_inicial"
  | "noc_diana_esperada"
  | "noc_evaluacion"
  | "nic_intervencion"
  | "nic_clase"
  | "nic_actividades";

export default function NursingNNNForm() {
  const { data: session } = useSession();
  const { toast } = useToast();

  const { register, handleSubmit, control, formState: { errors }, setValue } = useForm<NursingFormValues>({
    resolver: zodResolver(nursingFormSchema),
    mode: "onChange",
    defaultValues: {
      noc_indicador: [{ value: '' }],
      noc_rango: [{ value: '' }],
      noc_diana_inicial: [{ value: '' }],
      noc_diana_esperada: [{ value: '' }],
      noc_evaluacion: [{ value: '' }],
      nic_intervencion: [{ value: '' }],
      nic_clase: [{ value: '' }],
      nic_actividades: [{ value: '' }],
    }
  });

  // Configuración de campos de array para NOC
  const nocIndicadores = useFieldArray({
    control,
    name: "noc_indicador" as const
  });

  const nocRangos = useFieldArray({
    control,
    name: "noc_rango" as const
  });

  const nocDianaInicial = useFieldArray({
    control,
    name: "noc_diana_inicial" as const
  });

  const nocDianaEsperada = useFieldArray({
    control,
    name: "noc_diana_esperada" as const
  });

  const nocEvaluacion = useFieldArray({
    control,
    name: "noc_evaluacion" as const
  });

  const nicIntervencion = useFieldArray({
    control,
    name: "nic_intervencion" as const
  });

  const nicClase = useFieldArray({
    control,
    name: "nic_clase" as const
  });

  const nicActividades = useFieldArray({
    control,
    name: "nic_actividades" as const
  });

  /** Fetch session data (userId y patientId) */
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

  // Mutación con logs detallados
  const mutation = useMutation({
    mutationFn: async (data: NursingFormValues) => {
      console.log('📝 Datos a enviar:', data);
      
      const session = await getSession();
      const token = session?.user.access_token;
      if (!token) {
        throw new Error("No se encontró el token de acceso");
      }

      return await createNursingForm(data, token);
    },
    onSuccess: () => {
      toast({
        title: 'Éxito',
        description: 'Formulario de enfermería creado correctamente',
      });
    },
    onError: (error: any) => {
      console.error('❌ Error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message?.[0] || 'Error al crear el formulario',
      });
    }
  });

  const onSubmit = async (data: NursingFormValues) => {
    try {
      const formattedData = {
        nanda_dominio: data.nanda_dominio,
        nanda_clase: data.nanda_clase,
        nanda_etiqueta_diagnostica: data.nanda_etiqueta_diagnostica,
        nanda_factor_relacionado: data.nanda_factor_relacionado,
        nanda_planteamiento_del_diagnostico: data.nanda_planteamiento_del_diagnostico,
        noc_resultado_noc: data.noc_resultado_noc,
        noc_dominio: data.noc_dominio,
        noc_clase: data.noc_clase,
        noc_indicador: data.noc_indicador.map(item => item.value).filter(Boolean),
        noc_rango: data.noc_rango.map(item => item.value).filter(Boolean),
        noc_diana_inicial: data.noc_diana_inicial.map(item => item.value).filter(Boolean),
        noc_diana_esperada: data.noc_diana_esperada.map(item => item.value).filter(Boolean),
        noc_evaluacion: data.noc_evaluacion.map(item => item.value).filter(Boolean),
        nic_intervencion: data.nic_intervencion.map(item => item.value).filter(Boolean),
        nic_clase: data.nic_clase.map(item => item.value).filter(Boolean),
        nic_actividades: data.nic_actividades.map(item => item.value).filter(Boolean),
        userId: data.userId,
        patientId: data.patientId
      };

      await mutation.mutateAsync(formattedData);
    } catch (error) {
      if (error instanceof AxiosError) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error.response?.data?.message?.[0] || 'Error al crear el formulario'
        });
      }
    }
  };

  const handleAddIndicator = () => {
    nocIndicadores.append({ value: '' });
    nocRangos.append({ value: '' });
    nocDianaInicial.append({ value: '' });
    nocDianaEsperada.append({ value: '' });
    nocEvaluacion.append({ value: '' });
  };

  const handleAddIntervencion = () => {
    nicIntervencion.append({ value: '' });
    nicClase.append({ value: '' });
    nicActividades.append({ value: '' });
  };

  return (
    <div className="container mx-auto p-6 bg-[#f0f4f8] dark:bg-[#0B1120] rounded-lg">
      <div className="bg-white dark:bg-[#0B1120] p-6 rounded-lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 border-b border-gray-200 dark:border-gray-800 pb-2">
            Formulario de Enfermería NNN (NANDA-NOC-NIC)
          </h1>

          {/* Sección A: NANDA - Diagnóstico de Enfermería */}
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 bg-gray-50 dark:bg-[#1E293B] p-3 rounded-md">
            A. NANDA - Diagnóstico de Enfermería
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
              {errors.nanda_dominio && (
                <p className="text-sm text-red-500">{errors.nanda_dominio.message}</p>
              )}
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
              {errors.nanda_clase && (
                <p className="text-sm text-red-500">{errors.nanda_clase.message}</p>
              )}
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
              {errors.nanda_etiqueta_diagnostica && (
                <p className="text-sm text-red-500">{errors.nanda_etiqueta_diagnostica.message}</p>
              )}
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
              {errors.nanda_factor_relacionado && (
                <p className="text-sm text-red-500">{errors.nanda_factor_relacionado.message}</p>
              )}
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
              {errors.nanda_planteamiento_del_diagnostico && (
                <p className="text-sm text-red-500">{errors.nanda_planteamiento_del_diagnostico.message}</p>
              )}
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
              {errors.noc_resultado_noc && (
                <p className="text-sm text-red-500">{errors.noc_resultado_noc.message}</p>
              )}
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
              {errors.noc_dominio && (
                <p className="text-sm text-red-500">{errors.noc_dominio.message}</p>
              )}
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
              {errors.noc_clase && (
                <p className="text-sm text-red-500">{errors.noc_clase.message}</p>
              )}
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
                onClick={handleAddIndicator}
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
                    {...register(`noc_indicador.${index}.value`)}
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                    Rango
                  </Label>
                  <Input
                    className="w-full bg-white dark:bg-[#1E293B]"
                    {...register(`noc_rango.${index}.value`)}
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                    Diana Inicial
                  </Label>
                  <Input
                    className="w-full bg-white dark:bg-[#1E293B]"
                    {...register(`noc_diana_inicial.${index}.value`)}
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                    Diana Esperada
                  </Label>
                  <Input
                    className="w-full bg-white dark:bg-[#1E293B]"
                    {...register(`noc_diana_esperada.${index}.value`)}
                  />
                </div>
                <div className="flex items-end">
                  <div className="flex-1">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                      Evaluación
                    </Label>
                    <Input
                      className="w-full bg-white dark:bg-[#1E293B]"
                      {...register(`noc_evaluacion.${index}.value`)}
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
                onClick={handleAddIntervencion}
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
                    {...register(`nic_intervencion.${index}.value`)}
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                    Clase
                  </Label>
                  <Input
                    className="w-full bg-white dark:bg-[#1E293B]"
                    {...register(`nic_clase.${index}.value`)}
                  />
                </div>
                <div className="flex items-end">
                  <div className="flex-1">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                      Actividades
                    </Label>
                    <Textarea
                      className="w-full bg-white dark:bg-[#1E293B] min-h-24"
                      {...register(`nic_actividades.${index}.value`)}
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
              disabled={mutation.isPending}
            >
              {mutation.isPending ? 'Guardando...' : 'Guardar Formulario'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
