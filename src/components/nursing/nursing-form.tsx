'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getSession } from 'next-auth/react';

import { useToast } from '@/hooks/use-toast';
import { createNursingForm } from '@/services/nursingService';
import { useNursingValidation } from '@/hooks/use-nursing-validation';
import { calculateCompletionPercentage } from '@/lib/nursing-validation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, Form } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

import { Plus, Minus, Save, Users } from 'lucide-react';

import { NursingFormData } from '@/types/nursing';
import NursingValidationSummary from './nursing-validation-summary';
import NursingCoherenceChecker from './nursing-coherence-checker';
import NursingFieldValidator, { ArrayFieldValidator } from './nursing-field-validator';
import NursingProgressTracker from './nursing-progress-tracker';

import { Patient } from '@/services/patientService';
import { PatientSelector } from '../shared/patient-selector';

// =====================================
// Tipos locales
// =====================================
type RefItem = { value: string; label: string };

type Option = { value: string; label: string };

function SearchSelectBasic({
  value,
  onChange,
  options,
  placeholder = 'Buscar…',
  emptyText = 'Sin resultados',
}: {
  value?: string;
  onChange: (val: string) => void;
  options: Option[];
  placeholder?: string;
  emptyText?: string;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');

  const filtered = options.filter(
    (o) =>
      o.label.toLowerCase().includes(q.toLowerCase()) ||
      o.value.toLowerCase().includes(q.toLowerCase())
  );

  const current = options.find((o) => o.value === value)?.label ?? '';

  // cierra si haces click fuera
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!(e.target as HTMLElement)?.closest?.('[data-ssb-root]')) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  return (
    <div data-ssb-root className="relative w-full">
      {/* Trigger */}
      <button
        type="button"
        className="w-full min-h-10 rounded-md border border-input bg-background px-3 py-2 text-left text-sm flex items-center justify-between"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className={current ? '' : 'text-muted-foreground'}>
          {current || 'Selecciona…'}
        </span>
        <svg width="16" height="16" viewBox="0 0 20 20" className="opacity-60">
          <path d="M5 7l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute left-0 right-0 mt-2 rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800"
        >
          {/* input fijo arriba */}
          <div className="p-2 border-b border-gray-100 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800">
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={placeholder}
              className="h-9"
              autoFocus
            />
          </div>

          {/* lista */}
          <div className="max-h-72 overflow-auto py-1">
            {filtered.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                {emptyText}
              </div>
            ) : (
              filtered.map((opt) => (
                <div
                  key={opt.value}
                  className="cursor-pointer px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 whitespace-normal break-words"
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                    setQ('');
                  }}
                >
                  {opt.label}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}


// =====================================
// Componente
// =====================================
export default function NursingForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // ---- UI / progreso
  const [showValidation, setShowValidation] = useState(true);
  const [completedFields, setCompletedFields] = useState(0);
  const [realCompletionPercentage, setRealCompletionPercentage] = useState(0);
  const totalFields = 17;

  // ---- Paciente seleccionado
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // ---- Catálogos (desde /public/*.json)
  const [nandaData, setNandaData] = useState<RefItem[]>([]);
  const [nicData, setNicData] = useState<RefItem[]>([]);
  const [nocData, setNocData] = useState<RefItem[]>([]);
  const [loadingCatalogs, setLoadingCatalogs] = useState({
    nanda: true,
    nic: true,
    noc: true,
  });
  const [catalogError, setCatalogError] = useState<string | null>(null);

  // ---- Form (custom hook)
  const {
    form,
    validationState,
    validateFormCompletely,
    clearValidationErrors,
  } = useNursingValidation();

  // =====================================
  // Cargar catálogos desde /public
  // =====================================
  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const [nanda, nic, noc] = await Promise.all([
          fetch('/nanda.json').then((r) => r.json()),
          fetch('/nic.json').then((r) => r.json()),
          fetch('/noc.json').then((r) => r.json()),
        ]);

        if (!isMounted) return;

        setNandaData(Array.isArray(nanda) ? nanda : []);
        setNicData(Array.isArray(nic) ? nic : []);
        setNocData(Array.isArray(noc) ? noc : []);
      } catch (err) {
        if (isMounted) setCatalogError('No se pudieron cargar los catálogos (nanda/nic/noc).');
      } finally {
        if (isMounted) {
          setLoadingCatalogs({ nanda: false, nic: false, noc: false });
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  // =====================================
  // Selección de paciente
  // =====================================
  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    // Guardar id en el form (lo exige el backend)
    form.setValue('patientId', patient.id, { shouldDirty: true, shouldValidate: true });
  };

  // =====================================
  // Progreso en tiempo real
  // =====================================
  useEffect(() => {
    const subscription = form.watch((value) => {
      const formData = value as NursingFormData;
      let completed = 0;

      // Reglas (coinciden con tu lógica previa)
      if (formData.nanda_dominio?.trim()) completed++;
      if (formData.nanda_clase?.trim().length >= 3) completed++;
      if (formData.nanda_etiqueta_diagnostica?.trim().length >= 3) completed++;
      if (formData.nanda_factor_relacionado?.trim().length >= 3) completed++;
      if (formData.nanda_planteamiento_del_diagnostico?.trim().length >= 10) completed++;

      if (formData.noc_resultado_noc?.trim()) completed++;
      if (formData.noc_dominio?.trim().length >= 3) completed++;
      if (formData.noc_clase?.trim().length >= 3) completed++;

      if (formData.noc_indicador?.length && formData.noc_indicador.every((i) => i?.trim().length >= 3)) completed++;
      if (formData.noc_rango?.length && formData.noc_rango.every((i) => /^\d+$/.test(i?.trim()))) completed++;
      if (formData.noc_diana_inicial?.length && formData.noc_diana_inicial.every((i) => /^[1-5]$/.test(i?.trim()))) completed++;
      if (formData.noc_diana_esperada?.length && formData.noc_diana_esperada.every((i) => /^[1-5]$/.test(i?.trim()))) completed++;
      if (formData.noc_evaluacion?.length && formData.noc_evaluacion.every((i) => i?.trim().length >= 3)) completed++;

      if (formData.nic_intervencion?.length && formData.nic_intervencion.every((i) => i?.trim())) completed++;
      if (formData.nic_clase?.length && formData.nic_clase.every((i) => i?.trim().length >= 3)) completed++;
      if (formData.nic_actividades?.length && formData.nic_actividades.every((i) => i?.trim().length >= 10)) completed++;

      setCompletedFields(completed);
      setRealCompletionPercentage(calculateCompletionPercentage(formData));
    });

    return () => subscription.unsubscribe();
  }, [form, totalFields]);

  // =====================================
  // Helpers para arrays del form (NOC/NIC)
  // =====================================
  const addArrayItem = (fieldName: keyof NursingFormData) => {
    const currentValue = (form.getValues(fieldName) as string[]) || [''];
    form.setValue(fieldName, [...currentValue, ''], { shouldDirty: true, shouldValidate: true });
  };

  const removeArrayItem = (fieldName: keyof NursingFormData, index: number) => {
    const currentValue = (form.getValues(fieldName) as string[]) || [''];
    if (currentValue.length > 1) {
      const newValue = currentValue.filter((_, i) => i !== index);
      form.setValue(fieldName, newValue, { shouldDirty: true, shouldValidate: true });
    }
  };

  // =====================================
  // Mutación (crear formulario)
  // =====================================
  const { mutate, isPending } = useMutation({
    mutationFn: async (values: NursingFormData) => {
      const session = await getSession();
      const token = session?.user.access_token;
      if (!token) throw new Error('Token no disponible');

      // El UUID real del usuario viene en el JWT
      let userId: string;
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        userId = payload.id;
      } catch {
        throw new Error('No se pudo extraer el UUID del usuario del token');
      }

      if (!userId) throw new Error('ID de usuario no disponible');
      if (!values.patientId) throw new Error('ID de paciente no disponible');

      // Payload final
      const formData = {
        ...values,
        userId,
        fecha: new Date().toISOString(),
      };

      return await createNursingForm(formData, token);
    },
    onSuccess: () => {
      toast({ title: 'Éxito', description: 'Formulario de enfermería creado correctamente' });
      queryClient.invalidateQueries({ queryKey: ['nursing'] });
      form.reset();
      clearValidationErrors();
      setSelectedPatient(null);
    },
    onError: (error: unknown) => {
      toast({
        title: 'Error',
        description: (error as Error).message,
        variant: 'destructive',
      });
    },
  });

  // =====================================
  // Submit
  // =====================================
  const onSubmit = (data: NursingFormData) => {
    if (realCompletionPercentage < 100) {
      toast({
        title: 'Formulario incompleto',
        description: `Formulario al ${realCompletionPercentage}%. Complete todos los campos antes de enviar.`,
        variant: 'destructive',
      });
      return;
    }

    if (!validateFormCompletely()) {
      toast({
        title: 'Error de validación',
        description: 'Por favor, corrija los errores antes de enviar',
        variant: 'destructive',
      });
      return;
    }

    mutate(data);
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
          {/* Header / Selección de paciente */}
            <div className="border rounded-lg p-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    Formulario de Enfermería (NANDA–NOC–NIC)
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Seleccione el usuario/paciente para asociar el registro.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {selectedPatient && (
                    <Badge variant="secondary" className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>{selectedPatient.name} {selectedPatient.lastName}</span>
                    </Badge>
                  )}

                  <PatientSelector onSelect={handlePatientSelect} />
                </div>
              </div>
            </div>

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
                          <Input {...field} placeholder="Ingrese el dominio (texto libre)" />
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
                      <SearchSelectBasic
                        value={field.value}
                        onChange={field.onChange}
                        options={nandaData} // [{value,label}]
                        placeholder="Buscar etiqueta NANDA…"
                      />
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
                          <SearchSelectBasic
                            value={field.value}
                            onChange={field.onChange}
                            options={nocData}
                            placeholder="Buscar resultado NOC…"
                          />
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
                          <div key={index} className="flex gap-2">
                            <FormControl>
                              <SearchSelectBasic
                                value={field.value?.[index] || ''}
                                onChange={(val) => {
                                  const newValue = [...(field.value || [])];
                                  newValue[index] = val;
                                  field.onChange(newValue);
                                }}
                                options={nicData}
                                placeholder="Buscar intervención NIC…"
                              />
                            </FormControl>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
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
