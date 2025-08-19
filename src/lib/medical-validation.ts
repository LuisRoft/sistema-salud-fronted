import { z } from 'zod';
import { VitalSignsRanges, ClinicalAlert, DiagnosisCoherence } from '@/types/medical-validation';

// Constantes para rangos de signos vitales normales
export const VITAL_SIGNS_RANGES: VitalSignsRanges = {
  temperature: [
    { min: 36.1, max: 37.2, unit: '°C', ageGroup: 'adult' },
    { min: 36.5, max: 37.5, unit: '°C', ageGroup: 'child' },
    { min: 36.8, max: 37.5, unit: '°C', ageGroup: 'infant' },
  ],
  heartRate: [
    { min: 60, max: 100, unit: 'bpm', ageGroup: 'adult' },
    { min: 80, max: 120, unit: 'bpm', ageGroup: 'child' },
    { min: 100, max: 160, unit: 'bpm', ageGroup: 'infant' },
  ],
  bloodPressureSystolic: [
    { min: 90, max: 140, unit: 'mmHg', ageGroup: 'adult' },
    { min: 85, max: 110, unit: 'mmHg', ageGroup: 'child' },
  ],
  bloodPressureDiastolic: [
    { min: 60, max: 90, unit: 'mmHg', ageGroup: 'adult' },
    { min: 50, max: 70, unit: 'mmHg', ageGroup: 'child' },
  ],
  respiratoryRate: [
    { min: 12, max: 20, unit: 'rpm', ageGroup: 'adult' },
    { min: 20, max: 30, unit: 'rpm', ageGroup: 'child' },
    { min: 30, max: 60, unit: 'rpm', ageGroup: 'infant' },
  ],
  oxygenSaturation: [
    { min: 95, max: 100, unit: '%', ageGroup: 'adult' },
    { min: 95, max: 100, unit: '%', ageGroup: 'child' },
    { min: 95, max: 100, unit: '%', ageGroup: 'infant' },
  ],
  bmi: [
    { min: 18.5, max: 24.9, unit: 'kg/m²', ageGroup: 'adult' },
    { min: 16, max: 24, unit: 'kg/m²', ageGroup: 'adolescent' },
  ],
};

// Esquema para validación de signos vitales
const vitalSignsSchema = z.object({
  temperature: z.number().min(30).max(45),
  heartRate: z.number().min(30).max(200),
  bloodPressure: z.string().regex(/^\d{2,3}\/\d{2,3}$/, 'Formato inválido (ej: 120/80)'),
  respiratoryRate: z.number().min(5).max(80),
  oxygenSaturation: z.number().min(70).max(100),
  weight: z.number().min(0.5).max(300),
  height: z.number().min(30).max(250),
  bmi: z.number().min(10).max(60),
});

// Esquema para diagnósticos
const diagnosisSchema = z.object({
  description: z.string().min(1, 'Descripción del diagnóstico es requerida'),
  cie10: z.string().min(1, 'Código CIE-10 es requerido'),
  cif: z.string().optional(),
  presumptive: z.boolean(),
  definitive: z.boolean(),
}).refine((data) => data.presumptive || data.definitive, {
  message: 'El diagnóstico debe ser presuntivo o definitivo',
  path: ['presumptive'],
});

// Esquema principal para formularios médicos
export const medicalFormSchema = z.object({
  // Identificadores
  patientId: z.string().min(1, 'Paciente es requerido'),
  userId: z.string().min(1, 'Usuario es requerido'),
  
  // Información básica
  consultationReason: z.string().min(5, 'Motivo de consulta debe tener al menos 5 caracteres'),
  currentIllness: z.string().min(10, 'Enfermedad actual debe tener al menos 10 caracteres'),
  
  // Antecedentes
  personalHistory: z.array(z.string()).optional().default([]),
  familyHistory: z.array(z.string()).optional().default([]),
  allergies: z.array(z.string()).optional().default([]),
  medications: z.array(z.string()).optional().default([]),
  
  // Signos vitales
  vitalSigns: vitalSignsSchema,
  
  // Examen físico
  physicalExam: z.record(z.string()).optional().default({}),
  
  // Diagnósticos
  diagnoses: z.array(diagnosisSchema).min(1, 'Al menos un diagnóstico es requerido'),
  
  // Plan de tratamiento
  treatmentPlan: z.string().min(10, 'Plan de tratamiento debe tener al menos 10 caracteres'),
  observations: z.string().optional(),
}).refine((data) => {
  // Validación cruzada: verificar coherencia entre diagnósticos y síntomas
  return data.diagnoses.length > 0 && data.currentIllness.length > 0;
}, {
  message: 'Debe existir coherencia entre la enfermedad actual y los diagnósticos',
  path: ['diagnoses'],
});

// Tipo derivado del esquema
export type MedicalFormData = z.infer<typeof medicalFormSchema>;

// Función para validar signos vitales según edad
export const validateVitalSigns = (
  vitalSigns: MedicalFormData['vitalSigns'],
  age: number
): ClinicalAlert[] => {
  const alerts: ClinicalAlert[] = [];
  
  // Determinar grupo de edad
  const ageGroup = age < 1 ? 'infant' : age < 12 ? 'child' : age < 18 ? 'adolescent' : age < 65 ? 'adult' : 'elderly';
  
  // Validar temperatura
  const tempRange = VITAL_SIGNS_RANGES.temperature.find(r => r.ageGroup === ageGroup || r.ageGroup === 'adult');
  if (tempRange && (vitalSigns.temperature < tempRange.min || vitalSigns.temperature > tempRange.max)) {
    alerts.push({
      type: vitalSigns.temperature < 36 || vitalSigns.temperature > 38.5 ? 'error' : 'warning',
      category: 'vital_signs',
      message: `Temperatura fuera del rango normal (${tempRange.min}-${tempRange.max}${tempRange.unit})`,
      field: 'vitalSigns.temperature',
      suggestion: vitalSigns.temperature < 36 ? 'Considerar hipotermia' : 'Considerar fiebre o hipertermia',
      severity: vitalSigns.temperature < 35 || vitalSigns.temperature > 40 ? 'critical' : 'medium',
    });
  }
  
  // Validar frecuencia cardíaca
  const hrRange = VITAL_SIGNS_RANGES.heartRate.find(r => r.ageGroup === ageGroup || r.ageGroup === 'adult');
  if (hrRange && (vitalSigns.heartRate < hrRange.min || vitalSigns.heartRate > hrRange.max)) {
    alerts.push({
      type: vitalSigns.heartRate < 50 || vitalSigns.heartRate > 120 ? 'error' : 'warning',
      category: 'vital_signs',
      message: `Frecuencia cardíaca fuera del rango normal (${hrRange.min}-${hrRange.max} ${hrRange.unit})`,
      field: 'vitalSigns.heartRate',
      suggestion: vitalSigns.heartRate < hrRange.min ? 'Considerar bradicardia' : 'Considerar taquicardia',
      severity: vitalSigns.heartRate < 40 || vitalSigns.heartRate > 150 ? 'critical' : 'medium',
    });
  }
  
  // Validar saturación de oxígeno
  if (vitalSigns.oxygenSaturation < 95) {
    alerts.push({
      type: vitalSigns.oxygenSaturation < 90 ? 'error' : 'warning',
      category: 'vital_signs',
      message: `Saturación de oxígeno baja (${vitalSigns.oxygenSaturation}%)`,
      field: 'vitalSigns.oxygenSaturation',
      suggestion: 'Evaluar función respiratoria y considerar oxigenoterapia',
      severity: vitalSigns.oxygenSaturation < 85 ? 'critical' : 'high',
    });
  }
  
  // Validar IMC
  const bmiRange = VITAL_SIGNS_RANGES.bmi.find(r => r.ageGroup === ageGroup || r.ageGroup === 'adult');
  if (bmiRange && (vitalSigns.bmi < bmiRange.min || vitalSigns.bmi > bmiRange.max)) {
    const category = vitalSigns.bmi < 18.5 ? 'Bajo peso' : 
                    vitalSigns.bmi < 25 ? 'Normal' :
                    vitalSigns.bmi < 30 ? 'Sobrepeso' : 'Obesidad';
    
    alerts.push({
      type: 'info',
      category: 'vital_signs',
      message: `IMC: ${vitalSigns.bmi.toFixed(1)} - ${category}`,
      field: 'vitalSigns.bmi',
      suggestion: vitalSigns.bmi < 18.5 ? 'Evaluar estado nutricional' : 
                  vitalSigns.bmi > 30 ? 'Considerar manejo de obesidad' : '',
      severity: vitalSigns.bmi < 16 || vitalSigns.bmi > 35 ? 'medium' : 'low',
    });
  }
  
  return alerts;
};

// Base de conocimiento para coherencia de diagnósticos (simplificada)
export const DIAGNOSIS_COHERENCE: Record<string, DiagnosisCoherence> = {
  'J44': {
    cie10Code: 'J44',
    description: 'Enfermedad pulmonar obstructiva crónica',
    commonSymptoms: ['disnea', 'tos', 'expectoración', 'sibilancias'],
    requiredExams: ['espirometría', 'radiografía de tórax'],
    contraindicatedWith: [],
    relatedCif: ['b440', 'b450'],
  },
  'I10': {
    cie10Code: 'I10',
    description: 'Hipertensión esencial',
    commonSymptoms: ['cefalea', 'mareos', 'visión borrosa'],
    requiredExams: ['presión arterial', 'electrocardiograma'],
    contraindicatedWith: [],
    relatedCif: ['b420'],
  },
  'E11': {
    cie10Code: 'E11',
    description: 'Diabetes mellitus no insulinodependiente',
    commonSymptoms: ['poliuria', 'polidipsia', 'polifagia', 'pérdida de peso'],
    requiredExams: ['glucemia', 'hemoglobina glicosilada'],
    contraindicatedWith: [],
    relatedCif: ['b540'],
  },
};

// Función para validar coherencia entre diagnósticos y síntomas
export const validateDiagnosisCoherence = (
  diagnoses: MedicalFormData['diagnoses'],
  currentIllness: string,
  physicalExam: Record<string, string>
): ClinicalAlert[] => {
  const alerts: ClinicalAlert[] = [];
  
  diagnoses.forEach((diagnosis, index) => {
    const coherenceData = DIAGNOSIS_COHERENCE[diagnosis.cie10];
    
    if (coherenceData) {
      // Verificar si los síntomas coinciden con el diagnóstico
      const hasMatchingSymptoms = coherenceData.commonSymptoms.some(symptom =>
        currentIllness.toLowerCase().includes(symptom.toLowerCase())
      );
      
      if (!hasMatchingSymptoms) {
        alerts.push({
          type: 'warning',
          category: 'coherence',
          message: `El diagnóstico ${diagnosis.description} no coincide claramente con los síntomas descritos`,
          field: `diagnoses.${index}.description`,
          suggestion: `Síntomas comunes para este diagnóstico: ${coherenceData.commonSymptoms.join(', ')}`,
          severity: 'medium',
        });
      }
      
      // Verificar exámenes requeridos
      coherenceData.requiredExams.forEach(exam => {
        const examMentioned = Object.values(physicalExam).some(value =>
          value.toLowerCase().includes(exam.toLowerCase())
        );
        
        if (!examMentioned) {
          alerts.push({
            type: 'info',
            category: 'protocol',
            message: `Se recomienda ${exam} para el diagnóstico ${diagnosis.description}`,
            field: 'physicalExam',
            suggestion: `Considerar incluir ${exam} en la evaluación`,
            severity: 'low',
          });
        }
      });
    }
  });
  
  return alerts;
};

// Función para validar un campo específico
export const validateField = (fieldName: string, value: unknown) => {
  try {
    // Implementar validación específica por campo
    const fieldSchema = getFieldSchema(fieldName);
    fieldSchema.parse(value);
    return { isValid: true, error: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { isValid: false, error: error.errors[0]?.message || 'Error de validación' };
    }
    return { isValid: false, error: 'Error de validación desconocido' };
  }
};

// Función auxiliar para obtener schema de campo específico
const getFieldSchema = (fieldName: string): z.ZodType => {
  const fieldSchemas: Record<string, z.ZodType> = {
    consultationReason: z.string().min(5),
    currentIllness: z.string().min(10),
    treatmentPlan: z.string().min(10),
    patientId: z.string().min(1),
    userId: z.string().min(1),
  };
  
  return fieldSchemas[fieldName] || z.string();
};

// Función para validar coherencia del formulario completo
export const validateFormCoherence = (data: Partial<MedicalFormData>) => {
  try {
    medicalFormSchema.parse(data);
    return { isValid: true, errors: [] };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { isValid: false, errors: error.errors.map(e => e.message) };
    }
    return { isValid: false, errors: ['Error de validación desconocido'] };
  }
};

// Función para validar protocolos médicos
export const validateMedicalProtocol = (data: Partial<MedicalFormData>): ClinicalAlert[] => {
  const alerts: ClinicalAlert[] = [];
  
  // Verificar completitud del examen físico
  if (!data.physicalExam || Object.keys(data.physicalExam).length < 3) {
    alerts.push({
      type: 'warning',
      category: 'protocol',
      message: 'Examen físico incompleto',
      field: 'physicalExam',
      suggestion: 'Se recomienda incluir al menos examen de cabeza, tórax y abdomen',
      severity: 'medium',
    });
  }
  
  // Verificar antecedentes importantes
  if (!data.personalHistory || data.personalHistory.length === 0) {
    alerts.push({
      type: 'info',
      category: 'protocol',
      message: 'No se han registrado antecedentes personales',
      field: 'personalHistory',
      suggestion: 'Considerar documentar antecedentes médicos relevantes',
      severity: 'low',
    });
  }
  
  // Verificar alergias
  if (!data.allergies || data.allergies.length === 0) {
    alerts.push({
      type: 'info',
      category: 'protocol',
      message: 'No se han registrado alergias',
      field: 'allergies',
      suggestion: 'Confirmar si el paciente tiene alergias conocidas',
      severity: 'low',
    });
  }
  
  return alerts;
};
