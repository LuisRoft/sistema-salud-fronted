"use client";

import { useEffect } from "react";
import Script from "next/script";
import {
  PREDEFINED_PARTS,
  BIODIGITAL_SCRIPT_CONFIG,
} from "@/utils/biodigital-config";
import { useBioDigital } from "@/hooks/useBioDigital";
import { PainControlPanel } from "./PainControlPanel";

export function BioDigitalEmbedded() {
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
    removeSelectedPart,
  } = useBioDigital([
    PREDEFINED_PARTS.FRONTAL_BONE,
    PREDEFINED_PARTS.SUPERIOR_FRONTAL_GYRUS,
  ]);

  useEffect(() => {
    fetchHumanData();
  }, [fetchHumanData]);

  const handleSendToBackend = () => {
    // Esta función se expandirá más tarde para el envío real
    console.log("🚀 Preparando envío al backend...");
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

          <iframe
            src={data?.myhuman[0].content_url}
            width="100%"
            height="100%"
            className="border-0 w-full h-full"
            id="biodigital"
            title="Modelo anatómico BioDigital"
            loading="lazy"
          />
        </div>

        {/* Instrucciones */}
        <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-muted/30 border border-border/50 rounded-lg">
          <div className="flex items-center gap-2 mb-2 sm:mb-3">
            <span className="text-sm sm:text-base">📖</span>
            <h4 className="text-xs sm:text-sm font-semibold text-foreground">
              Cómo usar:
            </h4>
          </div>
          <ul className="text-xs sm:text-sm text-muted-foreground space-y-1 sm:space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5 flex-shrink-0">•</span>
              <span>Haz clic en partes del modelo 3D para seleccionarlas</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5 flex-shrink-0">•</span>
              <span>Usa los botones de colores para asignar niveles de dolor (1-5)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5 flex-shrink-0">•</span>
              <span>Las partes se colorearán según el nivel de dolor seleccionado</span>
            </li>
            <li className="flex items-start gap-2 xl:hidden">
              <span className="text-primary mt-0.5 flex-shrink-0">•</span>
              <span>Panel de control disponible debajo del modelo</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5 flex-shrink-0">•</span>
              <span>Usa el botón "✕" para quitar solo el color</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5 flex-shrink-0">•</span>
              <span>Haz clic en "Enviar Datos" para procesar información</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
