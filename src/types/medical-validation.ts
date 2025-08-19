// Tipos para el sistema de validación médica

export interface MedicalValidationState {
  isValid: boolean;
  errors: string[];
  fieldErrors: Record<string, string>;
  coherenceErrors: string[];
  protocolErrors: string[];
  clinicalAlerts: ClinicalAlert[];
}

export interface ClinicalAlert {
  type: 'warning' | 'error' | 'info';
  category: 'vital_signs' | 'diagnosis' | 'medication' | 'protocol' | 'coherence';
  message: string;
  field?: string;
  suggestion?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface VitalSignsRange {
  min: number;
  max: number;
  unit: string;
  ageGroup: 'infant' | 'child' | 'adolescent' | 'adult' | 'elderly';
  gender?: 'male' | 'female';
}

export interface VitalSignsRanges {
  temperature: VitalSignsRange[];
  heartRate: VitalSignsRange[];
  bloodPressureSystolic: VitalSignsRange[];
  bloodPressureDiastolic: VitalSignsRange[];
  respiratoryRate: VitalSignsRange[];
  oxygenSaturation: VitalSignsRange[];
  bmi: VitalSignsRange[];
}

export interface DiagnosisCoherence {
  cie10Code: string;
  description: string;
  commonSymptoms: string[];
  requiredExams: string[];
  contraindicatedWith: string[];
  relatedCif: string[];
}

export interface MedicalProtocol {
  name: string;
  requiredFields: string[];
  optionalFields: string[];
  minimumExams: string[];
  alerts: string[];
}

export interface CoherenceRule {
  id: string;
  name: string;
  description: string;
  validator: (data: Partial<MedicalFormData>) => CoherenceResult;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface CoherenceResult {
  isValid: boolean;
  message?: string;
  suggestion?: string;
  affectedFields?: string[];
}

export interface MedicalFormData {
  // Datos del paciente
  patientId: string;
  age: number;
  gender: string;
  
  // Motivo de consulta
  consultationReason: string;
  currentIllness: string;
  
  // Antecedentes
  personalHistory: string[];
  familyHistory: string[];
  allergies: string[];
  medications: string[];
  
  // Constantes vitales
  vitalSigns: {
    temperature: number;
    heartRate: number;
    bloodPressure: string;
    respiratoryRate: number;
    oxygenSaturation: number;
    weight: number;
    height: number;
    bmi: number;
  };
  
  // Examen físico
  physicalExam: Record<string, string>;
  
  // Diagnósticos
  diagnoses: {
    description: string;
    cie10: string;
    cif: string;
    presumptive: boolean;
    definitive: boolean;
  }[];
  
  // Plan de tratamiento
  treatmentPlan: string;
  observations: string;
}

export interface ValidationConfig {
  enableRealTimeValidation: boolean;
  enableCoherenceChecking: boolean;
  enableProtocolValidation: boolean;
  enableClinicalAlerts: boolean;
  strictMode: boolean;
}

export interface FieldValidationRule {
  field: string;
  required: boolean;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  customValidator?: (value: unknown) => boolean;
  message: string;
}
