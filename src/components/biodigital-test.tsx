'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

interface TestResult {
  success: boolean;
  data?: any;
  error?: string;
  timestamp: string;
}

export default function BioDigitalTest() {
  const [result, setResult] = useState<TestResult | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const testBioDigitalAPI = async () => {
    setIsTesting(true);
    setResult(null);
    
    try {
      const response = await fetch('/api/get-human-data');
      const data = await response.json();
      
      setResult({
        success: response.ok,
        data: response.ok ? data : undefined,
        error: response.ok ? undefined : data.error || 'Error desconocido',
        timestamp: new Date().toLocaleTimeString()
      });
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Error de conexión',
        timestamp: new Date().toLocaleTimeString()
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Prueba de Integración BioDigital</h1>
        <p className="text-gray-600">
          Prueba la conexión con la API de BioDigital usando token dinámico del backend
        </p>
      </div>

      <div className="max-w-2xl mx-auto space-y-4">
        <Button 
          onClick={testBioDigitalAPI} 
          disabled={isTesting}
          className="w-full"
          size="lg"
        >
          {isTesting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Probando Conexión con BioDigital...
            </>
          ) : (
            'Probar API de BioDigital'
          )}
        </Button>
        
        {(result || isTesting) && (
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {isTesting && <Loader2 className="h-4 w-4 animate-spin" />}
                {!isTesting && result && (
                  result.success ? 
                    <CheckCircle className="h-4 w-4 text-green-500" /> : 
                    <XCircle className="h-4 w-4 text-red-500" />
                )}
                Resultado de la Prueba
              </CardTitle>
              <CardDescription>
                {result && `Última prueba: ${result.timestamp}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {result && (
                <Alert className={result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                  <AlertDescription>
                    {result.success ? (
                      <div>
                        <p className="font-medium text-green-800">✅ Conexión exitosa con BioDigital</p>
                        <p className="text-sm text-green-600 mt-1">
                          Datos obtenidos: {result.data?.myhuman?.length || 0} elementos
                        </p>
                        {result.data?.myhuman?.length > 0 && (
                          <p className="text-xs text-green-500 mt-2">
                            Primer modelo: {result.data.myhuman[0]?.id || 'N/A'}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div>
                        <p className="font-medium text-red-800">❌ Error en la conexión</p>
                        <p className="text-sm text-red-600 mt-1">{result.error}</p>
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg max-w-2xl mx-auto">
        <h3 className="font-medium text-blue-900 mb-2">ℹ️ Información sobre la integración:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li><strong>Token Dinámico:</strong> Se genera automáticamente desde el backend usando OAuth2</li>
          <li><strong>Scope:</strong> 'contentapi' para acceder a las colecciones de contenido</li>
          <li><strong>Endpoint:</strong> /services/v2/content/collections/myhuman</li>
        </ul>
      </div>
    </div>
  );
}