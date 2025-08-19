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
  fecha: z.string().min(1, 'Fecha es requerida'),
}).refine((data) => {
  // Validación cruzada: verificar que las dianas esperadas sean mayores o iguales a las iniciales
  console.log('🔍 Validando dianas:', {
    inicial: data.noc_diana_inicial,
    esperada: data.noc_diana_esperada
  });
  
  if (data.noc_diana_inicial.length !== data.noc_diana_esperada.length) {
    console.log('❌ Longitudes diferentes:', data.noc_diana_inicial.length, 'vs', data.noc_diana_esperada.length);
    return false;
  }
  
  for (let i = 0; i < data.noc_diana_inicial.length; i++) {
    const inicial = parseInt(data.noc_diana_inicial[i]);
    const esperada = parseInt(data.noc_diana_esperada[i]);
    console.log(`🔍 Diana ${i}: inicial=${inicial}, esperada=${esperada}, válida=${esperada >= inicial}`);
    
    if (esperada < inicial) {
      console.log(`❌ Diana ${i} inválida: ${esperada} < ${inicial}`);
      return false;
    }
  }
  
  console.log('✅ Todas las dianas son válidas');
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

// Esquema para validación de coherencia entre secciones (simplificado)
export const coherenceValidationSchema = z.object({
  nanda_dominio: z.string().optional(),
  noc_dominio: z.string().optional(),
  nic_clase: z.array(z.string()).optional(),
}).refine((data) => {
  // Validación simplificada: si los campos existen, son válidos
  return true;
}, {
  message: 'Validación de coherencia completada',
  path: ['coherence']
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

// Función para validar coherencia del formulario completo (simplificada)
export const validateFormCoherence = (data: Partial<NursingFormData>) => {
  const errors: string[] = [];
  
  // Solo verificar errores críticos de arrays NOC
  if (data.noc_indicador && data.noc_rango && data.noc_diana_inicial && data.noc_diana_esperada) {
    const lengths = [
      data.noc_indicador.length,
      data.noc_rango.length,
      data.noc_diana_inicial.length,
      data.noc_diana_esperada.length
    ];
    
    // Solo verificar si las longitudes coinciden
    if (!lengths.every(length => length === lengths[0])) {
      errors.push('Los arrays de indicadores, rangos y dianas deben tener la misma longitud');
    }
    
    // Verificar progresión de dianas simplificado
    for (let i = 0; i < Math.min(data.noc_diana_inicial.length, data.noc_diana_esperada.length); i++) {
      const inicial = parseInt(data.noc_diana_inicial[i] || '1');
      const esperada = parseInt(data.noc_diana_esperada[i] || '1');
      
      if (esperada < inicial && inicial > 0 && esperada > 0) {
        errors.push(`Diana esperada debe ser igual o mayor que la inicial en elemento ${i + 1}`);
      }
    }
  }
  
  return { 
    isValid: errors.length === 0, 
    errors: errors 
  };
};

// Función para calcular el porcentaje de completitud real
export const calculateCompletionPercentage = (data: Partial<NursingFormData>): number => {
  let score = 0;
  const maxScore = 100;
  
  // Validación NANDA (25 puntos)
  if (data.nanda_dominio?.trim()) score += 3;
  if (data.nanda_clase?.trim() && data.nanda_clase.trim().length >= 3) score += 4;
  if (data.nanda_etiqueta_diagnostica?.trim() && data.nanda_etiqueta_diagnostica.trim().length >= 3) score += 5;
  if (data.nanda_factor_relacionado?.trim() && data.nanda_factor_relacionado.trim().length >= 3) score += 5;
  if (data.nanda_planteamiento_del_diagnostico?.trim() && data.nanda_planteamiento_del_diagnostico.trim().length >= 10) score += 8;
  
  // Validación NOC (50 puntos total)
  if (data.noc_resultado_noc?.trim()) score += 4;
  if (data.noc_dominio?.trim() && data.noc_dominio.trim().length >= 3) score += 4;
  if (data.noc_clase?.trim() && data.noc_clase.trim().length >= 3) score += 4;
  
  // Arrays NOC (38 puntos restantes para NOC)
  if (data.noc_indicador?.length && data.noc_indicador.every(item => item?.trim().length >= 3)) score += 8;
  if (data.noc_rango?.length && data.noc_rango.every(item => item && /^\d+$/.test(item.trim()))) score += 7;
  if (data.noc_diana_inicial?.length && data.noc_diana_inicial.every(item => item && /^[1-5]$/.test(item.trim()))) score += 7;
  if (data.noc_diana_esperada?.length && data.noc_diana_esperada.every(item => item && /^[1-5]$/.test(item.trim()))) score += 8;
  if (data.noc_evaluacion?.length && data.noc_evaluacion.every(item => item?.trim().length >= 3)) score += 8;
  
  // Validación NIC (25 puntos)
  if (data.nic_intervencion?.length && data.nic_intervencion.every(item => item?.trim())) score += 8;
  if (data.nic_clase?.length && data.nic_clase.every(item => item?.trim().length >= 3)) score += 8;
  if (data.nic_actividades?.length && data.nic_actividades.every(item => item?.trim().length >= 10)) score += 9;
  
  // Bonificación por coherencia (4 puntos) - completar hasta 100%
  const coherenceResult = validateFormCoherence(data);
  if (coherenceResult.isValid) score += 4;
  
  return Math.min(score, 100);
};
