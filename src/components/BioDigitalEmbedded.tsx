"use client";

import { useEffect } from "react";
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
  }, [fetchHumanData]);

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
      </div>
    </div>
  );
}
