import { AlertCircle, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useState } from 'react';

interface ValidationSummaryProps {
  validationState: {
    isValid: boolean;
    errors: string[];
    fieldErrors: Record<string, string>;
    coherenceErrors: string[];
  };
  totalFields: number;
  completedFields: number;
}

export default function NursingValidationSummary({ 
  validationState, 
  totalFields, 
  completedFields 
}: ValidationSummaryProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const { errors, fieldErrors, coherenceErrors } = validationState;
  
  // Contar errores por tipo
  const fieldErrorCount = Object.values(fieldErrors).filter(error => error).length;
  const coherenceErrorCount = coherenceErrors.length;
  const generalErrorCount = errors.length;
  const totalErrors = fieldErrorCount + coherenceErrorCount + generalErrorCount;
  
  // Calcular porcentaje de completitud
  const completionPercentage = Math.round((completedFields / totalFields) * 100);
  
  // Determinar el estado general (simplificado)
  const getOverallStatus = () => {
    if (completionPercentage >= 95) {
      return { status: 'success', icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-50' };
    } else if (completionPercentage >= 80) {
      return { status: 'warning', icon: AlertTriangle, color: 'text-yellow-600', bgColor: 'bg-yellow-50' };
    } else if (totalErrors > 0) {
      return { status: 'error', icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-50' };
    } else {
      return { status: 'info', icon: AlertCircle, color: 'text-blue-600', bgColor: 'bg-blue-50' };
    }
  };
  
  const overallStatus = getOverallStatus();
  const StatusIcon = overallStatus.icon;
  
  return (
    <div className="space-y-4">
      {/* Resumen principal */}
      <div className={`p-4 rounded-lg border ${overallStatus.bgColor} ${
        overallStatus.status === 'success' ? 'dark:bg-green-900 dark:border-green-700' :
        overallStatus.status === 'warning' ? 'dark:bg-yellow-900 dark:border-yellow-700' :
        overallStatus.status === 'error' ? 'dark:bg-red-900 dark:border-red-700' :
        'dark:bg-gray-800 dark:border-gray-600'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <StatusIcon className={`h-6 w-6 ${overallStatus.color}`} />
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                Estado de Validación del Formulario
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {overallStatus.status === 'success' && 'Formulario completo y listo para enviar'}
                {overallStatus.status === 'warning' && 'Formulario casi completo'}
                {overallStatus.status === 'error' && 'Revise los errores indicados'}
                {overallStatus.status === 'info' && 'Complete los campos restantes'}
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{completionPercentage}%</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Completado</div>
          </div>
        </div>
        
        {/* Barra de progreso */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-1">
            <span>Progreso</span>
            <span>{completedFields} de {totalFields} campos</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                completionPercentage === 100 ? 'bg-green-500' :
                completionPercentage >= 80 ? 'bg-yellow-500' :
                completionPercentage >= 50 ? 'bg-blue-500' : 'bg-red-500'
              }`}
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      </div>
      
      {/* Detalles de validación */}
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <button className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100">
            <span>Ver detalles de validación</span>
            <span className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>▼</span>
          </button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="space-y-3 mt-3">
          {/* Errores generales */}
          {generalErrorCount > 0 && (
            <div className="p-4 border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <XCircle className="h-4 w-4 text-red-500" />
                <div className="font-medium text-red-800 dark:text-red-200">Errores Generales ({generalErrorCount})</div>
              </div>
              <ul className="list-disc list-inside space-y-1 text-red-700 dark:text-red-300">
                {errors.map((error, index) => (
                  <li key={index} className="text-sm">{error}</li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Errores de coherencia */}
          {coherenceErrorCount > 0 && (
            <div className="p-4 border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <div className="font-medium text-yellow-800 dark:text-yellow-200">Errores de Coherencia ({coherenceErrorCount})</div>
              </div>
              <ul className="list-disc list-inside space-y-1 text-yellow-700 dark:text-yellow-300">
                {coherenceErrors.map((error, index) => (
                  <li key={index} className="text-sm">{error}</li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Errores de campos */}
          {fieldErrorCount > 0 && (
            <div className="p-4 border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <XCircle className="h-4 w-4 text-red-500" />
                <div className="font-medium text-red-800 dark:text-red-200">Errores de Campos ({fieldErrorCount})</div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {Object.entries(fieldErrors).map(([fieldName, error]) => {
                  if (!error) return null;
                  return (
                    <div key={fieldName} className="flex items-center space-x-2">
                      <Badge variant="destructive" className="text-xs">
                        {fieldName.replace(/_/g, ' ')}
                      </Badge>
                      <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* Sin errores */}
          {totalErrors === 0 && (
            <div className="p-4 border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900 rounded-lg">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <div className="text-green-800 dark:text-green-200">
                  ¡Excelente! No se encontraron errores de validación en el formulario.
                </div>
              </div>
            </div>
          )}
          
          {/* Estadísticas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{completedFields}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Campos Completados</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">{fieldErrorCount}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Errores de Campo</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{coherenceErrorCount}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Errores de Coherencia</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalFields - completedFields}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Campos Pendientes</div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
