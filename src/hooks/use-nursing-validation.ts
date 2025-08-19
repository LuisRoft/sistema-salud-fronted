import { useState, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  nursingFormSchema, 
  validateField, 
  validateFormCoherence,
  type NursingFormData 
} from '@/lib/nursing-validation';

interface ValidationState {
  isValid: boolean;
  errors: string[];
  fieldErrors: Record<string, string>;
  coherenceErrors: string[];
}

interface UseNursingValidationReturn {
  form: ReturnType<typeof useForm<NursingFormData>>;
  validationState: ValidationState;
  validateFieldInRealTime: (fieldName: keyof NursingFormData, value: unknown) => void;
  validateFormCompletely: () => boolean;
  clearValidationErrors: () => void;
  isFormValid: boolean;
}

export const useNursingValidation = (): UseNursingValidationReturn => {
  const [validationState, setValidationState] = useState<ValidationState>({
    isValid: true,
    errors: [],
    fieldErrors: {},
    coherenceErrors: []
  });

  const form = useForm<NursingFormData>({
    resolver: zodResolver(nursingFormSchema),
    mode: 'onSubmit',
    defaultValues: {
      nanda_dominio: '',
      nanda_clase: '',
      nanda_etiqueta_diagnostica: '',
      nanda_factor_relacionado: '',
      nanda_planteamiento_del_diagnostico: '',
      noc_resultado_noc: '',
      noc_dominio: '',
      noc_clase: '',
      noc_indicador: [''],
      noc_rango: [''],
      noc_diana_inicial: [''],
      noc_diana_esperada: [''],
      noc_evaluacion: [''],
      nic_intervencion: [''],
      nic_clase: [''],
      nic_actividades: [''],
      userId: '',
      patientId: '',
      fecha: new Date().toISOString()
    }
  });

  // Validación en tiempo real de un campo específico
  const validateFieldInRealTime = useCallback((fieldName: keyof NursingFormData, value: unknown) => {
    const result = validateField(fieldName, value);
    
    setValidationState(prev => ({
      ...prev,
      fieldErrors: {
        ...prev.fieldErrors,
        [fieldName]: result.error || ''
      }
    }));

    // Recalcular el estado general de validación
    const allFieldErrors = {
      ...validationState.fieldErrors,
      [fieldName]: result.error || ''
    };
    const hasFieldErrors = Object.values(allFieldErrors).some(error => error);
    
    setValidationState(prev => ({
      ...prev,
      isValid: !hasFieldErrors && prev.coherenceErrors.length === 0,
      fieldErrors: allFieldErrors
    }));

    return result.isValid;
  }, [validationState.fieldErrors]);

  // Validación completa del formulario
  const validateFormCompletely = useCallback(() => {
    const formData = form.getValues();
    console.log('🔍 validateFormCompletely - datos del formulario:', formData);
    
    try {
      // Validar esquema principal
      console.log('📋 Validando esquema principal...');
      // El esquema requiere userId y patientId, pero en el frontend se agregan al enviar.
      // Para no bloquear la validación previa al envío, usamos valores temporales si vienen vacíos.
      const formDataWithIds = {
        ...formData,
        userId: formData.userId && formData.userId.trim().length > 0 ? formData.userId : 'user-temp',
        patientId: formData.patientId && formData.patientId.trim().length > 0 ? formData.patientId : 'patient-temp'
      };
      nursingFormSchema.parse(formDataWithIds);
      console.log('✅ Esquema principal válido');
      
      // Validar coherencia
      console.log('🔄 Validando coherencia...');
      const coherenceResult = validateFormCoherence(formData);
      console.log('🔄 Resultado de coherencia:', coherenceResult);
      
      if (coherenceResult.isValid) {
        console.log('✅ Validación completa exitosa');
        setValidationState({
          isValid: true,
          errors: [],
          fieldErrors: {},
          coherenceErrors: []
        });
        return true;
      } else {
        console.log('❌ Errores de coherencia:', coherenceResult.errors);
        setValidationState(prev => ({
          ...prev,
          isValid: false,
          coherenceErrors: coherenceResult.errors
        }));
        return false;
      }
    } catch (error) {
      console.log('❌ Error en validación de esquema:', error);
      if (error instanceof Error) {
        setValidationState(prev => ({
          ...prev,
          isValid: false,
          errors: [error.message]
        }));
      }
      return false;
    }
  }, [form]);

  // Limpiar errores de validación
  const clearValidationErrors = useCallback(() => {
    setValidationState({
      isValid: true,
      errors: [],
      fieldErrors: {},
      coherenceErrors: []
    });
  }, []);

  // Validar coherencia cuando cambien campos relacionados
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (!name) return;

      // Validar coherencia cuando cambien campos clave
      if (['nanda_dominio', 'noc_dominio', 'nic_clase'].includes(name)) {
        const coherenceResult = validateFormCoherence(value as Partial<NursingFormData>);
        setValidationState(prev => ({
          ...prev,
          coherenceErrors: coherenceResult.errors
        }));
      }
    });

    return () => subscription.unsubscribe();
  }, [form]);

  // Validar arrays cuando cambien
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (!name) return;

      // Validar arrays relacionados
      if (name === 'noc_indicador' || name === 'noc_rango' || 
          name === 'noc_diana_inicial' || name === 'noc_diana_esperada') {
        const formData = form.getValues();
        
        // Verificar que todos los arrays tengan la misma longitud
        const indicadoresCount = formData.noc_indicador?.length || 0;
        const rangosCount = formData.noc_rango?.length || 0;
        const dianasInicialesCount = formData.noc_diana_inicial?.length || 0;
        const dianasEsperadasCount = formData.noc_diana_esperada?.length || 0;
        
        if (indicadoresCount !== rangosCount || 
            indicadoresCount !== dianasInicialesCount || 
            indicadoresCount !== dianasEsperadasCount) {
          setValidationState(prev => ({
            ...prev,
            fieldErrors: {
              ...prev.fieldErrors,
              [name]: 'El número de elementos debe ser igual en todos los campos relacionados'
            }
          }));
        } else {
          setValidationState(prev => ({
            ...prev,
            fieldErrors: {
              ...prev.fieldErrors,
              [name]: ''
            }
          }));
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [form]);

  // Verificar si el formulario es válido
  const isFormValid = form.formState.isValid && validationState.isValid;

  return {
    form,
    validationState,
    validateFieldInRealTime,
    validateFormCompletely,
    clearValidationErrors,
    isFormValid
  };
};

// Hook para validación de arrays específicos
export const useArrayValidation = (fieldName: string, form: ReturnType<typeof useForm<NursingFormData>>) => {
  const [arrayErrors, setArrayErrors] = useState<string[]>([]);

  const validateArray = useCallback((array: string[]) => {
    const errors: string[] = [];
    
    array.forEach((item, index) => {
      if (!item || item.trim() === '') {
        errors[index] = 'Campo requerido';
      }
    });

    setArrayErrors(errors);
    return errors.every(error => !error);
  }, []);

  const addArrayItem = useCallback(() => {
    const currentValue = form.getValues(fieldName as keyof NursingFormData) as string[] || [];
    form.setValue(fieldName as keyof NursingFormData, [...currentValue, '']);
  }, [form, fieldName]);

  const removeArrayItem = useCallback((index: number) => {
    const currentValue = form.getValues(fieldName as keyof NursingFormData) as string[] || [];
    const newValue = currentValue.filter((_, i) => i !== index);
    form.setValue(fieldName as keyof NursingFormData, newValue);
  }, [form, fieldName]);

  const updateArrayItem = useCallback((index: number, value: string) => {
    const currentValue = form.getValues(fieldName as keyof NursingFormData) as string[] || [];
    const newValue = [...currentValue];
    newValue[index] = value;
    form.setValue(fieldName as keyof NursingFormData, newValue);
    
    // Validar el array actualizado
    validateArray(newValue);
  }, [form, fieldName, validateArray]);

  return {
    arrayErrors,
    validateArray,
    addArrayItem,
    removeArrayItem,
    updateArrayItem
  };
};
