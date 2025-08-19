import { useState } from 'react';
import { CheckCircle, XCircle, Circle, ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface FieldStatus {
  name: string;
  label: string;
  isComplete: boolean;
  isRequired: boolean;
  errorMessage?: string;
  section: 'NANDA' | 'NOC' | 'NIC';
}

interface NursingProgressTrackerProps {
  formData: any;
  validationErrors: Record<string, string>;
  completionPercentage: number;
  onFieldFocus?: (fieldName: string) => void;
}

export default function NursingProgressTracker({
  formData,
  validationErrors,
  completionPercentage,
  onFieldFocus
}: NursingProgressTrackerProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Definir todos los campos del formulario
  const getFieldStatuses = (): FieldStatus[] => {
    return [
      // Sección NANDA
      {
        name: 'nanda_dominio',
        label: 'Dominio NANDA',
        isComplete: !!(formData.nanda_dominio?.trim()),
        isRequired: true,
        errorMessage: validationErrors.nanda_dominio,
        section: 'NANDA'
      },
      {
        name: 'nanda_clase',
        label: 'Clase NANDA',
        isComplete: !!(formData.nanda_clase?.trim() && formData.nanda_clase.trim().length >= 3),
        isRequired: true,
        errorMessage: validationErrors.nanda_clase,
        section: 'NANDA'
      },
      {
        name: 'nanda_etiqueta_diagnostica',
        label: 'Etiqueta Diagnóstica',
        isComplete: !!(formData.nanda_etiqueta_diagnostica?.trim() && formData.nanda_etiqueta_diagnostica.trim().length >= 3),
        isRequired: true,
        errorMessage: validationErrors.nanda_etiqueta_diagnostica,
        section: 'NANDA'
      },
      {
        name: 'nanda_factor_relacionado',
        label: 'Factor Relacionado',
        isComplete: !!(formData.nanda_factor_relacionado?.trim() && formData.nanda_factor_relacionado.trim().length >= 3),
        isRequired: true,
        errorMessage: validationErrors.nanda_factor_relacionado,
        section: 'NANDA'
      },
      {
        name: 'nanda_planteamiento_del_diagnostico',
        label: 'Planteamiento del Diagnóstico',
        isComplete: !!(formData.nanda_planteamiento_del_diagnostico?.trim() && formData.nanda_planteamiento_del_diagnostico.trim().length >= 10),
        isRequired: true,
        errorMessage: validationErrors.nanda_planteamiento_del_diagnostico,
        section: 'NANDA'
      },

      // Sección NOC
      {
        name: 'noc_resultado_noc',
        label: 'Resultado NOC',
        isComplete: !!(formData.noc_resultado_noc?.trim()),
        isRequired: true,
        errorMessage: validationErrors.noc_resultado_noc,
        section: 'NOC'
      },
      {
        name: 'noc_dominio',
        label: 'Dominio NOC',
        isComplete: !!(formData.noc_dominio?.trim() && formData.noc_dominio.trim().length >= 3),
        isRequired: true,
        errorMessage: validationErrors.noc_dominio,
        section: 'NOC'
      },
      {
        name: 'noc_clase',
        label: 'Clase NOC',
        isComplete: !!(formData.noc_clase?.trim() && formData.noc_clase.trim().length >= 3),
        isRequired: true,
        errorMessage: validationErrors.noc_clase,
        section: 'NOC'
      },
      {
        name: 'noc_indicador',
        label: 'Indicadores NOC',
        isComplete: !!(formData.noc_indicador?.length > 0 && formData.noc_indicador.every((item: string) => item?.trim().length >= 3)),
        isRequired: true,
        errorMessage: validationErrors.noc_indicador,
        section: 'NOC'
      },
      {
        name: 'noc_rango',
        label: 'Rangos NOC',
        isComplete: !!(formData.noc_rango?.length > 0 && formData.noc_rango.every((item: string) => item && /^\d+$/.test(item.trim()))),
        isRequired: true,
        errorMessage: validationErrors.noc_rango,
        section: 'NOC'
      },
      {
        name: 'noc_diana_inicial',
        label: 'Dianas Iniciales',
        isComplete: !!(formData.noc_diana_inicial?.length > 0 && formData.noc_diana_inicial.every((item: string) => item && /^[1-5]$/.test(item.trim()))),
        isRequired: true,
        errorMessage: validationErrors.noc_diana_inicial,
        section: 'NOC'
      },
      {
        name: 'noc_diana_esperada',
        label: 'Dianas Esperadas',
        isComplete: !!(formData.noc_diana_esperada?.length > 0 && formData.noc_diana_esperada.every((item: string) => item && /^[1-5]$/.test(item.trim()))),
        isRequired: true,
        errorMessage: validationErrors.noc_diana_esperada,
        section: 'NOC'
      },
      {
        name: 'noc_evaluacion',
        label: 'Evaluaciones NOC',
        isComplete: !!(formData.noc_evaluacion?.length > 0 && formData.noc_evaluacion.every((item: string) => item?.trim().length >= 3)),
        isRequired: true,
        errorMessage: validationErrors.noc_evaluacion,
        section: 'NOC'
      },

      // Sección NIC
      {
        name: 'nic_intervencion',
        label: 'Intervenciones NIC',
        isComplete: !!(formData.nic_intervencion?.length > 0 && formData.nic_intervencion.every((item: string) => item?.trim())),
        isRequired: true,
        errorMessage: validationErrors.nic_intervencion,
        section: 'NIC'
      },
      {
        name: 'nic_clase',
        label: 'Clases NIC',
        isComplete: !!(formData.nic_clase?.length > 0 && formData.nic_clase.every((item: string) => item?.trim().length >= 3)),
        isRequired: true,
        errorMessage: validationErrors.nic_clase,
        section: 'NIC'
      },
      {
        name: 'nic_actividades',
        label: 'Actividades NIC',
        isComplete: !!(formData.nic_actividades?.length > 0 && formData.nic_actividades.every((item: string) => item?.trim().length >= 10)),
        isRequired: true,
        errorMessage: validationErrors.nic_actividades,
        section: 'NIC'
      }
    ];
  };

  const fieldStatuses = getFieldStatuses();
  const completedFields = fieldStatuses.filter(field => field.isComplete).length;
  const totalFields = fieldStatuses.length;

  // Agrupar por sección
  const sectionStats = {
    NANDA: fieldStatuses.filter(f => f.section === 'NANDA'),
    NOC: fieldStatuses.filter(f => f.section === 'NOC'),
    NIC: fieldStatuses.filter(f => f.section === 'NIC')
  };

  const getSectionProgress = (sectionFields: FieldStatus[]) => {
    const completed = sectionFields.filter(f => f.isComplete).length;
    return (completed / sectionFields.length) * 100;
  };

  const getSectionColor = (percentage: number) => {
    if (percentage === 100) return 'text-green-600';
    if (percentage >= 75) return 'text-blue-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getFieldIcon = (field: FieldStatus) => {
    if (field.isComplete) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    } else if (field.errorMessage) {
      return <XCircle className="h-4 w-4 text-red-500" />;
    } else {
      return <Circle className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Encabezado con progreso general */}
      <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
            Progreso del Formulario
          </h3>
          <Badge variant={completionPercentage === 100 ? "default" : "secondary"}>
            {completionPercentage}% Completado
          </Badge>
        </div>
        
        <Progress value={completionPercentage} className="mb-3" />
        
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {completedFields} de {totalFields} campos completados
        </div>
      </div>

      {/* Progreso por sección */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(sectionStats).map(([sectionName, fields]) => {
          const progress = getSectionProgress(fields);
          const completed = fields.filter(f => f.isComplete).length;
          
          return (
            <div key={sectionName} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900 dark:text-gray-100">{sectionName}</h4>
                <span className={`text-sm font-semibold ${getSectionColor(progress)}`}>
                  {Math.round(progress)}%
                </span>
              </div>
              <Progress value={progress} className="mb-2" />
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {completed} de {fields.length} campos
              </div>
            </div>
          );
        })}
      </div>

      {/* Lista detallada de campos */}
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="w-full">
            <span>Ver detalles de campos</span>
            {isExpanded ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="space-y-4 mt-4">
          {Object.entries(sectionStats).map(([sectionName, fields]) => (
            <div key={sectionName} className="space-y-2">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-1">
                {sectionName}
              </h4>
              <div className="space-y-1">
                {fields.map(field => (
                  <div
                    key={field.name}
                    className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                      field.isComplete 
                        ? 'bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30' 
                        : field.errorMessage
                        ? 'bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30'
                        : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                    }`}
                    onClick={() => onFieldFocus?.(field.name)}
                  >
                    <div className="flex items-center space-x-2">
                      {getFieldIcon(field)}
                      <span className="text-sm text-gray-900 dark:text-gray-100">
                        {field.label}
                      </span>
                      {field.isRequired && <span className="text-red-500 text-xs">*</span>}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {field.errorMessage && (
                        <span className="text-xs text-red-600 dark:text-red-400 max-w-xs truncate">
                          {field.errorMessage}
                        </span>
                      )}
                      <Badge 
                        variant={field.isComplete ? "default" : field.errorMessage ? "destructive" : "secondary"}
                        className="text-xs"
                      >
                        {field.isComplete ? "Completo" : field.errorMessage ? "Error" : "Pendiente"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
