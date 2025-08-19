'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { getSession } from 'next-auth/react';
import { createNursingForm } from '@/services/nursingService';
import { useNursingValidation } from '@/hooks/use-nursing-validation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, Form } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Minus, Save } from 'lucide-react';
import { NursingFormData } from '@/types/nursing';

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
  const totalFields = 17;

  const {
    form,
    validationState,
    validateFormCompletely,
    clearValidationErrors,
    isFormValid
  } = useNursingValidation();

  // Contar campos completados
  useEffect(() => {
    const subscription = form.watch((value) => {
      const formData = value as NursingFormData;
      let completed = 0;

      // Campos de texto simples
      if (formData.nanda_dominio) completed++;
      if (formData.nanda_clase) completed++;
      if (formData.nanda_etiqueta_diagnostica) completed++;
      if (formData.nanda_factor_relacionado) completed++;
      if (formData.nanda_planteamiento_del_diagnostico) completed++;
      if (formData.noc_resultado_noc) completed++;
      if (formData.noc_dominio) completed++;
      if (formData.noc_clase) completed++;

      // Arrays (contar como completados si tienen al menos un elemento válido)
      if (formData.noc_indicador && formData.noc_indicador.some(item => item.trim())) completed++;
      if (formData.noc_rango && formData.noc_rango.some(item => item.trim())) completed++;
      if (formData.noc_diana_inicial && formData.noc_diana_inicial.some(item => item.trim())) completed++;
      if (formData.noc_diana_esperada && formData.noc_diana_esperada.some(item => item.trim())) completed++;
      if (formData.noc_evaluacion && formData.noc_evaluacion.some(item => item.trim())) completed++;
      if (formData.nic_intervencion && formData.nic_intervencion.some(item => item.trim())) completed++;
      if (formData.nic_clase && formData.nic_clase.some(item => item.trim())) completed++;
      if (formData.nic_actividades && formData.nic_actividades.some(item => item.trim())) completed++;

      setCompletedFields(completed);
    });

    return () => subscription.unsubscribe();
  }, [form]);

  // Mutación para crear el formulario
  const { mutate, isPending } = useMutation({
    mutationFn: async (values: NursingFormData) => {
      const session = await getSession();
      const token = session?.user.access_token;
      if (!token) throw new Error('Token no disponible');
      
      // Agregar IDs de usuario y paciente (en un sistema real, estos vendrían del contexto)
      const formData = {
        ...values,
        userId: 'user-123', // Placeholder
        patientId: 'patient-456' // Placeholder
      };
      
      return await createNursingForm(formData, token);
    },
    onSuccess: () => {
      toast({ 
        title: 'Éxito', 
        description: 'Formulario de enfermería creado correctamente' 
      });
      queryClient.invalidateQueries({ queryKey: ['nursing'] });
      form.reset();
      clearValidationErrors();
    },
    onError: (error: unknown) => {
      toast({ 
        title: 'Error', 
        description: (error as Error).message, 
        variant: 'destructive' 
      });
    },
  });

  // Función para manejar el envío del formulario
  const onSubmit = (data: NursingFormData) => {
    if (!validateFormCompletely()) {
      toast({
        title: 'Error de validación',
        description: 'Por favor, corrija los errores antes de enviar',
        variant: 'destructive'
      });
      return;
    }

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

      {/* Estado de validación */}
      <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-blue-900 dark:text-blue-100">Estado del Formulario</h3>
            <p className="text-sm text-blue-600 dark:text-blue-300">
              {completedFields} de {totalFields} campos completados ({Math.round((completedFields / totalFields) * 100)}%)
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {isFormValid ? 'Válido' : 'Con Errores'}
            </div>
            <div className="text-sm text-blue-600 dark:text-blue-300">
              {Object.values(validationState.fieldErrors).filter(error => error).length} errores
            </div>
          </div>
        </div>
      </div>

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
                      <FormLabel>Dominio NANDA *</FormLabel>
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
                      <FormLabel>Clase NANDA *</FormLabel>
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
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {completedFields} de {totalFields} campos completados
              </div>
              
              <Button
                type="submit"
                disabled={isPending || !isFormValid}
                className="min-w-[120px]"
              >
                {isPending ? (
                  'Guardando...'
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Guardar
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
