"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import {
  PREDEFINED_PARTS,
  BIODIGITAL_SCRIPT_CONFIG,
  getPainLevelName,
} from "@/utils/biodigital-config";
import { useBioDigital } from "@/hooks/useBioDigital";
import { PainControlPanel } from "./PainControlPanel";
import { set } from "date-fns";

export function BioDigitalEmbedded({ setDataModel }: { setDataModel: (data: any) => void }) {
  const [embedUrl, setEmbedUrl] = useState<string>('');
  const [useProxy, setUseProxy] = useState<boolean>(false);
  const [iframeError, setIframeError] = useState<boolean>(false);
  const [retryCount, setRetryCount] = useState<number>(0);
  const [forceProxy, setForceProxy] = useState<boolean>(false);
  
  const {
    data,
    isLoading,
    error,
    scriptLoaded,
    selectedPartsWithPain,
    fetchHumanData,
    handleScriptLoad,
    handleScriptError,
    updatePartPainLevel,
    updatePartNotes,
    removeSelectedPart,
  } = useBioDigital([
    PREDEFINED_PARTS.FRONTAL_BONE,
    PREDEFINED_PARTS.SUPERIOR_FRONTAL_GYRUS,
  ], setDataModel);

  useEffect(() => {
    fetchHumanData();
    
    // En producción, usar proxy automáticamente para evitar problemas de CORS y CSP
    if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined') {
      console.log('🏭 Entorno de producción detectado, activando proxy automáticamente');
      setForceProxy(true);
      setUseProxy(true);
    }
  }, [fetchHumanData]);

  // Construir URL del embed - intentar primero directamente, luego con proxy si falla
  useEffect(() => {
    if (data?.myhuman?.[0]?.content_url && typeof window !== 'undefined') {
      const originalUrl = data.myhuman[0].content_url;
      
      console.log('🔗 URL original de BioDigital:', originalUrl);
      console.log('🌍 Entorno:', process.env.NODE_ENV);
      console.log('⏰ Timestamp construcción URL:', new Date().toISOString());
      console.log('🌐 Window location:', window.location.href);
      console.log('🔄 Usando proxy:', useProxy);
      
      if (useProxy || forceProxy) {
        // Usar proxy como respaldo - siempre usar la URL actual del frontend
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
        const proxyUrl = `${baseUrl}/api/biodigital-proxy?url=${encodeURIComponent(originalUrl)}`;
        console.log('🔄 Usando proxy:', proxyUrl);
        console.log('🌐 Base URL detectada:', baseUrl);
        console.log('🏭 Forzado por producción:', forceProxy);
        setEmbedUrl(proxyUrl);
      } else {
        // Intentar usar la URL original directamente (solo en desarrollo)
        console.log('🎯 Intentando carga directa (desarrollo)');
        setEmbedUrl(originalUrl);
      }
    }
  }, [data, useProxy, forceProxy]);
  
  // Manejar errores del iframe y cambiar a proxy automáticamente
  const handleIframeError = () => {
    console.log('❌ Error en iframe detectado');
    console.log('⏰ Timestamp error:', new Date().toISOString());
    console.log('🌍 Entorno:', process.env.NODE_ENV);
    console.log('🔄 useProxy actual:', useProxy);
    console.log('❌ iframeError actual:', iframeError);
    console.log('🔢 Retry count:', retryCount);
    
    if (!useProxy && !iframeError && retryCount < 2) {
      console.log('🔄 Cambiando a proxy debido a error en carga directa...');
      setIframeError(true);
      setUseProxy(true);
      setRetryCount(prev => prev + 1);
    } else if (retryCount >= 2) {
      console.log('⚠️ Máximo número de reintentos alcanzado');
      setError('Error persistente cargando el modelo 3D. Por favor, recarga la página.');
    } else {
      console.log('⚠️ Ya se intentó con proxy o ya hay error registrado');
    }
  };

  const handleSendToBackend = () => {
   console.log("🚀 Enviando datos al backend:", selectedPartsWithPain);
  };

  // Mostrar estados de carga y error
  if (error) {
    return (
      <div className="flex items-center justify-center h-96 bg-red-50 border border-red-200 rounded-lg">
        <div className="text-center">
          <p className="text-red-600 font-semibold mb-2">Error</p>
          <p className="text-red-500 text-sm">{error}</p>
          <button
            onClick={fetchHumanData}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando modelo anatómico...</p>
        </div>
      </div>
    );
  }

  if (!data?.myhuman?.[0]?.content_url) {
    return (
      <div className="flex items-center justify-center h-96 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="text-center">
          <p className="text-yellow-600 font-semibold mb-2">
            Datos no disponibles
          </p>
          <p className="text-yellow-500 text-sm">
            No se pudo obtener la URL del modelo
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col xl:flex-row gap-3 sm:gap-4 lg:gap-6 p-3 sm:p-4 lg:p-6 min-h-screen bg-background">
      {/* Panel de Control */}
      <div className="w-full xl:w-80 xl:flex-shrink-0 order-2 xl:order-1">
        <PainControlPanel
          selectedPartsWithPain={selectedPartsWithPain}
          onUpdatePainLevel={updatePartPainLevel}
          onUpdatePartNotes={updatePartNotes}
          onRemovePart={removeSelectedPart}
          onSendToBackend={handleSendToBackend}
        />
      </div>

      {/* Visor 3D */}
      <div className="flex-1 order-1 xl:order-2">
        <Script
          src={BIODIGITAL_SCRIPT_CONFIG.src}
          strategy={BIODIGITAL_SCRIPT_CONFIG.strategy}
          onLoad={handleScriptLoad}
          onError={handleScriptError}
        />

        <div className="relative bg-background border border-border rounded-lg shadow-lg overflow-hidden h-[400px] sm:h-[500px] md:h-[600px] lg:h-[700px] xl:h-[800px]">
          {!scriptLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/90 backdrop-blur-sm z-10">
              <div className="text-center">
                <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-muted-foreground text-xs sm:text-sm">
                  Inicializando visor 3D...
                </p>
              </div>
            </div>
          )}

          {embedUrl ? (
            <iframe
              src={embedUrl}
              width="100%"
              height="100%"
              className="border-0 w-full h-full"
              id="biodigital"
              title="Modelo anatómico BioDigital"
              loading="eager"
              allow="fullscreen; scripts-src 'self' 'unsafe-inline' 'unsafe-eval' https://human.biodigital.com"
              referrerPolicy="no-referrer-when-downgrade"
              onError={handleIframeError}
              onLoad={() => {
                console.log('✅ Iframe cargado exitosamente');
                console.log('⏰ Timestamp carga iframe:', new Date().toISOString());
                console.log('🌍 Entorno:', process.env.NODE_ENV);
                console.log('🔗 URL cargada:', embedUrl);
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-100">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-muted-foreground text-sm">Preparando modelo 3D...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
