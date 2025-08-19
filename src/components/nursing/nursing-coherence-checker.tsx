import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';

interface CoherenceCheckerProps {
  formData: {
    nanda_dominio?: string;
    nanda_clase?: string;
    nanda_etiqueta_diagnostica?: string;
    noc_dominio?: string;
    noc_clase?: string;
    nic_clase?: string[];
    noc_indicador?: string[];
    noc_rango?: string[];
    noc_diana_inicial?: string[];
    noc_diana_esperada?: string[];
  };
  onCoherenceChange?: (isCoherent: boolean, issues: string[]) => void;
}

interface CoherenceIssue {
  type: 'error' | 'warning' | 'info';
  message: string;
  field?: string;
  suggestion?: string;
}

export default function NursingCoherenceChecker({ 
  formData, 
  onCoherenceChange 
}: CoherenceCheckerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [issues, setIssues] = useState<CoherenceIssue[]>([]);
  const [isCoherent, setIsCoherent] = useState<boolean | null>(null);

  useEffect(() => {
    const checkCoherence = () => {
      const newIssues: CoherenceIssue[] = [];
      
      // Verificar que NANDA esté completo
      if (!formData.nanda_dominio || !formData.nanda_clase || !formData.nanda_etiqueta_diagnostica) {
        newIssues.push({
          type: 'error',
          message: 'Sección NANDA incompleta',
          field: 'nanda',
          suggestion: 'Complete todos los campos de diagnóstico NANDA antes de continuar'
        });
      }

      // Verificar que NOC esté completo
      if (!formData.noc_dominio || !formData.noc_clase) {
        newIssues.push({
          type: 'error',
          message: 'Sección NOC incompleta',
          field: 'noc',
          suggestion: 'Complete todos los campos de resultados NOC'
        });
      }

      // Verificar que NIC esté completo
      if (!formData.nic_clase || formData.nic_clase.length === 0) {
        newIssues.push({
          type: 'error',
          message: 'Sección NIC incompleta',
          field: 'nic',
          suggestion: 'Agregue al menos una intervención NIC'
        });
      }

      // Verificar coherencia entre NANDA y NOC
      if (formData.nanda_dominio && formData.noc_dominio) {
        // Aquí se implementarían reglas de negocio más complejas
        // Por ahora, solo verificamos que ambos estén presentes
        if (formData.nanda_dominio !== formData.noc_dominio) {
          newIssues.push({
            type: 'warning',
            message: 'Posible inconsistencia entre dominios NANDA y NOC',
            field: 'coherence',
            suggestion: 'Verifique que el dominio del resultado NOC sea coherente con el diagnóstico NANDA'
          });
        }
      }

      // Verificar coherencia de arrays relacionados
      if (formData.noc_indicador && formData.noc_rango && formData.noc_diana_inicial && formData.noc_diana_esperada) {
        const indicadoresCount = formData.noc_indicador.length;
        const rangosCount = formData.noc_rango.length;
        const dianasInicialesCount = formData.noc_diana_inicial.length;
        const dianasEsperadasCount = formData.noc_diana_esperada.length;

        if (indicadoresCount !== rangosCount || 
            indicadoresCount !== dianasInicialesCount || 
            indicadoresCount !== dianasEsperadasCount) {
          newIssues.push({
            type: 'error',
            message: 'Inconsistencia en el número de elementos de arrays relacionados',
            field: 'arrays',
            suggestion: 'Todos los arrays relacionados deben tener la misma cantidad de elementos'
          });
        }

        // Verificar que las dianas esperadas sean mayores o iguales a las iniciales
        for (let i = 0; i < Math.min(dianasInicialesCount, dianasEsperadasCount); i++) {
          const inicial = parseInt(formData.noc_diana_inicial[i] || '0');
          const esperada = parseInt(formData.noc_diana_esperada[i] || '0');
          
          if (esperada < inicial) {
            newIssues.push({
              type: 'error',
              message: `Diana esperada ${esperada} es menor que la inicial ${inicial} en el elemento ${i + 1}`,
              field: 'dianas',
              suggestion: 'Las dianas esperadas deben ser mayores o iguales a las iniciales'
            });
          }
        }
      }

      // Verificar que las dianas estén en el rango correcto (1-5)
      if (formData.noc_diana_inicial) {
        formData.noc_diana_inicial.forEach((diana, index) => {
          const valor = parseInt(diana);
          if (isNaN(valor) || valor < 1 || valor > 5) {
            newIssues.push({
              type: 'error',
              message: `Diana inicial ${diana} en el elemento ${index + 1} no es válida`,
              field: 'dianas',
              suggestion: 'Las dianas deben ser números del 1 al 5'
            });
          }
        });
      }

      if (formData.noc_diana_esperada) {
        formData.noc_diana_esperada.forEach((diana, index) => {
          const valor = parseInt(diana);
          if (isNaN(valor) || valor < 1 || valor > 5) {
            newIssues.push({
              type: 'error',
              message: `Diana esperada ${diana} en el elemento ${index + 1} no es válida`,
              field: 'dianas',
              suggestion: 'Las dianas deben ser números del 1 al 5'
            });
          }
        });
      }

      // Verificar que los rangos sean números
      if (formData.noc_rango) {
        formData.noc_rango.forEach((rango, index) => {
          if (rango && !/^\d+$/.test(rango)) {
            newIssues.push({
              type: 'error',
              message: `Rango ${rango} en el elemento ${index + 1} no es un número válido`,
              field: 'rangos',
              suggestion: 'Los rangos deben ser números enteros positivos'
            });
          }
        });
      }

      setIssues(newIssues);
      
      // Determinar si el formulario es coherente
      const hasErrors = newIssues.some(issue => issue.type === 'error');
      const isFormCoherent = !hasErrors;
      
      setIsCoherent(isFormCoherent);
      onCoherenceChange?.(isFormCoherent, newIssues.map(issue => issue.message));
    };

    checkCoherence();
  }, [formData, onCoherenceChange]);

  const getOverallStatus = () => {
    if (isCoherent === null) return { status: 'pending', icon: Info, color: 'text-gray-400', bgColor: 'bg-gray-50' };
    if (isCoherent) return { status: 'coherent', icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-50' };
    
    const hasErrors = issues.some(issue => issue.type === 'error');
    if (hasErrors) return { status: 'incoherent', icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-50' };
    return { status: 'warnings', icon: AlertTriangle, color: 'text-yellow-600', bgColor: 'bg-yellow-50' };
  };

  const overallStatus = getOverallStatus();
  const StatusIcon = overallStatus.icon;

  const getStatusText = () => {
    switch (overallStatus.status) {
      case 'pending': return 'Verificando coherencia...';
      case 'coherent': return 'Formulario coherente';
      case 'incoherent': return 'Formulario con inconsistencias';
      case 'warnings': return 'Formulario con advertencias';
      default: return 'Estado desconocido';
    }
  };

  const getStatusDescription = () => {
    switch (overallStatus.status) {
      case 'pending': return 'Analizando la coherencia del formulario...';
      case 'coherent': return 'Todas las secciones están correctamente relacionadas';
      case 'incoherent': return 'Se encontraron inconsistencias que deben corregirse';
      case 'warnings': return 'El formulario es coherente pero tiene advertencias';
      default: return '';
    }
  };

  const errorCount = issues.filter(issue => issue.type === 'error').length;
  const warningCount = issues.filter(issue => issue.type === 'warning').length;
  const infoCount = issues.filter(issue => issue.type === 'info').length;

  return (
    <div className="space-y-4">
      {/* Estado general de coherencia */}
      <div className={`p-4 rounded-lg border ${overallStatus.bgColor} ${
        overallStatus.status === 'coherent' ? 'dark:bg-green-900 dark:border-green-700' :
        overallStatus.status === 'warnings' ? 'dark:bg-yellow-900 dark:border-yellow-700' :
        overallStatus.status === 'incoherent' ? 'dark:bg-red-900 dark:border-red-700' :
        'dark:bg-gray-800 dark:border-gray-600'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <StatusIcon className={`h-6 w-6 ${overallStatus.color}`} />
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                Verificación de Coherencia
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {getStatusDescription()}
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {getStatusText()}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              {issues.length > 0 && `${issues.length} problemas encontrados`}
            </div>
          </div>
        </div>
      </div>

      {/* Resumen de problemas */}
      {issues.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {errorCount > 0 && (
            <div className="p-3 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center space-x-2">
                <XCircle className="h-5 w-5 text-red-500" />
                <span className="font-medium text-red-700 dark:text-red-300">{errorCount}</span>
              </div>
              <div className="text-sm text-red-600 dark:text-red-400 mt-1">Errores críticos</div>
            </div>
          )}
          
          {warningCount > 0 && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                <span className="font-medium text-yellow-700 dark:text-yellow-300">{warningCount}</span>
              </div>
              <div className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">Advertencias</div>
            </div>
          )}
          
          {infoCount > 0 && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center space-x-2">
                <Info className="h-5 w-5 text-blue-500" />
                <span className="font-medium text-blue-700 dark:text-blue-300">{infoCount}</span>
              </div>
              <div className="text-sm text-blue-600 dark:text-blue-400 mt-1">Información</div>
            </div>
          )}
        </div>
      )}

      {/* Detalles de problemas */}
      {issues.length > 0 && (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <Button 
              variant="outline" 
              className="w-full border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              {isOpen ? 'Ocultar detalles' : 'Ver detalles de coherencia'}
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="space-y-3 mt-3">
            {issues.map((issue, index) => (
              <div key={index} className={`p-4 rounded-lg border ${
                issue.type === 'error' ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900' :
                issue.type === 'warning' ? 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900' :
                'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900'
              }`}>
                <div className="flex items-center space-x-2 mb-2">
                  {issue.type === 'error' && <XCircle className="h-4 w-4 text-red-500" />}
                  {issue.type === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                  {issue.type === 'info' && <Info className="h-4 w-4 text-blue-500" />}
                  <div className={`font-medium ${
                    issue.type === 'error' ? 'text-red-800 dark:text-red-200' :
                    issue.type === 'warning' ? 'text-yellow-800 dark:text-yellow-200' :
                    'text-blue-800 dark:text-blue-200'
                  }`}>{issue.message}</div>
                </div>
                {issue.field && (
                  <Badge variant="outline" className="text-xs mb-2">
                    {issue.field.toUpperCase()}
                  </Badge>
                )}
                {issue.suggestion && (
                  <div className={`text-sm mt-1 ${
                    issue.type === 'error' ? 'text-red-600 dark:text-red-300' :
                    issue.type === 'warning' ? 'text-yellow-600 dark:text-yellow-300' :
                    'text-blue-600 dark:text-blue-300'
                  }`}>
                    💡 {issue.suggestion}
                  </div>
                )}
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Sin problemas */}
      {issues.length === 0 && isCoherent && (
        <div className="p-4 border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900 rounded-lg">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <div className="text-green-800 dark:text-green-200">
              ¡Excelente! El formulario es completamente coherente. Todas las secciones están correctamente relacionadas.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
