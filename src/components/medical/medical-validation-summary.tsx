'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Activity, FileText, Stethoscope, Clock, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MedicalValidationState } from '@/types/medical-validation';

// Componentes UI simplificados para evitar dependencias
const Progress = ({ value, className }: { value?: number; className?: string }) => (
  <div className={`relative h-3 w-full overflow-hidden rounded-full bg-gray-200 ${className || ''}`}>
    <div
      className="h-full bg-blue-600 transition-all duration-300 ease-in-out"
      style={{ width: `${Math.min(100, Math.max(0, value || 0))}%` }}
    />
  </div>
);

const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-lg border bg-white text-gray-900 shadow-sm ${className || ''}`}>
    {children}
  </div>
);

const CardHeader = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className || ''}`}>
    {children}
  </div>
);

const CardTitle = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className || ''}`}>
    {children}
  </h3>
);

const CardContent = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-6 pt-0 ${className || ''}`}>
    {children}
  </div>
);

interface ValidationSummaryProps {
  validationState: MedicalValidationState;
  formProgress: { completed: number; total: number; percentage: number };
  patientInfo?: {
    name?: string;
    age?: number;
    gender?: string;
  };
  showDetails?: boolean;
}

interface ValidationStats {
  totalFields: number;
  completedFields: number;
  validFields: number;
  fieldsWithErrors: number;
  fieldsWithWarnings: number;
  criticalAlerts: number;
  protocolCompliance: number;
}

export default function MedicalValidationSummary({
  validationState,
  formProgress,
  patientInfo,
  showDetails = true,
}: ValidationSummaryProps) {
  
  const [stats, setStats] = useState<ValidationStats>({
    totalFields: 0,
    completedFields: 0,
    validFields: 0,
    fieldsWithErrors: 0,
    fieldsWithWarnings: 0,
    criticalAlerts: 0,
    protocolCompliance: 0,
  });

  useEffect(() => {
    calculateStats();
  }, [validationState, formProgress]); // eslint-disable-line react-hooks/exhaustive-deps

  const calculateStats = () => {
    const fieldErrors = Object.values(validationState.fieldErrors).filter(error => error);
    const criticalAlerts = validationState.clinicalAlerts.filter(alert => alert.severity === 'critical');
    const warningAlerts = validationState.clinicalAlerts.filter(alert => alert.severity === 'medium' || alert.severity === 'high');
    
    // Calcular cumplimiento de protocolos (simplificado)
    const protocolCompliance = Math.max(0, 100 - (validationState.protocolErrors.length * 10));

    setStats({
      totalFields: formProgress.total,
      completedFields: formProgress.completed,
      validFields: Math.max(0, formProgress.completed - fieldErrors.length),
      fieldsWithErrors: fieldErrors.length,
      fieldsWithWarnings: warningAlerts.length,
      criticalAlerts: criticalAlerts.length,
      protocolCompliance,
    });
  };

  const getOverallStatus = () => {
    if (stats.criticalAlerts > 0) {
      return {
        status: 'critical',
        label: 'Atención Crítica Requerida',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        icon: XCircle,
      };
    }
    
    if (stats.fieldsWithErrors > 0) {
      return {
        status: 'errors',
        label: 'Formulario con Errores',
        color: 'text-red-500',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        icon: XCircle,
      };
    }
    
    if (stats.fieldsWithWarnings > 0 || formProgress.percentage < 80) {
      return {
        status: 'warnings',
        label: 'Requiere Atención',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        icon: AlertTriangle,
      };
    }
    
    if (formProgress.percentage >= 95 && validationState.isValid) {
      return {
        status: 'excellent',
        label: 'Formulario Completo y Válido',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        icon: CheckCircle,
      };
    }
    
    return {
      status: 'good',
      label: 'En Progreso',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      icon: Clock,
    };
  };

  const overallStatus = getOverallStatus();
  const StatusIcon = overallStatus.icon;

  const alertsByCategory = {
    vital_signs: validationState.clinicalAlerts.filter(alert => alert.category === 'vital_signs'),
    diagnosis: validationState.clinicalAlerts.filter(alert => alert.category === 'diagnosis'),
    medication: validationState.clinicalAlerts.filter(alert => alert.category === 'medication'),
    protocol: validationState.clinicalAlerts.filter(alert => alert.category === 'protocol'),
    coherence: validationState.clinicalAlerts.filter(alert => alert.category === 'coherence'),
  };

  return (
    <Card className={`${overallStatus.bgColor} ${overallStatus.borderColor} border-2`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <StatusIcon className={`w-6 h-6 ${overallStatus.color}`} />
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">
                Validación Médica
              </CardTitle>
              <p className={`text-sm ${overallStatus.color} font-medium`}>
                {overallStatus.label}
              </p>
            </div>
          </div>
          
          {patientInfo?.name && (
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{patientInfo.name}</p>
              <p className="text-xs text-gray-600">
                {patientInfo.age && `${patientInfo.age} años`}
                {patientInfo.age && patientInfo.gender && ' • '}
                {patientInfo.gender === 'male' ? 'Masculino' : patientInfo.gender === 'female' ? 'Femenino' : ''}
              </p>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progreso General */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Progreso del Formulario</span>
            <span className="text-sm font-bold text-gray-900">{formProgress.percentage}%</span>
          </div>
          <Progress value={formProgress.percentage} className="h-3" />
          <div className="flex justify-between text-xs text-gray-600">
            <span>{formProgress.completed} de {formProgress.total} campos completados</span>
            <span>{stats.validFields} campos válidos</span>
          </div>
        </div>

        <Separator />

        {/* Estadísticas Rápidas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="text-center p-2 bg-white rounded-lg border">
            <div className="text-lg font-bold text-green-600">{stats.validFields}</div>
            <div className="text-xs text-gray-600">Campos Válidos</div>
          </div>
          
          <div className="text-center p-2 bg-white rounded-lg border">
            <div className="text-lg font-bold text-red-600">{stats.fieldsWithErrors}</div>
            <div className="text-xs text-gray-600">Con Errores</div>
          </div>
          
          <div className="text-center p-2 bg-white rounded-lg border">
            <div className="text-lg font-bold text-yellow-600">{stats.fieldsWithWarnings}</div>
            <div className="text-xs text-gray-600">Advertencias</div>
          </div>
          
          <div className="text-center p-2 bg-white rounded-lg border">
            <div className="text-lg font-bold text-blue-600">{stats.protocolCompliance}%</div>
            <div className="text-xs text-gray-600">Protocolos</div>
          </div>
        </div>

        {/* Alertas Críticas */}
        {stats.criticalAlerts > 0 && (
          <div className="p-3 bg-red-100 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="w-4 h-4 text-red-600" />
              <span className="font-medium text-red-800">
                {stats.criticalAlerts} Alerta{stats.criticalAlerts === 1 ? '' : 's'} Crítica{stats.criticalAlerts === 1 ? '' : 's'}
              </span>
            </div>
            <div className="space-y-1">
              {validationState.clinicalAlerts
                .filter(alert => alert.severity === 'critical')
                .slice(0, 3)
                .map((alert, index) => (
                  <div key={index} className="text-sm text-red-700">
                    • {alert.message}
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Detalles por Categoría */}
        {showDetails && (
          <div className="space-y-3">
            {/* Signos Vitales */}
            {alertsByCategory.vital_signs.length > 0 && (
              <div className="p-3 bg-white rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-gray-800">Signos Vitales</span>
                  <Badge variant="outline" className="text-xs">
                    {alertsByCategory.vital_signs.length}
                  </Badge>
                </div>
                <div className="space-y-1">
                  {alertsByCategory.vital_signs.slice(0, 2).map((alert, index) => (
                    <div key={index} className="text-sm text-gray-600 flex items-start gap-1">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>{alert.message}</span>
                    </div>
                  ))}
                  {alertsByCategory.vital_signs.length > 2 && (
                    <div className="text-xs text-gray-500">
                      +{alertsByCategory.vital_signs.length - 2} más...
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Diagnósticos */}
            {alertsByCategory.diagnosis.length > 0 && (
              <div className="p-3 bg-white rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <Stethoscope className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-gray-800">Diagnósticos</span>
                  <Badge variant="outline" className="text-xs">
                    {alertsByCategory.diagnosis.length}
                  </Badge>
                </div>
                <div className="space-y-1">
                  {alertsByCategory.diagnosis.slice(0, 2).map((alert, index) => (
                    <div key={index} className="text-sm text-gray-600 flex items-start gap-1">
                      <span className="text-green-500 mt-1">•</span>
                      <span>{alert.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Protocolos */}
            {alertsByCategory.protocol.length > 0 && (
              <div className="p-3 bg-white rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-purple-600" />
                  <span className="font-medium text-gray-800">Protocolos Médicos</span>
                  <Badge variant="outline" className="text-xs">
                    {alertsByCategory.protocol.length}
                  </Badge>
                </div>
                <div className="space-y-1">
                  {alertsByCategory.protocol.slice(0, 2).map((alert, index) => (
                    <div key={index} className="text-sm text-gray-600 flex items-start gap-1">
                      <span className="text-purple-500 mt-1">•</span>
                      <span>{alert.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Recomendaciones Generales */}
        {formProgress.percentage > 50 && formProgress.percentage < 90 && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-blue-800">Siguientes Pasos</span>
            </div>
            <div className="space-y-1 text-sm text-blue-700">
              {getNextStepRecommendations(formProgress.percentage, validationState).map((rec, index) => (
                <div key={index} className="flex items-start gap-1">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Estado Final */}
        {formProgress.percentage >= 90 && validationState.isValid && (
          <div className="p-3 bg-green-100 border border-green-200 rounded-lg text-center">
            <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <p className="font-medium text-green-800">¡Formulario Médico Completo!</p>
            <p className="text-sm text-green-700">
              Todos los criterios de validación han sido cumplidos
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Función para obtener recomendaciones del siguiente paso
function getNextStepRecommendations(percentage: number, validationState: MedicalValidationState): string[] {
  const recommendations: string[] = [];

  if (percentage < 70) {
    recommendations.push('Complete los campos obligatorios restantes');
    recommendations.push('Verifique los signos vitales del paciente');
  }

  if (validationState.fieldErrors && Object.keys(validationState.fieldErrors).length > 0) {
    recommendations.push('Corrija los errores de validación pendientes');
  }

  if (validationState.clinicalAlerts.length > 0) {
    recommendations.push('Revise las alertas clínicas generadas');
  }

  if (validationState.protocolErrors.length > 0) {
    recommendations.push('Complete los protocolos médicos requeridos');
  }

  if (percentage >= 80 && recommendations.length === 0) {
    recommendations.push('Revise el plan de tratamiento');
    recommendations.push('Verifique la coherencia de diagnósticos');
  }

  return recommendations.length > 0 ? recommendations : ['Continue completando el formulario'];
}
