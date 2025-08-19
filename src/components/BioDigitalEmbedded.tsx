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
    <div className="flex flex-col lg:flex-row gap-6 p-6 min-h-screen bg-gray-50">
      {/* Panel de Control */}
      <div className="lg:w-1/3">
        <PainControlPanel
          selectedPartsWithPain={selectedPartsWithPain}
          onUpdatePainLevel={updatePartPainLevel}
          onRemovePart={removeSelectedPart}
          onSendToBackend={handleSendToBackend}
        />
      </div>

      {/* Visor 3D */}
      <div className="lg:w-2/3">
        <Script
          src={BIODIGITAL_SCRIPT_CONFIG.src}
          strategy={BIODIGITAL_SCRIPT_CONFIG.strategy}
          onLoad={handleScriptLoad}
          onError={handleScriptError}
        />

        <div className="relative bg-white rounded-lg shadow-lg overflow-hidden">
          {!scriptLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 bg-opacity-90 z-10">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-gray-600 text-sm">
                  Inicializando visor 3D...
                </p>
              </div>
            </div>
          )}

          <iframe
            src={data?.myhuman[0].content_url}
            width="100%"
            height="800px"
            className="border-0"
            id="biodigital"
            title="Modelo anatómico BioDigital"
            loading="lazy"
          />
        </div>

        {/* Instrucciones */}
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-semibold text-blue-800 mb-2">
            📖 Cómo usar:
          </h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Haz clic en partes del modelo 3D para seleccionarlas</li>
            <li>
              • Usa los botones de colores para asignar niveles de dolor (1-5)
            </li>
            <li>
              • Las partes se colorearán según el nivel de dolor seleccionado
            </li>
            <li>
              • Haz clic en "Enviar Datos" para ver la información en consola
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
