import { z } from 'zod';

// Esquema base para arrays de strings
const stringArraySchema = z.array(z.string().min(1, 'Campo requerido')).min(1, 'Al menos un elemento es requerido');

// Esquema para validación de rangos numéricos
const rangeSchema = z.array(z.string().regex(/^\d+$/, 'Debe ser un número')).min(1, 'Al menos un rango es requerido');

// Esquema para validación de dianas (deben ser números entre 1-5)
const dianaSchema = z.array(
  z.string().regex(/^[1-5]$/, 'La diana debe ser un número entre 1 y 5')
).min(1, 'Al menos una diana es requerida');

// Esquema principal para el formulario de enfermería
export const nursingFormSchema = z.object({
  // Sección NANDA (Diagnóstico de Enfermería)
  nanda_dominio: z.string().min(1, 'Dominio NANDA es requerido'),
  nanda_clase: z.string().min(1, 'Clase NANDA es requerida'),
  nanda_etiqueta_diagnostica: z.string().min(1, 'Etiqueta diagnóstica NANDA es requerida'),
  nanda_factor_relacionado: z.string().min(1, 'Factor relacionado es requerido'),
  nanda_planteamiento_del_diagnostico: z.string().min(10, 'El planteamiento debe tener al menos 10 caracteres'),

  // Sección NOC (Resultados Esperados)
  noc_resultado_noc: z.string().min(1, 'Resultado NOC es requerido'),
  noc_dominio: z.string().min(1, 'Dominio NOC es requerido'),
  noc_clase: z.string().min(1, 'Clase NOC es requerida'),
  noc_indicador: stringArraySchema,
  noc_rango: rangeSchema,
  noc_diana_inicial: dianaSchema,
  noc_diana_esperada: dianaSchema,
  noc_evaluacion: stringArraySchema,

  // Sección NIC (Intervenciones de Enfermería)
  nic_intervencion: stringArraySchema,
  nic_clase: stringArraySchema,
  nic_actividades: stringArraySchema,

  // Identificadores
  userId: z.string().min(1, 'Usuario es requerido'),
  patientId: z.string().min(1, 'Paciente es requerido'),
}).refine((data) => {
  // Validación cruzada: verificar que las dianas esperadas sean mayores o iguales a las iniciales
  if (data.noc_diana_inicial.length !== data.noc_diana_esperada.length) {
    return false;
  }
  
  for (let i = 0; i < data.noc_diana_inicial.length; i++) {
    const inicial = parseInt(data.noc_diana_inicial[i]);
    const esperada = parseInt(data.noc_diana_esperada[i]);
    if (esperada < inicial) {
      return false;
    }
  }
  return true;
}, {
  message: 'Las dianas esperadas deben ser mayores o iguales a las iniciales',
  path: ['noc_diana_esperada']
}).refine((data) => {
  // Validación: verificar que el número de indicadores coincida con el número de rangos y dianas
  const indicadoresCount = data.noc_indicador.length;
  const rangosCount = data.noc_rango.length;
  const dianasInicialesCount = data.noc_diana_inicial.length;
  const dianasEsperadasCount = data.noc_diana_esperada.length;
  
  return indicadoresCount === rangosCount && 
         indicadoresCount === dianasInicialesCount && 
         indicadoresCount === dianasEsperadasCount;
}, {
  message: 'El número de indicadores, rangos y dianas debe ser igual',
  path: ['noc_indicador']
});

// Esquema para validación de campos individuales
export const fieldValidationSchema = {
  nanda_dominio: z.string().min(1, 'Dominio NANDA es requerido'),
  nanda_clase: z.string().min(1, 'Clase NANDA es requerida'),
  nanda_etiqueta_diagnostica: z.string().min(1, 'Etiqueta diagnóstica NANDA es requerida'),
  nanda_factor_relacionado: z.string().min(1, 'Factor relacionado es requerido'),
  nanda_planteamiento_del_diagnostico: z.string().min(10, 'El planteamiento debe tener al menos 10 caracteres'),
  noc_resultado_noc: z.string().min(1, 'Resultado NOC es requerido'),
  noc_dominio: z.string().min(1, 'Dominio NOC es requerido'),
  noc_clase: z.string().min(1, 'Clase NOC es requerida'),
  noc_indicador: stringArraySchema,
  noc_rango: rangeSchema,
  noc_diana_inicial: dianaSchema,
  noc_diana_esperada: dianaSchema,
  noc_evaluacion: stringArraySchema,
  nic_intervencion: stringArraySchema,
  nic_clase: stringArraySchema,
  nic_actividades: stringArraySchema,
};

// Tipo derivado del esquema
export type NursingFormData = z.infer<typeof nursingFormSchema>;

// Esquema para validación de coherencia entre secciones
export const coherenceValidationSchema = z.object({
  nanda_dominio: z.string(),
  noc_dominio: z.string(),
  nic_clase: z.array(z.string()),
}).refine(() => {
  // Validación básica de coherencia entre dominios
  // En un sistema real, aquí se implementarían reglas de negocio más complejas
  return true;
}, {
  message: 'Verificar coherencia entre el diagnóstico NANDA y los resultados NOC',
  path: ['noc_dominio']
});

// Función para validar un campo específico
export const validateField = (fieldName: keyof NursingFormData, value: unknown) => {
  const fieldSchema = fieldValidationSchema[fieldName as keyof typeof fieldValidationSchema];
  if (!fieldSchema) return { isValid: true, error: null };
  
  try {
    fieldSchema.parse(value);
    return { isValid: true, error: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { isValid: false, error: error.errors[0].message };
    }
    return { isValid: false, error: 'Error de validación desconocido' };
  }
};

// Función para validar coherencia del formulario completo
export const validateFormCoherence = (data: Partial<NursingFormData>) => {
  try {
    coherenceValidationSchema.parse(data);
    return { isValid: true, errors: [] };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { isValid: false, errors: error.errors.map(e => e.message) };
    }
    return { isValid: false, errors: ['Error de validación desconocido'] };
  }
};
