'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, FileCheck, Clock, Shield, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { MedicalFormData } from '@/types/medical-validation';

// Componentes UI simplificados para evitar dependencias
const Progress = ({ value, className }: { value?: number; className?: string }) => (
  <div className={`relative h-3 w-full overflow-hidden rounded-full bg-gray-200 ${className || ''}`}>
    <div
      className="h-full bg-blue-600 transition-all duration-300 ease-in-out"
      style={{ width: `${Math.min(100, Math.max(0, value || 0))}%` }}
    />
  </div>
);

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
  <h3 className={`text-lg font-semibold leading-none tracking-tight ${className || ''}`}>
    {children}
  </h3>
);

const CardContent = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-6 pt-0 ${className || ''}`}>
    {children}
  </div>
);

interface ProtocolCheckerProps {
  formData: Partial<MedicalFormData>;
  consultationType: 'external' | 'internal' | 'emergency' | 'routine';
  patientAge?: number;
  patientRiskLevel?: 'low' | 'medium' | 'high' | 'critical';
  onProtocolChange?: (compliance: number, missingItems: string[]) => void;
}

interface ProtocolItem {
  id: string;
  name: string;
  description: string;
  required: boolean;
  category: 'documentation' | 'clinical' | 'safety' | 'legal';
  priority: 'low' | 'medium' | 'high' | 'critical';
  validator: (data: Partial<MedicalFormData>) => boolean;
  suggestion?: string;
  applicableFor?: {
    consultationType?: ('external' | 'internal' | 'emergency' | 'routine')[];
    ageRange?: [number, number];
    riskLevel?: ('low' | 'medium' | 'high' | 'critical')[];
  };
}

interface ProtocolResult {
  item: ProtocolItem;
  status: 'complete' | 'incomplete' | 'not_applicable';
  message?: string;
}

export default function MedicalProtocolChecker({
  formData,
  consultationType,
  patientAge = 0,
  patientRiskLevel = 'low',
  onProtocolChange,
}: ProtocolCheckerProps) {
  
  const [protocolResults, setProtocolResults] = useState<ProtocolResult[]>([]);
  const [complianceScore, setComplianceScore] = useState(0);
  const [showDetails, setShowDetails] = useState(false);

  // Definición de protocolos médicos
  const medicalProtocols: ProtocolItem[] = [
    // Documentación Básica
    {
      id: 'patient_identification',
      name: 'Identificación del Paciente',
      description: 'Datos completos de identificación del paciente',
      required: true,
      category: 'documentation',
      priority: 'critical',
      validator: (data) => Boolean(data.patientId),
      suggestion: 'Verifique que el paciente esté correctamente identificado en el sistema',
    },
    {
      id: 'consultation_reason',
      name: 'Motivo de Consulta',
      description: 'Motivo principal claramente documentado',
      required: true,
      category: 'documentation',
      priority: 'high',
      validator: (data) => Boolean(data.consultationReason && data.consultationReason.length >= 10),
      suggestion: 'Documente detalladamente el motivo por el cual el paciente solicita atención',
    },
    {
      id: 'current_illness',
      name: 'Enfermedad Actual',
      description: 'Historia clínica de la enfermedad actual completa',
      required: true,
      category: 'clinical',
      priority: 'high',
      validator: (data) => Boolean(data.currentIllness && data.currentIllness.length >= 20),
      suggestion: 'Incluya inicio, evolución, síntomas asociados y factores modificadores',
    },
    
    // Signos Vitales
    {
      id: 'vital_signs_complete',
      name: 'Signos Vitales Completos',
      description: 'Todos los signos vitales básicos registrados',
      required: true,
      category: 'clinical',
      priority: 'high',
      validator: (data) => {
        const vs = data.vitalSigns;
        return Boolean(vs && vs.temperature && vs.heartRate && vs.bloodPressure && vs.respiratoryRate);
      },
      suggestion: 'Complete temperatura, pulso, presión arterial y frecuencia respiratoria',
    },
    {
      id: 'weight_height_bmi',
      name: 'Antropometría',
      description: 'Peso, talla e IMC registrados',
      required: true,
      category: 'clinical',
      priority: 'medium',
      validator: (data) => {
        const vs = data.vitalSigns;
        return Boolean(vs && vs.weight && vs.height && vs.bmi);
      },
      suggestion: 'Registre peso, talla y calcule el IMC del paciente',
      applicableFor: {
        consultationType: ['external', 'routine'],
      },
    },
    
    // Examen Físico
    {
      id: 'physical_exam_basic',
      name: 'Examen Físico Básico',
      description: 'Examen físico de al menos 3 sistemas',
      required: true,
      category: 'clinical',
      priority: 'high',
      validator: (data) => {
        const exam = data.physicalExam;
        return Boolean(exam && Object.keys(exam).length >= 3);
      },
      suggestion: 'Documente examen de al menos cabeza/cuello, tórax y abdomen',
    },
    {
      id: 'cardiovascular_exam',
      name: 'Examen Cardiovascular',
      description: 'Examen cardiovascular en pacientes de riesgo',
      required: false,
      category: 'clinical',
      priority: 'medium',
      validator: (data) => {
        const exam = data.physicalExam;
        return Boolean(exam && (exam.cardiovascular || exam.heart || exam.torax));
      },
      suggestion: 'Incluya auscultación cardíaca y evaluación de extremidades',
      applicableFor: {
        ageRange: [40, 120],
        riskLevel: ['medium', 'high', 'critical'],
      },
    },
    
    // Diagnósticos
    {
      id: 'primary_diagnosis',
      name: 'Diagnóstico Principal',
      description: 'Al menos un diagnóstico principal documentado',
      required: true,
      category: 'clinical',
      priority: 'critical',
      validator: (data) => Boolean(data.diagnoses && data.diagnoses.length > 0 && data.diagnoses[0].description),
      suggestion: 'Registre al menos un diagnóstico principal con código CIE-10',
    },
    {
      id: 'diagnosis_coding',
      name: 'Codificación CIE-10',
      description: 'Diagnósticos con códigos CIE-10 válidos',
      required: true,
      category: 'documentation',
      priority: 'high',
      validator: (data) => {
        if (!data.diagnoses || data.diagnoses.length === 0) return false;
        return data.diagnoses.every(diag => diag.cie10 && diag.cie10.length >= 3);
      },
      suggestion: 'Asigne códigos CIE-10 válidos a todos los diagnósticos',
    },
    {
      id: 'diagnosis_classification',
      name: 'Clasificación de Diagnósticos',
      description: 'Diagnósticos clasificados como presuntivos o definitivos',
      required: true,
      category: 'clinical',
      priority: 'medium',
      validator: (data) => {
        if (!data.diagnoses || data.diagnoses.length === 0) return false;
        return data.diagnoses.every(diag => diag.presumptive || diag.definitive);
      },
      suggestion: 'Clasifique cada diagnóstico como presuntivo o definitivo',
    },
    
    // Plan de Tratamiento
    {
      id: 'treatment_plan',
      name: 'Plan de Tratamiento',
      description: 'Plan terapéutico completo y específico',
      required: true,
      category: 'clinical',
      priority: 'high',
      validator: (data) => Boolean(data.treatmentPlan && data.treatmentPlan.length >= 20),
      suggestion: 'Incluya medicamentos, dosis, duración y recomendaciones específicas',
    },
    
    // Antecedentes (pacientes de riesgo)
    {
      id: 'medical_history',
      name: 'Antecedentes Médicos',
      description: 'Antecedentes personales documentados',
      required: false,
      category: 'clinical',
      priority: 'medium',
      validator: (data) => Boolean(data.personalHistory && data.personalHistory.length > 0),
      suggestion: 'Documente antecedentes médicos relevantes del paciente',
      applicableFor: {
        ageRange: [18, 120],
        riskLevel: ['medium', 'high', 'critical'],
      },
    },
    {
      id: 'allergies_check',
      name: 'Verificación de Alergias',
      description: 'Alergias conocidas verificadas y documentadas',
      required: false,
      category: 'safety',
      priority: 'high',
      validator: (data) => Boolean(data.allergies !== undefined),
      suggestion: 'Confirme si el paciente tiene alergias conocidas, especialmente medicamentosas',
      applicableFor: {
        consultationType: ['external', 'internal'],
      },
    },
    {
      id: 'current_medications',
      name: 'Medicación Actual',
      description: 'Medicamentos actuales del paciente',
      required: false,
      category: 'safety',
      priority: 'medium',
      validator: (data) => Boolean(data.medications !== undefined),
      suggestion: 'Registre todos los medicamentos que el paciente toma actualmente',
      applicableFor: {
        ageRange: [18, 120],
      },
    },
    
    // Protocolos de Emergencia
    {
      id: 'emergency_assessment',
      name: 'Evaluación de Emergencia',
      description: 'Evaluación rápida ABC en casos de emergencia',
      required: true,
      category: 'safety',
      priority: 'critical',
      validator: (data) => Boolean(data.physicalExam && Object.keys(data.physicalExam).length >= 2),
      suggestion: 'Evalúe vía aérea, respiración y circulación inmediatamente',
      applicableFor: {
        consultationType: ['emergency'],
      },
    },
    
    // Protocolos por Edad
    {
      id: 'pediatric_growth',
      name: 'Evaluación de Crecimiento',
      description: 'Percentiles de peso y talla en pediatría',
      required: false,
      category: 'clinical',
      priority: 'medium',
      validator: (data) => {
        const vs = data.vitalSigns;
        return Boolean(vs && vs.weight && vs.height);
      },
      suggestion: 'Registre percentiles de crecimiento según edad pediátrica',
      applicableFor: {
        ageRange: [0, 18],
      },
    },
    {
      id: 'geriatric_assessment',
      name: 'Evaluación Geriátrica',
      description: 'Consideraciones especiales en pacientes geriátricos',
      required: false,
      category: 'clinical',
      priority: 'medium',
      validator: (data) => Boolean(data.personalHistory && data.medications),
      suggestion: 'Incluya evaluación funcional, cognitiva y revisión de medicamentos',
      applicableFor: {
        ageRange: [65, 120],
      },
    },
  ];

  useEffect(() => {
    checkProtocolCompliance();
  }, [formData, consultationType, patientAge, patientRiskLevel]); // eslint-disable-line react-hooks/exhaustive-deps

  const checkProtocolCompliance = () => {
    const results: ProtocolResult[] = [];
    
    medicalProtocols.forEach(protocol => {
      // Verificar si el protocolo aplica para este caso
      let isApplicable = true;
      
      if (protocol.applicableFor) {
        const { consultationType: applicableTypes, ageRange, riskLevel } = protocol.applicableFor;
        
        if (applicableTypes && !applicableTypes.includes(consultationType)) {
          isApplicable = false;
        }
        
        if (ageRange && patientAge > 0 && (patientAge < ageRange[0] || patientAge > ageRange[1])) {
          isApplicable = false;
        }
        
        if (riskLevel && !riskLevel.includes(patientRiskLevel)) {
          isApplicable = false;
        }
      }
      
      if (!isApplicable) {
        results.push({
          item: protocol,
          status: 'not_applicable',
        });
        return;
      }
      
      // Validar el protocolo
      const isComplete = protocol.validator(formData);
      
      results.push({
        item: protocol,
        status: isComplete ? 'complete' : 'incomplete',
        message: isComplete ? undefined : protocol.suggestion,
      });
    });
    
    setProtocolResults(results);
    
    // Calcular puntuación de cumplimiento
    const applicableProtocols = results.filter(r => r.status !== 'not_applicable');
    const requiredProtocols = applicableProtocols.filter(r => r.item.required);
    const completedRequiredProtocols = requiredProtocols.filter(r => r.status === 'complete');
    
    let score = 0;
    if (applicableProtocols.length > 0) {
      // 70% por protocolos requeridos, 30% por opcionales
      const requiredScore = requiredProtocols.length > 0 ? 
        (completedRequiredProtocols.length / requiredProtocols.length) * 0.7 : 0.7;
      
      const optionalProtocols = applicableProtocols.filter(r => !r.item.required);
      const completedOptionalProtocols = optionalProtocols.filter(r => r.status === 'complete');
      const optionalScore = optionalProtocols.length > 0 ? 
        (completedOptionalProtocols.length / optionalProtocols.length) * 0.3 : 0.3;
      
      score = Math.round((requiredScore + optionalScore) * 100);
    }
    
    setComplianceScore(score);
    
    // Notificar cambios
    const missingRequired = requiredProtocols
      .filter(r => r.status === 'incomplete')
      .map(r => r.item.name);
    
    onProtocolChange?.(score, missingRequired);
  };

  const getStatusIcon = (status: 'complete' | 'incomplete' | 'not_applicable') => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'incomplete':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Info className="w-4 h-4 text-gray-400" />;
    }
  };

  const getPriorityIcon = (priority: 'low' | 'medium' | 'high' | 'critical') => {
    switch (priority) {
      case 'critical':
        return <Zap className="w-3 h-3 text-red-600" />;
      case 'high':
        return <AlertTriangle className="w-3 h-3 text-orange-500" />;
      case 'medium':
        return <Clock className="w-3 h-3 text-yellow-500" />;
      default:
        return <Info className="w-3 h-3 text-gray-400" />;
    }
  };

  const getComplianceColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getComplianceStatus = (score: number) => {
    if (score >= 90) return 'Excelente';
    if (score >= 70) return 'Bueno';
    if (score >= 50) return 'Regular';
    return 'Deficiente';
  };

  const applicableResults = protocolResults.filter(r => r.status !== 'not_applicable');
  const completedCount = protocolResults.filter(r => r.status === 'complete').length;
  const incompleteCount = protocolResults.filter(r => r.status === 'incomplete').length;
  const criticalIncomplete = protocolResults.filter(
    r => r.status === 'incomplete' && r.item.priority === 'critical'
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-blue-600" />
            <div>
              <CardTitle className="text-lg">Protocolos Médicos</CardTitle>
              <p className="text-sm text-gray-600">
                Cumplimiento de estándares clínicos y documentales
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <div className={`text-2xl font-bold ${getComplianceColor(complianceScore)}`}>
              {complianceScore}%
            </div>
            <div className="text-sm text-gray-600">
              {getComplianceStatus(complianceScore)}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progreso de Cumplimiento */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Protocolos Completados</span>
            <span>{completedCount} de {applicableResults.length}</span>
          </div>
          <Progress value={complianceScore} className="h-3" />
        </div>

        {/* Alertas Críticas */}
        {criticalIncomplete.length > 0 && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <span className="font-medium">
                {criticalIncomplete.length} protocolo{criticalIncomplete.length === 1 ? '' : 's'} crítico{criticalIncomplete.length === 1 ? '' : 's'} incompleto{criticalIncomplete.length === 1 ? '' : 's'}
              </span>
              <div className="mt-1 space-y-1">
                {criticalIncomplete.map((result, index) => (
                  <div key={index} className="text-sm">
                    • {result.item.name}
                  </div>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Estadísticas Rápidas */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="text-lg font-bold text-green-600">{completedCount}</div>
            <div className="text-xs text-green-700">Completados</div>
          </div>
          
          <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
            <div className="text-lg font-bold text-red-600">{incompleteCount}</div>
            <div className="text-xs text-red-700">Pendientes</div>
          </div>
          
          <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-lg font-bold text-blue-600">{applicableResults.length}</div>
            <div className="text-xs text-blue-700">Aplicables</div>
          </div>
        </div>

        {/* Botón para mostrar detalles */}
        <Button
          variant="outline"
          onClick={() => setShowDetails(!showDetails)}
          className="w-full"
        >
          <FileCheck className="w-4 h-4 mr-2" />
          {showDetails ? 'Ocultar Detalles' : 'Ver Detalles de Protocolos'}
        </Button>

        {/* Lista Detallada de Protocolos */}
        {showDetails && (
          <div className="space-y-3">
            <Separator />
            
            {['critical', 'high', 'medium', 'low'].map(priority => {
              const protocolsOfPriority = protocolResults.filter(
                r => r.item.priority === priority && r.status !== 'not_applicable'
              );
              
              if (protocolsOfPriority.length === 0) return null;
              
              return (
                <div key={priority}>
                  <div className="flex items-center gap-2 mb-2">
                    {getPriorityIcon(priority as 'low' | 'medium' | 'high' | 'critical')}
                    <span className="font-medium text-sm capitalize">
                      Prioridad {priority === 'critical' ? 'Crítica' : 
                                 priority === 'high' ? 'Alta' :
                                 priority === 'medium' ? 'Media' : 'Baja'}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {protocolsOfPriority.length}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    {protocolsOfPriority.map((result, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-3 bg-white border rounded-lg"
                      >
                        {getStatusIcon(result.status)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{result.item.name}</span>
                            {result.item.required && (
                              <Badge variant="secondary" className="text-xs">
                                Requerido
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 mt-1">
                            {result.item.description}
                          </p>
                          {result.message && (
                            <p className="text-xs text-blue-600 mt-1 italic">
                              💡 {result.message}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
