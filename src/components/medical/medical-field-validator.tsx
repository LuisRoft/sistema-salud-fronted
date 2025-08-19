'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, Eye, EyeOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { validateField } from '@/lib/medical-validation';

interface FieldValidatorProps {
  fieldName: string;
  value: unknown;
  isRequired?: boolean;
  validationRules?: ValidationRule[];
  onValidationChange?: (isValid: boolean, error?: string) => void;
  showValidation?: boolean;
  patientAge?: number;
  patientGender?: string;
}

interface ValidationRule {
  name: string;
  validator: (value: unknown) => boolean;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

interface ValidationResult {
  isValid: boolean;
  status: 'valid' | 'invalid' | 'warning' | 'pending';
  message?: string;
  suggestions: string[];
}

export default function MedicalFieldValidator({
  fieldName,
  value,
  isRequired = false,
  validationRules = [],
  onValidationChange,
  showValidation = true,
  patientAge = 0,
  patientGender = '',
}: FieldValidatorProps) {
  
  const [validationResult, setValidationResult] = useState<ValidationResult>({
    isValid: true,
    status: 'pending',
    suggestions: [],
  });
  
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const validateFieldValue = () => {
      // Validación básica de campo requerido
      if (isRequired && (!value || (typeof value === 'string' && value.trim() === ''))) {
        const result: ValidationResult = {
          isValid: false,
          status: 'invalid',
          message: 'Este campo es obligatorio',
          suggestions: ['Complete este campo para continuar'],
        };
        setValidationResult(result);
        onValidationChange?.(false, result.message);
        return;
      }

      // Validación usando el schema principal
      const fieldValidation = validateField(fieldName, value);
      
      // Validaciones específicas por tipo de campo
      const specificValidation = validateSpecificField(fieldName, value, patientAge);
      
      // Validaciones personalizadas
      const customValidationResults = validationRules.map(rule => ({
        isValid: rule.validator(value),
        rule,
      }));

      // Determinar resultado final
      let finalResult: ValidationResult;
      
      if (!fieldValidation.isValid) {
        finalResult = {
          isValid: false,
          status: 'invalid',
          message: fieldValidation.error || 'Error de validación',
          suggestions: getSuggestions(fieldName),
        };
      } else if (specificValidation.warnings.length > 0) {
        finalResult = {
          isValid: true,
          status: 'warning',
          message: specificValidation.warnings[0],
          suggestions: specificValidation.suggestions,
        };
      } else if (customValidationResults.some(r => !r.isValid)) {
        const failedRule = customValidationResults.find(r => !r.isValid)?.rule;
        finalResult = {
          isValid: failedRule?.severity !== 'error',
          status: failedRule?.severity === 'error' ? 'invalid' : 'warning',
          message: failedRule?.message || 'Error de validación personalizada',
          suggestions: getSuggestions(fieldName),
        };
      } else {
        finalResult = {
          isValid: true,
          status: 'valid',
          message: 'Campo válido',
          suggestions: getOptimizationSuggestions(fieldName),
        };
      }

      setValidationResult(finalResult);
      onValidationChange?.(finalResult.isValid, finalResult.isValid ? undefined : finalResult.message);
    };

    validateFieldValue();
  }, [fieldName, value, isRequired, validationRules, onValidationChange, patientAge, patientGender]);

  if (!showValidation) return null;

  const getStatusIcon = () => {
    switch (validationResult.status) {
      case 'valid':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'invalid':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default:
        return <Info className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (validationResult.status) {
      case 'valid':
        return 'border-green-200 bg-green-50';
      case 'invalid':
        return 'border-red-200 bg-red-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const fieldDisplayName = getFieldDisplayName(fieldName);

  return (
    <TooltipProvider>
      <div className={`inline-flex items-center gap-2 p-2 rounded-md border ${getStatusColor()}`}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1">
              {getStatusIcon()}
              <span className="text-xs font-medium text-gray-700">
                {fieldDisplayName}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="font-medium">{validationResult.message}</p>
            {validationResult.suggestions.length > 0 && (
              <div className="mt-1">
                <p className="text-xs text-gray-600">Sugerencias:</p>
                <ul className="text-xs list-disc list-inside">
                  {validationResult.suggestions.slice(0, 2).map((suggestion, index) => (
                    <li key={index}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            )}
          </TooltipContent>
        </Tooltip>

        {validationResult.suggestions.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? (
              <EyeOff className="w-3 h-3" />
            ) : (
              <Eye className="w-3 h-3" />
            )}
          </Button>
        )}

        {validationResult.status !== 'valid' && (
          <Badge 
            variant={validationResult.status === 'invalid' ? 'destructive' : 'secondary'}
            className="text-xs"
          >
            {validationResult.status === 'invalid' ? 'Error' : 'Aviso'}
          </Badge>
        )}
      </div>

      {/* Detalles expandibles */}
      {showDetails && validationResult.suggestions.length > 0 && (
        <div className="mt-2 p-3 bg-white border rounded-md shadow-sm">
          <h4 className="text-sm font-medium text-gray-900 mb-2">
            Sugerencias para {fieldDisplayName}:
          </h4>
          <ul className="text-sm text-gray-600 space-y-1">
            {validationResult.suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </TooltipProvider>
  );
}

// Validaciones específicas por tipo de campo
function validateSpecificField(
  fieldName: string,
  value: unknown,
  patientAge: number
): { warnings: string[]; suggestions: string[] } {
  const warnings: string[] = [];
  const suggestions: string[] = [];

  if (fieldName.includes('temperature') && typeof value === 'number') {
    if (value > 38.5) {
      warnings.push('Temperatura elevada detectada');
      suggestions.push('Verificar si el paciente presenta otros síntomas febriles');
      suggestions.push('Considerar antipirético si es necesario');
    } else if (value < 36) {
      warnings.push('Temperatura baja detectada');
      suggestions.push('Verificar la medición');
      suggestions.push('Considerar hipotermia en contexto clínico');
    }
  }

  if (fieldName.includes('heartRate') && typeof value === 'number') {
    const expectedRange = patientAge < 18 ? [80, 120] : [60, 100];
    if (value > expectedRange[1]) {
      warnings.push('Taquicardia detectada');
      suggestions.push('Evaluar causas: fiebre, ansiedad, deshidratación, medicamentos');
      suggestions.push('Considerar ECG si persiste');
    } else if (value < expectedRange[0]) {
      warnings.push('Bradicardia detectada');
      suggestions.push('Evaluar si el paciente toma medicamentos cardioactivos');
      suggestions.push('Descartar bloqueos cardíacos');
    }
  }

  if (fieldName.includes('bloodPressure') && typeof value === 'string') {
    const bpMatch = value.match(/(\d+)\/(\d+)/);
    if (bpMatch) {
      const systolic = parseInt(bpMatch[1]);
      const diastolic = parseInt(bpMatch[2]);
      
      if (systolic >= 140 || diastolic >= 90) {
        warnings.push('Presión arterial elevada');
        suggestions.push('Confirmar con múltiples mediciones');
        suggestions.push('Evaluar riesgo cardiovascular global');
        if (patientAge > 40) {
          suggestions.push('Considerar estudios complementarios');
        }
      }
    }
  }

  if (fieldName.includes('consultationReason') && typeof value === 'string') {
    if (value.length > 0 && value.length < 10) {
      warnings.push('Motivo de consulta muy breve');
      suggestions.push('Incluya más detalles sobre el problema principal');
      suggestions.push('Especifique tiempo de evolución y características');
    }
  }

  if (fieldName.includes('currentIllness') && typeof value === 'string') {
    if (value.length > 0 && value.length < 20) {
      warnings.push('Enfermedad actual insuficientemente detallada');
      suggestions.push('Incluya: inicio, evolución, síntomas asociados');
      suggestions.push('Describa factores que mejoran o empeoran');
      suggestions.push('Mencione tratamientos previos');
    }
  }

  if (fieldName.includes('treatmentPlan') && typeof value === 'string') {
    if (value.length > 0 && value.length < 15) {
      warnings.push('Plan de tratamiento muy básico');
      suggestions.push('Incluya medicamentos con dosis específicas');
      suggestions.push('Agregue recomendaciones no farmacológicas');
      suggestions.push('Especifique seguimiento y control');
    }
  }

  return { warnings, suggestions };
}

// Obtener sugerencias generales
function getSuggestions(fieldName: string): string[] {
  const suggestions: string[] = [];

  if (fieldName.includes('diagnosis')) {
    suggestions.push('Use códigos CIE-10 válidos para mayor precisión');
    suggestions.push('Especifique si es diagnóstico presuntivo o definitivo');
    suggestions.push('Correlacione con hallazgos clínicos documentados');
  }

  if (fieldName.includes('physicalExam')) {
    suggestions.push('Documente hallazgos positivos y negativos relevantes');
    suggestions.push('Use terminología médica estándar');
    suggestions.push('Incluya comparaciones bilaterales cuando corresponda');
  }

  if (fieldName.includes('vitalSigns')) {
    suggestions.push('Verifique que las mediciones sean actuales');
    suggestions.push('Documente posición del paciente durante la medición');
    suggestions.push('Considere repetir si los valores son anormales');
  }

  return suggestions;
}

// Obtener sugerencias de optimización
function getOptimizationSuggestions(fieldName: string): string[] {
  const suggestions: string[] = [];

  if (fieldName.includes('consultationReason')) {
    suggestions.push('Excelente detalle en el motivo de consulta');
  }

  if (fieldName.includes('currentIllness')) {
    suggestions.push('Historia clínica bien documentada');
  }

  if (fieldName.includes('treatmentPlan')) {
    suggestions.push('Plan de tratamiento comprensivo');
  }

  return suggestions;
}

// Obtener nombre legible del campo
function getFieldDisplayName(fieldName: string): string {
  const fieldNames: Record<string, string> = {
    consultationReason: 'Motivo de Consulta',
    currentIllness: 'Enfermedad Actual',
    treatmentPlan: 'Plan de Tratamiento',
    'vitalSigns.temperature': 'Temperatura',
    'vitalSigns.heartRate': 'Frecuencia Cardíaca',
    'vitalSigns.bloodPressure': 'Presión Arterial',
    'vitalSigns.respiratoryRate': 'Frecuencia Respiratoria',
    'vitalSigns.oxygenSaturation': 'Saturación O₂',
    'vitalSigns.weight': 'Peso',
    'vitalSigns.height': 'Talla',
    'vitalSigns.bmi': 'IMC',
    diagnoses: 'Diagnósticos',
    physicalExam: 'Examen Físico',
    personalHistory: 'Antecedentes Personales',
    familyHistory: 'Antecedentes Familiares',
    allergies: 'Alergias',
    medications: 'Medicaciones',
    observations: 'Observaciones',
  };

  return fieldNames[fieldName] || fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
}
