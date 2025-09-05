import { useState, useCallback, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  MedicalValidationState, 
  MedicalFormData, 
  ClinicalAlert,
  ValidationConfig 
} from '@/types/medical-validation';
import { 
  medicalFormSchema,
  validateField,
  validateFormCoherence,
  validateVitalSigns,
  validateDiagnosisCoherence,
  validateMedicalProtocol
} from '@/lib/medical-validation';

interface UseMedicalValidationProps {
  config?: Partial<ValidationConfig>;
  patientAge?: number;
  patientGender?: string;
  onValidationChange?: (state: MedicalValidationState) => void;
}

interface UseMedicalValidationReturn {
  form: ReturnType<typeof useForm<MedicalFormData>>;
  validationState: MedicalValidationState;
  validateFieldInRealTime: (fieldName: keyof MedicalFormData, value: unknown) => boolean;
  validateFormCompletely: () => boolean;
  clearValidationErrors: () => void;
  getClinicalAlerts: () => ClinicalAlert[];
  getValidationProgress: () => { completed: number; total: number; percentage: number };
  isFormValid: boolean;
}

const defaultConfig: ValidationConfig = {
  enableRealTimeValidation: true,
  enableCoherenceChecking: true,
  enableProtocolValidation: true,
  enableClinicalAlerts: true,
  strictMode: false,
};

export const useMedicalValidation = ({
  config = {},
  patientAge = 0,
  onValidationChange,
}: Omit<UseMedicalValidationProps, 'patientGender'> = {}): UseMedicalValidationReturn => {
  
  const validationConfig = useMemo(() => ({ ...defaultConfig, ...config }), [config]);
  
  const [validationState, setValidationState] = useState<MedicalValidationState>({
    isValid: true,
    errors: [],
    fieldErrors: {},
    coherenceErrors: [],
    protocolErrors: [],
    clinicalAlerts: [],
  });

  const form = useForm<MedicalFormData>({
    resolver: zodResolver(medicalFormSchema),
    mode: validationConfig.enableRealTimeValidation ? 'onChange' : 'onSubmit',
    defaultValues: {
      patientId: '',

      consultationReason: '',
      currentIllness: '',
      personalHistory: [],
      familyHistory: [],
      allergies: [],
      medications: [],
      vitalSigns: {
        temperature: 36.5,
        heartRate: 80,
        bloodPressure: '120/80',
        respiratoryRate: 16,
        oxygenSaturation: 98,
        weight: 70,
        height: 170,
        bmi: 24.2,
      },
      physicalExam: {},
      diagnoses: [{ description: '', cie10: '', cif: '', presumptive: false, definitive: false }],
      treatmentPlan: '',
      observations: '',
    },
  });

  // Validación en tiempo real de un campo específico
  const validateFieldInRealTime = useCallback((fieldName: keyof MedicalFormData, value: unknown) => {
    if (!validationConfig.enableRealTimeValidation) return true;
    
    const result = validateField(fieldName, value);
    
    setValidationState(prev => ({
      ...prev,
      fieldErrors: {
        ...prev.fieldErrors,
        [fieldName]: result.error || '',
      },
    }));

    return result.isValid;
  }, [validationConfig.enableRealTimeValidation]);

  // Obtener alertas clínicas
  const getClinicalAlerts = useCallback((): ClinicalAlert[] => {
    if (!validationConfig.enableClinicalAlerts) return [];
    
    const formData = form.getValues();
    const alerts: ClinicalAlert[] = [];

    // Validar signos vitales
    if (formData.vitalSigns && patientAge > 0) {
      const vs = formData.vitalSigns;
      if (vs.temperature !== undefined && vs.heartRate !== undefined && 
          vs.bloodPressure !== undefined && vs.respiratoryRate !== undefined &&
          vs.oxygenSaturation !== undefined && vs.weight !== undefined &&
          vs.height !== undefined && vs.bmi !== undefined) {
        const completeVitalSigns = {
          temperature: vs.temperature,
          heartRate: vs.heartRate,
          bloodPressure: vs.bloodPressure,
          respiratoryRate: vs.respiratoryRate,
          oxygenSaturation: vs.oxygenSaturation,
          weight: vs.weight,
          height: vs.height,
          bmi: vs.bmi,
        };
        const vitalSignsAlerts = validateVitalSigns(completeVitalSigns, patientAge);
        alerts.push(...vitalSignsAlerts);
      }
    }

    // Validar coherencia de diagnósticos
    if (validationConfig.enableCoherenceChecking && formData.diagnoses) {
      const coherenceAlerts = validateDiagnosisCoherence(
        formData.diagnoses,
        formData.currentIllness || '',
        formData.physicalExam || {}
      );
      alerts.push(...coherenceAlerts);
    }

    // Validar protocolos médicos
    if (validationConfig.enableProtocolValidation) {
      const protocolAlerts = validateMedicalProtocol(formData);
      alerts.push(...protocolAlerts);
    }

    return alerts;
  }, [form, patientAge, validationConfig]);

  // Validación completa del formulario
  const validateFormCompletely = useCallback(() => {
    const formData = form.getValues();
    
    try {
      // Validar esquema principal
      medicalFormSchema.parse(formData);
      
      // Obtener alertas clínicas
      const clinicalAlerts = getClinicalAlerts();
      
      // Validar coherencia si está habilitada
      let coherenceErrors: string[] = [];
      if (validationConfig.enableCoherenceChecking) {
        const coherenceResult = validateFormCoherence(formData);
        coherenceErrors = coherenceResult.errors;
      }
      
      // Determinar si hay errores críticos
      const criticalAlerts = clinicalAlerts.filter(alert => 
        alert.severity === 'critical' || alert.type === 'error'
      );
      
      const isValid = coherenceErrors.length === 0 && criticalAlerts.length === 0;
      
      const newValidationState: MedicalValidationState = {
        isValid,
        errors: coherenceErrors,
        fieldErrors: {},
        coherenceErrors,
        protocolErrors: clinicalAlerts
          .filter(alert => alert.category === 'protocol')
          .map(alert => alert.message),
        clinicalAlerts,
      };
      
      setValidationState(newValidationState);
      onValidationChange?.(newValidationState);
      
      return isValid;
    } catch (error) {
      if (error instanceof Error) {
        const errorState: MedicalValidationState = {
          isValid: false,
          errors: [error.message],
          fieldErrors: {},
          coherenceErrors: [error.message],
          protocolErrors: [],
          clinicalAlerts: [],
        };
        
        setValidationState(errorState);
        onValidationChange?.(errorState);
      }
      return false;
    }
  }, [form, getClinicalAlerts, validationConfig, onValidationChange]);

  // Limpiar errores de validación
  const clearValidationErrors = useCallback(() => {
    const clearedState: MedicalValidationState = {
      isValid: true,
      errors: [],
      fieldErrors: {},
      coherenceErrors: [],
      protocolErrors: [],
      clinicalAlerts: [],
    };
    
    setValidationState(clearedState);
    onValidationChange?.(clearedState);
  }, [onValidationChange]);

  // Calcular progreso de validación
  const getValidationProgress = useCallback(() => {
    const formData = form.getValues();
    const requiredFields = [
      'patientId',
      'userId', 
      'consultationReason',
      'currentIllness',
      'treatmentPlan',
    ];
    
    const vitalSignsFields = [
      'vitalSigns.temperature',
      'vitalSigns.heartRate',
      'vitalSigns.bloodPressure',
      'vitalSigns.respiratoryRate',
      'vitalSigns.oxygenSaturation',
    ];
    
    const diagnosticFields = formData.diagnoses?.length > 0 && 
      formData.diagnoses[0]?.description && 
      formData.diagnoses[0]?.cie10 ? ['diagnoses'] : [];
    
    const allFields = [...requiredFields, ...vitalSignsFields, ...diagnosticFields];
    
    let completed = 0;
    
    // Contar campos requeridos completados
    requiredFields.forEach(field => {
      const value = form.getValues(field as keyof MedicalFormData);
      if (value && String(value).trim() !== '') {
        completed++;
      }
    });
    
    // Contar signos vitales completados
    if (formData.vitalSigns) {
      const vitalSigns = formData.vitalSigns;
      if (vitalSigns.temperature > 0) completed++;
      if (vitalSigns.heartRate > 0) completed++;
      if (vitalSigns.bloodPressure) completed++;
      if (vitalSigns.respiratoryRate > 0) completed++;
      if (vitalSigns.oxygenSaturation > 0) completed++;
    }
    
    // Contar diagnósticos completados
    if (diagnosticFields.length > 0) {
      completed++;
    }
    
    const total = allFields.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { completed, total, percentage };
  }, [form]);

  // Validación automática cuando cambien campos críticos
  useEffect(() => {
    if (!validationConfig.enableRealTimeValidation) return;
    
    const subscription = form.watch((value, { name }) => {
      if (!name) return;

      // Validar coherencia cuando cambien campos clave
      const criticalFields = [
        'diagnoses',
        'currentIllness',
        'vitalSigns',
        'consultationReason',
        'treatmentPlan',
      ];
      
      if (criticalFields.some(field => name.startsWith(field))) {
        // Ejecutar validación completa con debounce
        const timer = setTimeout(() => {
          validateFormCompletely();
        }, 500);
        
        return () => clearTimeout(timer);
      }
    });

    return () => subscription.unsubscribe();
  }, [form, validateFormCompletely, validationConfig.enableRealTimeValidation]);

  // Validar signos vitales cuando cambien
  useEffect(() => {
    if (!validationConfig.enableClinicalAlerts || !patientAge) return;
    
    const subscription = form.watch((value) => {
      if (value.vitalSigns) {
        const vs = value.vitalSigns;
        if (vs.temperature !== undefined && vs.heartRate !== undefined && 
            vs.bloodPressure !== undefined && vs.respiratoryRate !== undefined &&
            vs.oxygenSaturation !== undefined && vs.weight !== undefined &&
            vs.height !== undefined && vs.bmi !== undefined) {
          const completeVitalSigns = {
            temperature: vs.temperature,
            heartRate: vs.heartRate,
            bloodPressure: vs.bloodPressure,
            respiratoryRate: vs.respiratoryRate,
            oxygenSaturation: vs.oxygenSaturation,
            weight: vs.weight,
            height: vs.height,
            bmi: vs.bmi,
          };
          const vitalSignsAlerts = validateVitalSigns(completeVitalSigns, patientAge);
          
          setValidationState(prev => ({
            ...prev,
            clinicalAlerts: [
              ...prev.clinicalAlerts.filter(alert => alert.category !== 'vital_signs'),
              ...vitalSignsAlerts,
            ],
          }));
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [form, patientAge, validationConfig.enableClinicalAlerts]);

  return {
    form,
    validationState,
    validateFieldInRealTime,
    validateFormCompletely,
    clearValidationErrors,
    getClinicalAlerts,
    getValidationProgress,
    isFormValid: validationState.isValid,
  };
};
