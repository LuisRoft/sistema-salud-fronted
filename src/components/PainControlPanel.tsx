"use client";

import { useState } from "react";
import {
  PartWithPain,
  PAIN_LEVEL_COLORS,
  getPainLevelName,
  isValidPainLevel,
} from "@/utils/biodigital-config";

interface PainControlPanelProps {
  selectedPartsWithPain: PartWithPain[];
  onUpdatePainLevel: (partId: string, painLevel: number) => void;
  onRemovePart: (partId: string) => void;
  onSendToBackend: () => void;
}

const PainLevelButton = ({
  level,
  isSelected,
  onClick,
}: {
  level: number;
  isSelected: boolean;
  onClick: () => void;
}) => {
  const color = PAIN_LEVEL_COLORS[level as keyof typeof PAIN_LEVEL_COLORS];
  const rgb = `rgb(${Math.round(color[0] * 255)}, ${Math.round(
    color[1] * 255
  )}, ${Math.round(color[2] * 255)})`;

  return (
    <button
      onClick={onClick}
      className={`
        w-8 h-8 rounded-full border-2 transition-all duration-200
        ${
          isSelected
            ? "border-gray-800 scale-110 shadow-lg"
            : "border-gray-400 hover:border-gray-600 hover:scale-105"
        }
      `}
      style={{ backgroundColor: rgb }}
      title={`Nivel ${level}: ${getPainLevelName(level)}`}
    >
      <span className="text-xs font-bold text-white drop-shadow">{level}</span>
    </button>
  );
};

export function PainControlPanel({
  selectedPartsWithPain,
  onUpdatePainLevel,
  onRemovePart,
  onSendToBackend,
}: PainControlPanelProps) {
  const [selectedPartId, setSelectedPartId] = useState<string>("");

  const handleSendData = () => {
    const dataToSend = selectedPartsWithPain.map((part) => ({
      id: part.id,
      painLevel: part.painLevel,
      painLevelName: getPainLevelName(part.painLevel),
      color: part.tintColor,
    }));

    console.log("📊 Datos de dolor para enviar al backend:", {
      timestamp: new Date().toISOString(),
      totalParts: dataToSend.length,
      data: dataToSend,
      summary: {
        sinDolor: dataToSend.filter((p) => p.painLevel === 1).length,
        dolorLeve: dataToSend.filter((p) => p.painLevel === 2).length,
        dolorModerado: dataToSend.filter((p) => p.painLevel === 3).length,
        dolorFuerte: dataToSend.filter((p) => p.painLevel === 4).length,
        dolorSevero: dataToSend.filter((p) => p.painLevel === 5).length,
      },
    });

    onSendToBackend();
  };

  const handleAddCustomPart = () => {
    if (
      selectedPartId.trim() &&
      !selectedPartsWithPain.find((p) => p.id === selectedPartId)
    ) {
      onUpdatePainLevel(selectedPartId.trim(), 1);
      setSelectedPartId("");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        🏥 Control de Niveles de Dolor
      </h3>

      {/* Leyenda de colores */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-2">
          Niveles de dolor:
        </h4>
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5].map((level) => (
            <div key={level} className="flex items-center gap-1">
              <div
                className="w-4 h-4 rounded-full border border-gray-300"
                style={{
                  backgroundColor: `rgb(${Math.round(
                    PAIN_LEVEL_COLORS[
                      level as keyof typeof PAIN_LEVEL_COLORS
                    ][0] * 255
                  )}, ${Math.round(
                    PAIN_LEVEL_COLORS[
                      level as keyof typeof PAIN_LEVEL_COLORS
                    ][1] * 255
                  )}, ${Math.round(
                    PAIN_LEVEL_COLORS[
                      level as keyof typeof PAIN_LEVEL_COLORS
                    ][2] * 255
                  )})`,
                }}
              />
              <span className="text-xs text-gray-600">{level}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Agregar parte manual */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-2">
          Agregar parte manualmente:
        </h4>
        <div className="flex gap-2">
          <input
            type="text"
            value={selectedPartId}
            onChange={(e) => setSelectedPartId(e.target.value)}
            placeholder="ID de la parte anatómica"
            className="flex-1 px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleAddCustomPart}
            disabled={!selectedPartId.trim()}
            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Agregar
          </button>
        </div>
      </div>

      {/* Lista de partes seleccionadas */}
      <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
        {selectedPartsWithPain.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">
            No hay partes seleccionadas. Haz clic en el modelo 3D para
            seleccionar partes.
          </p>
        ) : (
          selectedPartsWithPain.map((part) => (
            <div
              key={part.id}
              className="border border-gray-200 rounded-lg p-3"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 truncate flex-1">
                  {part.id}
                </span>
                <button
                  onClick={() => onRemovePart(part.id)}
                  className="text-red-500 hover:text-red-700 text-sm ml-2"
                  title="Eliminar parte"
                >
                  ✕
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">
                  {getPainLevelName(part.painLevel)}
                </span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <PainLevelButton
                      key={level}
                      level={level}
                      isSelected={part.painLevel === level}
                      onClick={() => onUpdatePainLevel(part.id, level)}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Botón de envío */}
      <button
        onClick={handleSendData}
        disabled={selectedPartsWithPain.length === 0}
        className={`
          w-full py-3 px-4 rounded-lg font-medium transition-all duration-200
          ${
            selectedPartsWithPain.length > 0
              ? "bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }
        `}
      >
        📤 Enviar Datos al Backend
        {selectedPartsWithPain.length > 0 && (
          <span className="ml-1">({selectedPartsWithPain.length} partes)</span>
        )}
      </button>

      {/* Resumen estadístico */}
      {selectedPartsWithPain.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-medium text-blue-800 mb-2">
            📊 Resumen:
          </h4>
          <div className="text-xs text-blue-700 space-y-1">
            <div>Total de partes: {selectedPartsWithPain.length}</div>
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5].map((level) => {
                const count = selectedPartsWithPain.filter(
                  (p) => p.painLevel === level
                ).length;
                return count > 0 ? (
                  <span key={level} className="bg-blue-100 px-2 py-1 rounded">
                    Nivel {level}: {count}
                  </span>
                ) : null;
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
