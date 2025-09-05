import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface FieldValidatorProps {
  fieldName: string;
  value: unknown;
  error?: string;
  isRequired?: boolean;
  validationRules?: string[];
  onValidationChange?: (isValid: boolean) => void;
  showValidation?: boolean;
}

export default function NursingFieldValidator({
  fieldName,
  value,
  error,
  isRequired = false,
  validationRules = [],
  onValidationChange,
  showValidation = true
}: FieldValidatorProps) {
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [validationMessage, setValidationMessage] = useState<string>('');

  useEffect(() => {
    if (!showValidation) {
      setIsValid(null);
      setValidationMessage('');
      onValidationChange?.(true);
      return;
    }

    // Validar el campo
    let valid = true;
    let message = '';

    // Validación de campo requerido
    if (isRequired) {
      if (!value || (typeof value === 'string' && value.trim() === '') || 
          (Array.isArray(value) && value.length === 0)) {
        valid = false;
        message = 'Campo requerido';
      }
    }

    // Validación de arrays
    if (Array.isArray(value)) {
      if (value.length === 0 && isRequired) {
        valid = false;
        message = 'Al menos un elemento es requerido';
      } else {
        // Validar cada elemento del array
        for (let i = 0; i < value.length; i++) {
          const item = value[i];
          if (!item || (typeof item === 'string' && item.trim() === '')) {
            valid = false;
            message = `Elemento ${i + 1} está vacío`;
            break;
          }
        }
      }
    }

    // Validación de strings
    if (typeof value === 'string') {
      if (value.trim().length < 3 && isRequired) {
        valid = false;
        message = 'Mínimo 3 caracteres';
      }
    }

    // Validación específica para dianas (números 1-5)
    if (fieldName.includes('diana') && Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        const item = value[i];
        if (item && !/^[1-5]$/.test(item.toString())) {
          valid = false;
          message = 'Las dianas deben ser números del 1 al 5';
          break;
        }
      }
    }

    // Validación específica para rangos (números)
    if (fieldName.includes('rango') && Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        const item = value[i];
        if (item && !/^\d+$/.test(item.toString())) {
          valid = false;
          message = 'Los rangos deben ser números';
          break;
        }
      }
    }

    // Si hay un error del formulario, sobrescribir la validación
    if (error) {
      valid = false;
      message = error;
    }

    setIsValid(valid);
    setValidationMessage(message);
    onValidationChange?.(valid);
  }, [value, error, isRequired, fieldName, showValidation, onValidationChange]);

  if (!showValidation) return null;

  const getValidationIcon = () => {
    if (isValid === null) return <Info className="h-4 w-4 text-gray-400" />;
    if (isValid) return <CheckCircle className="h-4 w-4 text-green-500" />;
    return <XCircle className="h-4 w-4 text-red-500" />;
  };



  const getValidationBadgeVariant = () => {
    if (isValid === null) return 'secondary';
    if (isValid) return 'default';
    return 'destructive';
  };

  return (
    <TooltipProvider>
      <div className="flex items-center space-x-2">
        {/* Icono de validación */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="cursor-help">
              {getValidationIcon()}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="max-w-xs">
              <div className="font-medium mb-1">
                {fieldName.replace(/_/g, ' ').toUpperCase()}
              </div>
              <div className="text-sm">
                {isRequired && <div>• Campo requerido</div>}
                {validationRules.map((rule, index) => (
                  <div key={index}>• {rule}</div>
                ))}
                {validationMessage && (
                  <div className="text-red-500 mt-1">⚠️ {validationMessage}</div>
                )}
              </div>
            </div>
          </TooltipContent>
        </Tooltip>

        {/* Badge de estado */}
        <Badge variant={getValidationBadgeVariant()} className="text-xs">
          {isValid === null && 'Pendiente'}
          {isValid === true && 'Válido'}
          {isValid === false && 'Inválido'}
        </Badge>

        {/* Mensaje de error */}
        {validationMessage && (
          <span className="text-sm text-red-600 max-w-xs truncate">
            {validationMessage}
          </span>
        )}
      </div>
    </TooltipProvider>
  );
}

// Componente para validación de arrays específicos
interface ArrayFieldValidatorProps {
  fieldName: string;
  values: string[];
  isRequired?: boolean;
  onValidationChange?: (isValid: boolean) => void;
  showValidation?: boolean;
}

export function ArrayFieldValidator({
  fieldName,
  values,
  isRequired = false,
  onValidationChange,
  showValidation = true
}: ArrayFieldValidatorProps) {
  const [itemErrors, setItemErrors] = useState<Record<number, string>>({});

  useEffect(() => {
    if (!showValidation) {
      setItemErrors({});
      onValidationChange?.(true);
      return;
    }

    let valid = true;
    const errors: Record<number, string> = {};

    // Validar cada elemento del array
    values.forEach((value, index) => {
      if (!value || value.trim() === '') {
        valid = false;
        errors[index] = 'Campo requerido';
      }
    });

    // Validar que haya al menos un elemento si es requerido
    if (isRequired && values.length === 0) {
      valid = false;
    }

    setItemErrors(errors);
    onValidationChange?.(valid);
  }, [values, isRequired, showValidation, onValidationChange]);

  if (!showValidation) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <NursingFieldValidator
          fieldName={fieldName}
          value={values}
          isRequired={isRequired}
          onValidationChange={onValidationChange}
          showValidation={showValidation}
        />
        <span className="text-sm text-gray-500">
          ({values.length} elementos)
        </span>
      </div>
      
      {/* Mostrar errores individuales */}
      {Object.keys(itemErrors).length > 0 && (
        <div className="ml-6 space-y-1">
          {Object.entries(itemErrors).map(([index, error]) => (
            <div key={index} className="flex items-center space-x-2 text-sm text-red-600">
              <XCircle className="h-3 w-3" />
              <span>Elemento {parseInt(index) + 1}: {error}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
