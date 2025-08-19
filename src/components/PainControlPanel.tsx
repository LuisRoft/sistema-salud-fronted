"use client";

import {
  PartWithPain,
  PAIN_LEVEL_COLORS,
  getPainLevelName,
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
        w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 transition-all duration-200 relative flex-shrink-0
        ${
          isSelected
            ? "border-foreground scale-110 shadow-lg ring-1 sm:ring-2 ring-primary/20"
            : "border-muted-foreground/30 hover:border-foreground/60 hover:scale-105"
        }
      `}
      style={{ backgroundColor: rgb }}
      title={`Nivel ${level}: ${getPainLevelName(level)}`}
    >
      <span className="text-xs font-bold text-white drop-shadow-lg">{level}</span>
      {isSelected && (
        <div className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-2 h-2 sm:w-3 sm:h-3 bg-primary rounded-full border border-background sm:border-2"></div>
      )}
    </button>
  );
};

export function PainControlPanel({
  selectedPartsWithPain,
  onUpdatePainLevel,
  onRemovePart,
  onSendToBackend,
}: PainControlPanelProps) {

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

  return (
    <div className="bg-background border border-border rounded-xl shadow-lg p-3 sm:p-4 lg:p-6 w-full backdrop-blur-sm">
      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
        <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg">
          <span className="text-lg sm:text-xl">🏥</span>
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-base sm:text-lg font-semibold text-foreground truncate">
            Control de Niveles de Dolor
          </h3>
          <p className="text-xs text-muted-foreground hidden sm:block">
            Selecciona y configura intensidad
          </p>
        </div>
      </div>

      {/* Leyenda de colores */}
      <div className="mb-4 sm:mb-6 bg-muted/30 rounded-lg p-3 sm:p-4 border border-border/50">
        <div className="flex items-center gap-2 mb-2 sm:mb-3">
          <span className="text-xs sm:text-sm">🎨</span>
          <h4 className="text-xs sm:text-sm font-medium text-foreground">
            Niveles de dolor:
          </h4>
        </div>
        <div className="grid grid-cols-5 gap-1 sm:gap-2">
          {[1, 2, 3, 4, 5].map((level) => (
            <div key={level} className="flex flex-col items-center gap-1">
              <div
                className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border border-border shadow-sm"
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
              <span className="text-xs text-muted-foreground font-medium">{level}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Lista de partes seleccionadas */}
      <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6 max-h-48 sm:max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
        {selectedPartsWithPain.length === 0 ? (
          <div className="text-center py-6 sm:py-8 px-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-muted/50 rounded-full flex items-center justify-center">
              <span className="text-xl sm:text-2xl opacity-50">🎯</span>
            </div>
            <p className="text-muted-foreground text-xs sm:text-sm">
              No hay partes seleccionadas
            </p>
            <p className="text-muted-foreground/70 text-xs mt-1">
              Haz clic en el modelo 3D para seleccionar partes
            </p>
          </div>
        ) : (
          selectedPartsWithPain.map((part) => (
            <div
              key={part.id}
              className="bg-card border border-border rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="flex-1 min-w-0">
                  <h5 className="text-xs sm:text-sm font-medium text-foreground truncate">
                    {part.id}
                  </h5>
                  <p className="text-xs text-muted-foreground mt-1">
                    {getPainLevelName(part.painLevel)}
                  </p>
                </div>
                <button
                  onClick={() => onRemovePart(part.id)}
                  className="ml-2 sm:ml-3 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-destructive/10 text-destructive hover:bg-destructive/20 hover:text-destructive/80 transition-colors flex items-center justify-center flex-shrink-0"
                  title="Quitar color (la parte permanece seleccionada)"
                >
                  <span className="text-xs sm:text-sm">✕</span>
                </button>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <span className="text-xs text-muted-foreground font-medium">
                  Intensidad:
                </span>
                <div className="flex gap-0.5 sm:gap-1 justify-center sm:justify-end">
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
      <div className="space-y-3 sm:space-y-4">
        <button
          onClick={handleSendData}
          disabled={selectedPartsWithPain.length === 0}
          className={`
            w-full py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-1.5 sm:gap-2
            ${
              selectedPartsWithPain.length > 0
                ? "bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            }
          `}
        >
          <span className="text-sm sm:text-base">📤</span>
          <span className="text-xs sm:text-sm lg:text-base">Enviar Datos al Backend</span>
          {selectedPartsWithPain.length > 0 && (
            <div className="ml-1 sm:ml-2 px-1.5 sm:px-2 py-0.5 bg-white/20 rounded-full text-xs font-bold">
              {selectedPartsWithPain.length}
            </div>
          )}
        </button>

        {/* Resumen estadístico */}
        {selectedPartsWithPain.length > 0 && (
          <div className="p-3 sm:p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg border border-primary/20">
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <span className="text-xs sm:text-sm">📊</span>
              <h4 className="text-xs sm:text-sm font-medium text-foreground">
                Resumen estadístico:
              </h4>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Total de partes:</span>
                <span className="text-xs font-bold text-foreground">{selectedPartsWithPain.length}</span>
              </div>
              <div className="grid grid-cols-5 gap-1">
                {[1, 2, 3, 4, 5].map((level) => {
                  const count = selectedPartsWithPain.filter(
                    (p) => p.painLevel === level
                  ).length;
                  return (
                    <div key={level} className="text-center">
                      <div
                        className="w-3 h-3 sm:w-4 sm:h-4 rounded-full mx-auto mb-1 border border-border"
                        style={{
                          backgroundColor: `rgb(${Math.round(
                            PAIN_LEVEL_COLORS[level as keyof typeof PAIN_LEVEL_COLORS][0] * 255
                          )}, ${Math.round(
                            PAIN_LEVEL_COLORS[level as keyof typeof PAIN_LEVEL_COLORS][1] * 255
                          )}, ${Math.round(
                            PAIN_LEVEL_COLORS[level as keyof typeof PAIN_LEVEL_COLORS][2] * 255
                          )})`,
                        }}
                      />
                      <span className="text-xs font-medium text-foreground">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
