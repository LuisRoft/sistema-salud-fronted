'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { getSession } from 'next-auth/react';
import { createNursingForm } from '@/services/nursingService';
import { useNursingValidation } from '@/hooks/use-nursing-validation';
import { calculateCompletionPercentage } from '@/lib/nursing-validation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, Form } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Minus, Save } from 'lucide-react';
import { NursingFormData } from '@/types/nursing';
import NursingValidationSummary from './nursing-validation-summary';
import NursingCoherenceChecker from './nursing-coherence-checker';
import NursingFieldValidator, { ArrayFieldValidator } from './nursing-field-validator';
import NursingProgressTracker from './nursing-progress-tracker';

// Datos de referencia (en un sistema real, estos vendrían de una API)
const nandaData = [
  { value: '00001', label: '00001 Desequilibrio nutricional por exceso' },
  { value: '00002', label: '00002 Desequilibrio nutricional por defecto' },
  { value: '00003', label: '00003 Riesgo de desequilibrio nutricional por exceso' },
  { value: '00004', label: '00004 Riesgo de infección' },
  { value: '00005', label: '00005 Riesgo de desequilibrio de la temperatura corporal' },
];

const nicData = [
  { value: '5612', label: '5612-Enseñanza: ejercicio prescrito' },
  { value: '0140', label: '0140 Favorecimiento de la mecánica corporal' },
  { value: '0200', label: '0200 Favorecimiento del ejercicio' },
  { value: '0201', label: '0201 Favorecimiento del ejercicio: entrenamiento de fuerza' },
  { value: '0202', label: '0202 Favorecimiento del ejercicio: estiramientos' },
];

const nocData = [
  { value: '0002', label: '0002-Conservación de la energía' },
  { value: '0003', label: '0003-Descanso' },
  { value: '0006', label: '0006-Energía psicomotora' },
  { value: '0007', label: '0007-Nivel de fatiga' },
  { value: '0001', label: '0001-Resistencia' },
];

export default function NursingForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showValidation, setShowValidation] = useState(true);
  const [completedFields, setCompletedFields] = useState(0);
  const [realCompletionPercentage, setRealCompletionPercentage] = useState(0);
  const totalFields = 17;

  const {
    form,
    validationState,
    validateFormCompletely,
    clearValidationErrors,
    isFormValid
  } = useNursingValidation();

  // Contar campos completados con validación mejorada
  useEffect(() => {
    const subscription = form.watch((value) => {
      const formData = value as NursingFormData;
      let completed = 0;

      // Campos de texto simples - validación más estricta
      if (formData.nanda_dominio && formData.nanda_dominio.trim()) completed++;
      if (formData.nanda_clase && formData.nanda_clase.trim().length >= 3) completed++;
      if (formData.nanda_etiqueta_diagnostica && formData.nanda_etiqueta_diagnostica.trim().length >= 3) completed++;
      if (formData.nanda_factor_relacionado && formData.nanda_factor_relacionado.trim().length >= 3) completed++;
      if (formData.nanda_planteamiento_del_diagnostico && formData.nanda_planteamiento_del_diagnostico.trim().length >= 10) completed++;
      if (formData.noc_resultado_noc && formData.noc_resultado_noc.trim()) completed++;
      if (formData.noc_dominio && formData.noc_dominio.trim().length >= 3) completed++;
      if (formData.noc_clase && formData.noc_clase.trim().length >= 3) completed++;

      // Arrays - validación más estricta (todos los elementos deben estar completos)
      if (formData.noc_indicador && formData.noc_indicador.length > 0 && 
          formData.noc_indicador.every(item => item && item.trim().length >= 3)) completed++;
      if (formData.noc_rango && formData.noc_rango.length > 0 && 
          formData.noc_rango.every(item => item && /^\d+$/.test(item.trim()))) completed++;
      if (formData.noc_diana_inicial && formData.noc_diana_inicial.length > 0 && 
          formData.noc_diana_inicial.every(item => item && /^[1-5]$/.test(item.trim()))) completed++;
      if (formData.noc_diana_esperada && formData.noc_diana_esperada.length > 0 && 
          formData.noc_diana_esperada.every(item => item && /^[1-5]$/.test(item.trim()))) completed++;
      if (formData.noc_evaluacion && formData.noc_evaluacion.length > 0 && 
          formData.noc_evaluacion.every(item => item && item.trim().length >= 3)) completed++;
      if (formData.nic_intervencion && formData.nic_intervencion.length > 0 && 
          formData.nic_intervencion.every(item => item && item.trim())) completed++;
      if (formData.nic_clase && formData.nic_clase.length > 0 && 
          formData.nic_clase.every(item => item && item.trim().length >= 3)) completed++;
      if (formData.nic_actividades && formData.nic_actividades.length > 0 && 
          formData.nic_actividades.every(item => item && item.trim().length >= 10)) completed++;

      // Verificar coherencia entre arrays relacionados
      if (formData.noc_indicador && formData.noc_rango && formData.noc_diana_inicial && formData.noc_diana_esperada) {
        const lengthsMatch = formData.noc_indicador.length === formData.noc_rango.length &&
                           formData.noc_rango.length === formData.noc_diana_inicial.length &&
                           formData.noc_diana_inicial.length === formData.noc_diana_esperada.length;
        
        // Bonificación por coherencia de arrays
        if (lengthsMatch && completed >= 12) {
          completed = Math.min(completed + 1, totalFields);
        }
      }

      // Calcular el porcentaje real de completitud usando la nueva función
      const realPercentage = calculateCompletionPercentage(formData);
      
      setCompletedFields(completed);
      setRealCompletionPercentage(realPercentage);
    });

    return () => subscription.unsubscribe();
  }, [form, totalFields]);

  // Mutación para crear el formulario
  const { mutate, isPending } = useMutation({
    mutationFn: async (values: NursingFormData) => {
      console.log('🔄 Mutación iniciada con valores:', values);
      
      const session = await getSession();
      console.log('👤 Sesión obtenida:', session);
      
      const token = session?.user.access_token;
      if (!token) {
        console.log('❌ Token no disponible');
        throw new Error('Token no disponible');
      }
      
      console.log('🔑 Token obtenido:', token ? 'Sí' : 'No');
      
      // Obtener IDs reales de la sesión
      // El UUID real del usuario está en el token JWT, no en session.user.id
      let userId: string;
      try {
        const token = session.user.access_token;
        const tokenParts = token.split('.');
        const payload = JSON.parse(atob(tokenParts[1]));
        userId = payload.id; // Este es el UUID real del usuario
        console.log('🔑 UUID extraído del token:', userId);
      } catch (error) {
        console.error('❌ Error al extraer UUID del token:', error);
        throw new Error('No se pudo extraer el UUID del usuario del token');
      }
      
      // El paciente está en team.patient["0"] debido a la estructura del backend
      const patientData = session.user.team?.patient;
      let patientId: string | undefined;
      
      if (patientData && typeof patientData === 'object') {
        // Buscar la primera clave que no sea "caregivers"
        const patientKeys = Object.keys(patientData).filter(key => key !== 'caregivers');
        if (patientKeys.length > 0) {
          const firstPatientKey = patientKeys[0];
          patientId = (patientData as any)[firstPatientKey]?.id;
        }
      }
      
      console.log('🔍 Datos de sesión:', {
        userId: userId,
        userIdType: typeof userId,
        userIdLength: userId?.length,
        team: session.user.team,
        patient: session.user.team?.patient,
        patientId: patientId,
        patientIdType: typeof patientId,
        patientKeys: patientData ? Object.keys(patientData) : [],
        firstPatient: patientData && typeof patientData === 'object' ? 
          (patientData as any)[Object.keys(patientData).filter(key => key !== 'caregivers')[0]] : null
      });
      
      if (!userId) {
        throw new Error('ID de usuario no disponible');
      }
      
      if (!patientId) {
        console.error('❌ Estructura de sesión:', JSON.stringify(session, null, 2));
        throw new Error('ID de paciente no disponible');
      }
      
      // Agregar IDs reales y fecha actual
      const formData = {
        ...values,
        userId: userId,
        patientId: patientId,
        fecha: new Date().toISOString() // Fecha actual en formato ISO
      };
      
      console.log('📤 Enviando datos al servicio:', formData);
      return await createNursingForm(formData, token);
    },
    onSuccess: (data) => {
      console.log('🎉 Mutación exitosa:', data);
      toast({ 
        title: 'Éxito', 
        description: 'Formulario de enfermería creado correctamente' 
      });
      queryClient.invalidateQueries({ queryKey: ['nursing'] });
      form.reset();
      clearValidationErrors();
    },
    onError: (error: unknown) => {
      console.log('❌ Error en mutación:', error);
      toast({ 
        title: 'Error', 
        description: (error as Error).message, 
        variant: 'destructive' 
      });
    },
  });

  // Función para manejar el envío del formulario
  const onSubmit = (data: NursingFormData) => {
    console.log('🚀 onSubmit ejecutado con data:', data);
    console.log('📊 Progreso real:', realCompletionPercentage);
    
    // Verificar que el progreso real sea 100%
    if (realCompletionPercentage < 100) {
      console.log('❌ Formulario incompleto:', realCompletionPercentage);
      toast({
        title: 'Formulario incompleto',
        description: `Formulario al ${realCompletionPercentage}%. Complete todos los campos antes de enviar.`,
        variant: 'destructive'
      });
      return;
    }

    // Verificar validación básica
    const isValidationOk = validateFormCompletely();
    console.log('✅ Validación completa:', isValidationOk);
    
    if (!isValidationOk) {
      console.log('❌ Error de validación');
      toast({
        title: 'Error de validación',
        description: 'Por favor, corrija los errores antes de enviar',
        variant: 'destructive'
      });
      return;
    }

    console.log('🎉 Formulario válido, iniciando envío...');
    toast({
      title: 'Enviando formulario',
      description: 'Formulario válido y completo. Enviando...',
    });

    console.log('📤 Llamando mutate con data:', data);
    mutate(data);
  };

  // Función para agregar elemento a un array
  const addArrayItem = (fieldName: keyof NursingFormData) => {
    const currentValue = form.getValues(fieldName) as string[] || [''];
    form.setValue(fieldName, [...currentValue, '']);
  };

  // Función para remover elemento de un array
  const removeArrayItem = (fieldName: keyof NursingFormData, index: number) => {
    const currentValue = form.getValues(fieldName) as string[] || [''];
    if (currentValue.length > 1) {
      const newValue = currentValue.filter((_, i) => i !== index);
      form.setValue(fieldName, newValue);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header del formulario */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Formulario de Enfermería
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Sistema de Diagnóstico NANDA, Resultados NOC e Intervenciones NIC
        </p>
        <div className="flex justify-center space-x-2">
          <Badge variant="outline">NANDA</Badge>
          <Badge variant="outline">NOC</Badge>
          <Badge variant="outline">NIC</Badge>
        </div>
      </div>

      {/* Resumen de validación completo */}
      <NursingValidationSummary
        validationState={validationState}
        totalFields={totalFields}
        completedFields={completedFields}
      />

      {/* Verificador de coherencia */}
      <NursingCoherenceChecker
        formData={form.watch()}
        onCoherenceChange={(isCoherent, issues) => {
          // Coherencia actualizada silenciosamente
          if (!isCoherent && issues.length > 0) {
            // Solo mostrar en consola si hay errores críticos
            // console.log('Errores de coherencia:', issues);
          }
        }}
      />

      {/* Seguimiento detallado de progreso */}
      <NursingProgressTracker
        formData={form.watch()}
        validationErrors={validationState.fieldErrors}
        completionPercentage={realCompletionPercentage}
        onFieldFocus={(fieldName) => {
          // Enfocar el campo específico (scroll hacia él)
          const element = document.querySelector(`[name="${fieldName}"]`) as HTMLElement;
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element.focus();
          }
        }}
      />

      {/* Formulario principal */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          
          {/* Sección NANDA */}
          <div className="border rounded-lg p-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="mb-6">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 dark:text-blue-300 font-bold">1</span>
                </div>
                <span className="text-xl font-semibold text-gray-900 dark:text-gray-100">Diagnóstico NANDA</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Complete la información del diagnóstico de enfermería según la taxonomía NANDA
              </p>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  name="nanda_dominio"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center space-x-2 mb-2">
                        <FormLabel>Dominio NANDA *</FormLabel>
                        <NursingFieldValidator
                          fieldName="nanda_dominio"
                          value={field.value}
                          error={validationState.fieldErrors.nanda_dominio}
                          isRequired={true}
                          validationRules={['Seleccione un dominio NANDA válido']}
                          showValidation={showValidation}
                        />
                      </div>
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione un dominio" />
                          </SelectTrigger>
                          <SelectContent>
                            {nandaData.map((item) => (
                              <SelectItem key={item.value} value={item.value}>
                                {item.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name="nanda_clase"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center space-x-2 mb-2">
                        <FormLabel>Clase NANDA *</FormLabel>
                        <NursingFieldValidator
                          fieldName="nanda_clase"
                          value={field.value}
                          error={validationState.fieldErrors.nanda_clase}
                          isRequired={true}
                          validationRules={['Mínimo 3 caracteres']}
                          showValidation={showValidation}
                        />
                      </div>
                      <FormControl>
                        <Input {...field} placeholder="Ingrese la clase" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                name="nanda_etiqueta_diagnostica"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Etiqueta Diagnóstica NANDA *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ingrese la etiqueta diagnóstica" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="nanda_factor_relacionado"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Factor Relacionado *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ingrese el factor relacionado" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="nanda_planteamiento_del_diagnostico"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Planteamiento del Diagnóstico *</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Describa el planteamiento del diagnóstico..."
                        className="min-h-[100px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Sección NOC */}
          <div className="border rounded-lg p-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="mb-6">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <span className="text-green-600 dark:text-green-300 font-bold">2</span>
                </div>
                <span className="text-xl font-semibold text-gray-900 dark:text-gray-100">Resultados NOC</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Defina los resultados esperados según la taxonomía NOC
              </p>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  name="noc_resultado_noc"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Resultado NOC *</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione un resultado" />
                          </SelectTrigger>
                          <SelectContent>
                            {nocData.map((item) => (
                              <SelectItem key={item.value} value={item.value}>
                                {item.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name="noc_dominio"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dominio NOC *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ingrese el dominio" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                name="noc_clase"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Clase NOC *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ingrese la clase" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Arrays relacionados */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">Indicadores, Rangos y Dianas</h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                    onClick={() => {
                      addArrayItem('noc_indicador');
                      addArrayItem('noc_rango');
                      addArrayItem('noc_diana_inicial');
                      addArrayItem('noc_diana_esperada');
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Indicador
                  </Button>
                </div>

                {form.watch('noc_indicador')?.map((_, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <FormField
                      name={`noc_indicador.${index}`}
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Indicador {index + 1}</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Indicador" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      name={`noc_rango.${index}`}
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rango {index + 1}</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Rango" type="number" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      name={`noc_diana_inicial.${index}`}
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Diana Inicial {index + 1}</FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger>
                                <SelectValue placeholder="1-5" />
                              </SelectTrigger>
                              <SelectContent>
                                {[1, 2, 3, 4, 5].map((num) => (
                                  <SelectItem key={num} value={num.toString()}>
                                    {num}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      name={`noc_diana_esperada.${index}`}
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Diana Esperada {index + 1}</FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger>
                                <SelectValue placeholder="1-5" />
                              </SelectTrigger>
                              <SelectContent>
                                {[1, 2, 3, 4, 5].map((num) => (
                                  <SelectItem key={num} value={num.toString()}>
                                    {num}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex items-end">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="border-gray-300 dark:border-gray-600 hover:bg-red-50 dark:hover:bg-red-900 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400"
                        onClick={() => {
                          removeArrayItem('noc_indicador', index);
                          removeArrayItem('noc_rango', index);
                          removeArrayItem('noc_diana_inicial', index);
                          removeArrayItem('noc_diana_esperada', index);
                        }}
                        disabled={form.watch('noc_indicador')?.length === 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <FormField
                name="noc_evaluacion"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Evaluación NOC</FormLabel>
                    <div className="space-y-2">
                      {field.value?.map((_, index) => (
                        <div key={index} className="flex space-x-2">
                          <FormControl>
                            <Input
                              value={field.value?.[index] || ''}
                              onChange={(e) => {
                                const newValue = [...(field.value || [])];
                                newValue[index] = e.target.value;
                                field.onChange(newValue);
                              }}
                              placeholder={`Evaluación ${index + 1}`}
                            />
                          </FormControl>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="border-gray-300 dark:border-gray-600 hover:bg-red-50 dark:hover:bg-red-900 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400"
                            onClick={() => {
                              const newValue = field.value?.filter((_, i) => i !== index) || [];
                              field.onChange(newValue);
                            }}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                        onClick={() => {
                          const newValue = [...(field.value || []), ''];
                          field.onChange(newValue);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar Evaluación
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Sección NIC */}
          <div className="border rounded-lg p-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="mb-6">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 dark:text-purple-300 font-bold">3</span>
                </div>
                <span className="text-xl font-semibold text-gray-900 dark:text-gray-100">Intervenciones NIC</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Defina las intervenciones de enfermería según la taxonomía NIC
              </p>
            </div>
            <div className="space-y-4">
              <FormField
                name="nic_intervencion"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Intervenciones NIC *</FormLabel>
                    <div className="space-y-2">
                      {field.value?.map((_, index) => (
                        <div key={index} className="flex space-x-2">
                          <FormControl>
                            <Select
                              value={field.value?.[index] || ''}
                              onValueChange={(value) => {
                                const newValue = [...(field.value || [])];
                                newValue[index] = value;
                                field.onChange(newValue);
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccione una intervención" />
                              </SelectTrigger>
                              <SelectContent>
                                {nicData.map((item) => (
                                  <SelectItem key={item.value} value={item.value}>
                                    {item.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="border-gray-300 dark:border-gray-600 hover:bg-red-50 dark:hover:bg-red-900 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400"
                            onClick={() => {
                              const newValue = field.value?.filter((_, i) => i !== index) || [];
                              field.onChange(newValue);
                            }}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                        onClick={() => {
                          const newValue = [...(field.value || []), ''];
                          field.onChange(newValue);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar Intervención
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="nic_clase"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Clases NIC</FormLabel>
                    <div className="space-y-2">
                      {field.value?.map((_, index) => (
                        <div key={index} className="flex space-x-2">
                          <FormControl>
                            <Input
                              value={field.value?.[index] || ''}
                              onChange={(e) => {
                                const newValue = [...(field.value || [])];
                                newValue[index] = e.target.value;
                                field.onChange(newValue);
                              }}
                              placeholder={`Clase ${index + 1}`}
                            />
                          </FormControl>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="border-gray-300 dark:border-gray-600 hover:bg-red-50 dark:hover:bg-red-900 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400"
                            onClick={() => {
                              const newValue = field.value?.filter((_, i) => i !== index) || [];
                              field.onChange(newValue);
                            }}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                        onClick={() => {
                          const newValue = [...(field.value || []), ''];
                          field.onChange(newValue);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar Clase
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="nic_actividades"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Actividades NIC</FormLabel>
                    <div className="space-y-2">
                      {field.value?.map((_, index) => (
                        <div key={index} className="flex space-x-2">
                          <FormControl>
                            <Textarea
                              value={field.value?.[index] || ''}
                              onChange={(e) => {
                                const newValue = [...(field.value || [])];
                                newValue[index] = e.target.value;
                                field.onChange(newValue);
                              }}
                              placeholder={`Actividad ${index + 1}`}
                              className="min-h-[60px]"
                            />
                          </FormControl>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="border-gray-300 dark:border-gray-600 hover:bg-red-50 dark:hover:bg-red-900 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400"
                            onClick={() => {
                              const newValue = field.value?.filter((_, i) => i !== index) || [];
                              field.onChange(newValue);
                            }}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                        onClick={() => {
                          const newValue = [...(field.value || []), ''];
                          field.onChange(newValue);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar Actividad
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-4">
              <Button
                type="button"
                variant="outline"
                className="border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                onClick={() => setShowValidation(!showValidation)}
              >
                {showValidation ? 'Ocultar Validación' : 'Mostrar Validación'}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                className="border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                onClick={clearValidationErrors}
              >
                Limpiar Errores
              </Button>
              
              <Button
                type="button"
                variant="outline"
                className="border-blue-300 dark:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-700 text-blue-700 dark:text-blue-300"
                onClick={() => {
                  console.log('🧪 Test de envío iniciado');
                  const data = form.getValues();
                  onSubmit(data);
                }}
              >
                🧪 Test Envío
              </Button>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {completedFields} de {totalFields} campos completados
                <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  Progreso real: <span className="font-semibold">{realCompletionPercentage}%</span> - {totalFields - completedFields} campos pendientes
                </div>
              </div>
              
              {/* Botón de diagnóstico de campos faltantes */}
              {completedFields < totalFields && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="border-yellow-300 dark:border-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900 text-yellow-700 dark:text-yellow-300"
                  onClick={() => {
                    const formData = form.getValues();
                    const missingFields = [];
                    
                    if (!formData.nanda_dominio?.trim()) missingFields.push('Dominio NANDA');
                    if (!formData.nanda_clase?.trim() || formData.nanda_clase.trim().length < 3) missingFields.push('Clase NANDA');
                    if (!formData.nanda_etiqueta_diagnostica?.trim() || formData.nanda_etiqueta_diagnostica.trim().length < 3) missingFields.push('Etiqueta Diagnóstica NANDA');
                    if (!formData.nanda_factor_relacionado?.trim() || formData.nanda_factor_relacionado.trim().length < 3) missingFields.push('Factor Relacionado NANDA');
                    if (!formData.nanda_planteamiento_del_diagnostico?.trim() || formData.nanda_planteamiento_del_diagnostico.trim().length < 10) missingFields.push('Planteamiento del Diagnóstico NANDA');
                    if (!formData.noc_resultado_noc?.trim()) missingFields.push('Resultado NOC');
                    if (!formData.noc_dominio?.trim() || formData.noc_dominio.trim().length < 3) missingFields.push('Dominio NOC');
                    if (!formData.noc_clase?.trim() || formData.noc_clase.trim().length < 3) missingFields.push('Clase NOC');
                    
                    if (!formData.noc_indicador?.length || !formData.noc_indicador.every(item => item?.trim().length >= 3)) missingFields.push('Indicadores NOC');
                    if (!formData.noc_rango?.length || !formData.noc_rango.every(item => item && /^\d+$/.test(item.trim()))) missingFields.push('Rangos NOC');
                    if (!formData.noc_diana_inicial?.length || !formData.noc_diana_inicial.every(item => item && /^[1-5]$/.test(item.trim()))) missingFields.push('Dianas Iniciales NOC');
                    if (!formData.noc_diana_esperada?.length || !formData.noc_diana_esperada.every(item => item && /^[1-5]$/.test(item.trim()))) missingFields.push('Dianas Esperadas NOC');
                    if (!formData.noc_evaluacion?.length || !formData.noc_evaluacion.every(item => item?.trim().length >= 3)) missingFields.push('Evaluaciones NOC');
                    if (!formData.nic_intervencion?.length || !formData.nic_intervencion.every(item => item?.trim())) missingFields.push('Intervenciones NIC');
                    if (!formData.nic_clase?.length || !formData.nic_clase.every(item => item?.trim().length >= 3)) missingFields.push('Clases NIC');
                    if (!formData.nic_actividades?.length || !formData.nic_actividades.every(item => item?.trim().length >= 10)) missingFields.push('Actividades NIC');
                    
                    toast({
                      title: "Campos Pendientes",
                      description: missingFields.length > 0 ? 
                        `Faltan completar: ${missingFields.slice(0, 3).join(', ')}${missingFields.length > 3 ? ` y ${missingFields.length - 3} más...` : ''}` :
                        "¡Todos los campos están completos!",
                      variant: missingFields.length > 0 ? "default" : "default"
                    });
                  }}
                >
                  🔍 Ver qué falta
                </Button>
              )}
              
              <Button
                type="button"
                disabled={isPending || (realCompletionPercentage < 100)}
                className={`min-w-[120px] ${realCompletionPercentage === 100 ? 'bg-green-600 hover:bg-green-700' : ''}`}
                onClick={() => {
                  console.log('💾 Botón Guardar presionado');
                  const data = form.getValues();
                  onSubmit(data);
                }}
              >
                {isPending ? (
                  'Guardando...'
                ) : realCompletionPercentage === 100 ? (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    ✅ Guardar Formulario
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Guardar ({realCompletionPercentage}%)
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
