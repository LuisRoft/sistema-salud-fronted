'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, Activity, FileText, Stethoscope } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { MedicalFormData } from '@/types/medical-validation';

// Componente Alert simplificado para evitar dependencias
const Alert = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-3 border rounded-lg ${className || ''}`}>
    {children}
  </div>
);

const AlertDescription = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={`text-sm ${className || ''}`}>
    {children}
  </div>
);

interface CoherenceCheckerProps {
  formData: Partial<MedicalFormData>;
  patientAge?: number;
  patientGender?: string;
  onCoherenceChange?: (isCoherent: boolean, alerts: string[]) => void;
}

interface CoherenceIssue {
  type: 'error' | 'warning' | 'info';
  category: 'vital_signs' | 'diagnosis' | 'protocol' | 'coherence';
  message: string;
  field?: string;
  suggestion?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export default function MedicalCoherenceChecker({ 
  formData, 
  patientAge = 0,
  patientGender = '',
  onCoherenceChange 
}: CoherenceCheckerProps) {
  
  const [issues, setIssues] = useState<CoherenceIssue[]>([]);
  const [isCoherent, setIsCoherent] = useState<boolean | null>(null);

  useEffect(() => {
    const checkCoherence = () => {
      const newIssues: CoherenceIssue[] = [];
      
      // Verificar completitud de datos básicos
      if (!formData.consultationReason || formData.consultationReason.length < 5) {
        newIssues.push({
          type: 'error',
          category: 'protocol',
          message: 'Motivo de consulta incompleto',
          field: 'consultationReason',
          suggestion: 'Describa detalladamente el motivo por el cual el paciente solicita atención médica',
          severity: 'high',
        });
      }

      if (!formData.currentIllness || formData.currentIllness.length < 10) {
        newIssues.push({
          type: 'error',
          category: 'protocol',
          message: 'Enfermedad actual insuficientemente documentada',
          field: 'currentIllness',
          suggestion: 'Incluya inicio, evolución, síntomas asociados y factores modificadores',
          severity: 'high',
        });
      }

      // Verificar signos vitales
      if (formData.vitalSigns) {
        const vs = formData.vitalSigns;
        
        // Validar temperatura
        if (vs.temperature && (vs.temperature < 35 || vs.temperature > 42)) {
          newIssues.push({
            type: 'error',
            category: 'vital_signs',
            message: `Temperatura crítica: ${vs.temperature}°C`,
            field: 'vitalSigns.temperature',
            suggestion: 'Verificar la medición. Temperaturas <35°C o >42°C requieren atención inmediata',
            severity: 'critical',
          });
        }

        // Validar frecuencia cardíaca
        if (vs.heartRate && (vs.heartRate < 40 || vs.heartRate > 150)) {
          newIssues.push({
            type: vs.heartRate < 50 || vs.heartRate > 120 ? 'error' : 'warning',
            category: 'vital_signs',
            message: `Frecuencia cardíaca anormal: ${vs.heartRate} lpm`,
            field: 'vitalSigns.heartRate',
            suggestion: vs.heartRate < 50 ? 'Evaluar bradicardia, considerar ECG' : 'Evaluar taquicardia, buscar causas',
            severity: vs.heartRate < 40 || vs.heartRate > 150 ? 'critical' : 'medium',
          });
        }

        // Validar presión arterial
        if (vs.bloodPressure) {
          const bpMatch = vs.bloodPressure.match(/(\d+)\/(\d+)/);
          if (bpMatch) {
            const systolic = parseInt(bpMatch[1]);
            const diastolic = parseInt(bpMatch[2]);
            
            if (systolic > 180 || diastolic > 120) {
              newIssues.push({
                type: 'error',
                category: 'vital_signs',
                message: `Crisis hipertensiva: ${vs.bloodPressure} mmHg`,
                field: 'vitalSigns.bloodPressure',
                suggestion: 'Requiere manejo inmediato. Considerar emergencia hipertensiva',
                severity: 'critical',
              });
            } else if (systolic > 140 || diastolic > 90) {
              newIssues.push({
                type: 'warning',
                category: 'vital_signs',
                message: `Hipertensión arterial: ${vs.bloodPressure} mmHg`,
                field: 'vitalSigns.bloodPressure',
                suggestion: 'Confirmar con múltiples mediciones, evaluar riesgo cardiovascular',
                severity: 'medium',
              });
            }
          }
        }

        // Validar saturación de oxígeno
        if (vs.oxygenSaturation && vs.oxygenSaturation < 90) {
          newIssues.push({
            type: 'error',
            category: 'vital_signs',
            message: `Hipoxemia severa: SpO2 ${vs.oxygenSaturation}%`,
            field: 'vitalSigns.oxygenSaturation',
            suggestion: 'Requiere oxigenoterapia inmediata y evaluación respiratoria',
            severity: 'critical',
          });
        } else if (vs.oxygenSaturation && vs.oxygenSaturation < 95) {
          newIssues.push({
            type: 'warning',
            category: 'vital_signs',
            message: `Saturación baja: SpO2 ${vs.oxygenSaturation}%`,
            field: 'vitalSigns.oxygenSaturation',
            suggestion: 'Evaluar función respiratoria, considerar gasometría',
            severity: 'medium',
          });
        }

        // Validar IMC
        if (vs.bmi) {
          if (vs.bmi < 16) {
            newIssues.push({
              type: 'warning',
              category: 'vital_signs',
              message: `Bajo peso severo: IMC ${vs.bmi.toFixed(1)}`,
              field: 'vitalSigns.bmi',
              suggestion: 'Evaluar estado nutricional, descartar trastornos alimentarios',
              severity: 'medium',
            });
          } else if (vs.bmi > 40) {
            newIssues.push({
              type: 'warning',
              category: 'vital_signs',
              message: `Obesidad mórbida: IMC ${vs.bmi.toFixed(1)}`,
              field: 'vitalSigns.bmi',
              suggestion: 'Evaluar comorbilidades, considerar manejo multidisciplinario',
              severity: 'medium',
            });
          }
        }
      }

      // Verificar coherencia de diagnósticos
      if (formData.diagnoses && formData.diagnoses.length > 0) {
        formData.diagnoses.forEach((diagnosis, index) => {
          if (!diagnosis.description || !diagnosis.cie10) {
            newIssues.push({
              type: 'error',
              category: 'diagnosis',
              message: `Diagnóstico ${index + 1} incompleto`,
              field: `diagnoses.${index}`,
              suggestion: 'Complete la descripción y el código CIE-10 del diagnóstico',
              severity: 'high',
            });
          }

          if (!diagnosis.presumptive && !diagnosis.definitive) {
            newIssues.push({
              type: 'error',
              category: 'diagnosis',
              message: `Diagnóstico ${index + 1} sin clasificar`,
              field: `diagnoses.${index}`,
              suggestion: 'Indique si el diagnóstico es presuntivo o definitivo',
              severity: 'medium',
            });
          }

          // Verificar coherencia con síntomas
          if (diagnosis.cie10 && formData.currentIllness) {
            const commonSymptoms = getCommonSymptomsForDiagnosis(diagnosis.cie10);
            if (commonSymptoms.length > 0) {
              const hasMatchingSymptoms = commonSymptoms.some(symptom =>
                formData.currentIllness!.toLowerCase().includes(symptom.toLowerCase())
              );
              
              if (!hasMatchingSymptoms) {
                newIssues.push({
                  type: 'warning',
                  category: 'coherence',
                  message: `Posible incoherencia en diagnóstico: ${diagnosis.description}`,
                  field: `diagnoses.${index}`,
                  suggestion: `Síntomas esperados: ${commonSymptoms.join(', ')}`,
                  severity: 'medium',
                });
              }
            }
          }
        });
      } else {
        newIssues.push({
          type: 'error',
          category: 'diagnosis',
          message: 'No se han registrado diagnósticos',
          field: 'diagnoses',
          suggestion: 'Todo paciente debe tener al menos un diagnóstico registrado',
          severity: 'high',
        });
      }

      // Verificar plan de tratamiento
      if (!formData.treatmentPlan || formData.treatmentPlan.length < 10) {
        newIssues.push({
          type: 'error',
          category: 'protocol',
          message: 'Plan de tratamiento insuficiente',
          field: 'treatmentPlan',
          suggestion: 'Incluya medicamentos, procedimientos, seguimiento y recomendaciones',
          severity: 'high',
        });
      }

      // Verificar examen físico
      if (!formData.physicalExam || Object.keys(formData.physicalExam).length < 3) {
        newIssues.push({
          type: 'warning',
          category: 'protocol',
          message: 'Examen físico incompleto',
          field: 'physicalExam',
          suggestion: 'Se recomienda documentar al menos examen de sistemas principales',
          severity: 'medium',
        });
      }

      // Verificar antecedentes importantes para pacientes mayores
      if (patientAge > 40) {
        if (!formData.personalHistory || formData.personalHistory.length === 0) {
          newIssues.push({
            type: 'info',
            category: 'protocol',
            message: 'Antecedentes personales no documentados',
            field: 'personalHistory',
            suggestion: 'En pacientes >40 años es importante documentar antecedentes médicos',
            severity: 'low',
          });
        }

        if (!formData.medications || formData.medications.length === 0) {
          newIssues.push({
            type: 'info',
            category: 'protocol',
            message: 'Medicación actual no documentada',
            field: 'medications',
            suggestion: 'Verificar si el paciente toma medicamentos regularmente',
            severity: 'low',
          });
        }
      }

      setIssues(newIssues);
      
      // Determinar si el formulario es coherente
      const hasErrors = newIssues.some(issue => issue.type === 'error');
      const hasCriticalIssues = newIssues.some(issue => issue.severity === 'critical');
      const isFormCoherent = !hasErrors && !hasCriticalIssues;
      
      setIsCoherent(isFormCoherent);
      onCoherenceChange?.(isFormCoherent, newIssues.map(issue => issue.message));
    };

    checkCoherence();
  }, [formData, patientAge, patientGender, onCoherenceChange]);

  const getOverallStatus = () => {
    if (isCoherent === null) return { status: 'pending', icon: Info, color: 'text-gray-400', bgColor: 'bg-gray-50' };
    if (isCoherent) return { status: 'coherent', icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-50' };
    
    const hasErrors = issues.some(issue => issue.type === 'error');
    const hasCritical = issues.some(issue => issue.severity === 'critical');
    
    if (hasCritical) return { status: 'critical', icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-50' };
    if (hasErrors) return { status: 'errors', icon: XCircle, color: 'text-red-500', bgColor: 'bg-red-50' };
    return { status: 'warnings', icon: AlertTriangle, color: 'text-yellow-600', bgColor: 'bg-yellow-50' };
  };

  const overallStatus = getOverallStatus();
  const StatusIcon = overallStatus.icon;

  const getStatusText = () => {
    switch (overallStatus.status) {
      case 'pending': return 'Verificando coherencia clínica...';
      case 'coherent': return 'Formulario médico coherente';
      case 'critical': return 'Atención: Problemas críticos detectados';
      case 'errors': return 'Formulario con errores importantes';
      case 'warnings': return 'Formulario con observaciones';
      default: return 'Estado desconocido';
    }
  };

  const issuesByCategory = {
    vital_signs: issues.filter(issue => issue.category === 'vital_signs'),
    diagnosis: issues.filter(issue => issue.category === 'diagnosis'),
    protocol: issues.filter(issue => issue.category === 'protocol'),
    coherence: issues.filter(issue => issue.category === 'coherence'),
  };

  const totalIssues = issues.length;
  const criticalIssues = issues.filter(issue => issue.severity === 'critical').length;
  const errorIssues = issues.filter(issue => issue.type === 'error').length;

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-white">
      {/* Header con estado general */}
      <div className={`flex items-center gap-3 p-3 rounded-lg ${overallStatus.bgColor}`}>
        <StatusIcon className={`w-5 h-5 ${overallStatus.color}`} />
        <div className="flex-1">
          <h3 className="font-medium text-gray-900">{getStatusText()}</h3>
          <p className="text-sm text-gray-600">
            {totalIssues === 0 
              ? 'Todos los criterios médicos están cumplidos'
              : `${totalIssues} observación${totalIssues === 1 ? '' : 'es'} detectada${totalIssues === 1 ? '' : 's'}`
            }
          </p>
        </div>
        {totalIssues > 0 && (
          <div className="flex gap-1">
            {criticalIssues > 0 && (
              <Badge variant="destructive" className="text-xs">
                {criticalIssues} crítico{criticalIssues === 1 ? '' : 's'}
              </Badge>
            )}
            {errorIssues > 0 && (
              <Badge variant="secondary" className="text-xs bg-red-100 text-red-800">
                {errorIssues} error{errorIssues === 1 ? '' : 'es'}
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Detalles por categoría */}
      {totalIssues > 0 && (
        <div className="space-y-3">
          {/* Signos Vitales */}
          {issuesByCategory.vital_signs.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-blue-600" />
                <h4 className="font-medium text-sm">Signos Vitales</h4>
                <Badge variant="outline" className="text-xs">
                  {issuesByCategory.vital_signs.length}
                </Badge>
              </div>
              <div className="space-y-2">
                {issuesByCategory.vital_signs.map((issue, index) => (
                  <Alert key={`vital_${index}`} className="py-2">
                    <AlertDescription className="text-sm">
                      <span className="font-medium">{issue.message}</span>
                      {issue.suggestion && (
                        <p className="text-gray-600 mt-1">{issue.suggestion}</p>
                      )}
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </div>
          )}

          {/* Diagnósticos */}
          {issuesByCategory.diagnosis.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Stethoscope className="w-4 h-4 text-green-600" />
                <h4 className="font-medium text-sm">Diagnósticos</h4>
                <Badge variant="outline" className="text-xs">
                  {issuesByCategory.diagnosis.length}
                </Badge>
              </div>
              <div className="space-y-2">
                {issuesByCategory.diagnosis.map((issue, index) => (
                  <Alert key={`diagnosis_${index}`} className="py-2">
                    <AlertDescription className="text-sm">
                      <span className="font-medium">{issue.message}</span>
                      {issue.suggestion && (
                        <p className="text-gray-600 mt-1">{issue.suggestion}</p>
                      )}
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </div>
          )}

          {/* Protocolos */}
          {issuesByCategory.protocol.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-purple-600" />
                <h4 className="font-medium text-sm">Protocolos Médicos</h4>
                <Badge variant="outline" className="text-xs">
                  {issuesByCategory.protocol.length}
                </Badge>
              </div>
              <div className="space-y-2">
                {issuesByCategory.protocol.map((issue, index) => (
                  <Alert key={`protocol_${index}`} className="py-2">
                    <AlertDescription className="text-sm">
                      <span className="font-medium">{issue.message}</span>
                      {issue.suggestion && (
                        <p className="text-gray-600 mt-1">{issue.suggestion}</p>
                      )}
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </div>
          )}

          {/* Coherencia */}
          {issuesByCategory.coherence.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-orange-600" />
                <h4 className="font-medium text-sm">Coherencia Clínica</h4>
                <Badge variant="outline" className="text-xs">
                  {issuesByCategory.coherence.length}
                </Badge>
              </div>
              <div className="space-y-2">
                {issuesByCategory.coherence.map((issue, index) => (
                  <Alert key={`coherence_${index}`} className="py-2">
                    <AlertDescription className="text-sm">
                      <span className="font-medium">{issue.message}</span>
                      {issue.suggestion && (
                        <p className="text-gray-600 mt-1">{issue.suggestion}</p>
                      )}
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Función auxiliar para obtener síntomas comunes por diagnóstico
function getCommonSymptomsForDiagnosis(cie10Code: string): string[] {
  const symptomsMap: Record<string, string[]> = {
    'J44': ['disnea', 'tos', 'expectoración', 'sibilancias', 'fatiga'],
    'I10': ['cefalea', 'mareos', 'visión borrosa', 'palpitaciones'],
    'E11': ['poliuria', 'polidipsia', 'polifagia', 'pérdida de peso', 'fatiga'],
    'K59': ['estreñimiento', 'dolor abdominal', 'distensión', 'flatulencia'],
    'M79': ['dolor muscular', 'rigidez', 'inflamación', 'limitación funcional'],
    'R50': ['fiebre', 'escalofríos', 'malestar general', 'sudoración'],
    'F32': ['tristeza', 'anhedonia', 'fatiga', 'alteración del sueño', 'pérdida de apetito'],
  };
  
  return symptomsMap[cie10Code] || [];
}
