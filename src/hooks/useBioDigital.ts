import { useCallback, useEffect, useRef, useState } from "react";
import {
  BioDigitalResponse,
  SelectedPart,
  PartWithPain,
  createPainColorConfig,
  ANATOMICAL_COLORS,
} from "@/utils/biodigital-config";

// Tipos para BioDigital HumanAPI
interface HumanAPIEventHandler {
  (event: Record<string, boolean>): void;
}

interface HumanAPI {
  send: (command: string, data?: unknown) => void;
  on: (event: string, handler: HumanAPIEventHandler) => void;
  off: (event: string, handler: HumanAPIEventHandler) => void;
}

interface UseBioDigitalReturn {
  data: BioDigitalResponse | null;
  isLoading: boolean;
  error: string | null;
  scriptLoaded: boolean;
  selectedParts: React.MutableRefObject<SelectedPart[]>;
  selectedPartsWithPain: PartWithPain[];
  setSelectedPartsWithPain: React.Dispatch<
    React.SetStateAction<PartWithPain[]>
  >;
  humanAPI: HumanAPI | null;
  fetchHumanData: () => Promise<void>;
  initializeHumanAPI: () => (() => void) | undefined;
  handleScriptLoad: () => void;
  handleScriptError: () => void;
  updatePartPainLevel: (partId: string, painLevel: number) => void;
  updatePartNotes: (partId: string, notes: string) => void;
  addSelectedPart: (partId: string, painLevel?: number) => void;
  removeSelectedPart: (partId: string) => void;
}

export function useBioDigital(
  initialParts: SelectedPart[]
): UseBioDigitalReturn {
  const [data, setData] = useState<BioDigitalResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [selectedPartsWithPain, setSelectedPartsWithPain] = useState<
    PartWithPain[]
  >([]);

  const selectedParts = useRef<SelectedPart[]>(initialParts);
  const humanAPI = useRef<HumanAPI | null>(null);
  const selectedPartsWithPainRef = useRef<PartWithPain[]>([]);
  const lastSelectionTime = useRef<{ [key: string]: number }>({});

  // Mantener ref sincronizado con estado
  useEffect(() => {
    selectedPartsWithPainRef.current = selectedPartsWithPain;
  }, [selectedPartsWithPain]);

  // Función para actualizar el nivel de dolor de una parte
  const updatePartPainLevel = useCallback(
    (partId: string, painLevel: number) => {
      setSelectedPartsWithPain((prev) => {
        const existingIndex = prev.findIndex((part) => part.id === partId);
        if (existingIndex >= 0) {
          // Actualizar parte existente
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            painLevel,
            tintColor: createPainColorConfig(partId, painLevel).tintColor,
          };
          return updated;
        } else {
          // Agregar nueva parte
          return [
            ...prev,
            {
              id: partId,
              painLevel,
              tintColor: createPainColorConfig(partId, painLevel).tintColor,
            },
          ];
        }
      });

      // Aplicar color en el modelo 3D si está disponible
      if (humanAPI.current) {
        const colorConfig = createPainColorConfig(partId, painLevel);
        humanAPI.current.send("scene.colorObject", colorConfig);
      }
    },
    []
  );

  // Función para actualizar las notas de una parte
  const updatePartNotes = useCallback((partId: string, notes: string) => {
    setSelectedPartsWithPain((prev) => {
      const existingIndex = prev.findIndex((part) => part.id === partId);
      if (existingIndex >= 0) {
        // Actualizar notas de parte existente
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          notes,
        };
        return updated;
      }
      return prev; // Si no existe la parte, no hacer nada
    });
  }, []);

  // Función para agregar una parte seleccionada
  const addSelectedPart = useCallback(
    (partId: string, painLevel: number = 1) => {
      updatePartPainLevel(partId, painLevel);
    },
    [updatePartPainLevel]
  );

  // Función para remover una parte seleccionada (solo quita color, mantiene selección)
  const removeSelectedPart = useCallback((partId: string) => {
    setSelectedPartsWithPain((prev) =>
      prev.filter((part) => part.id !== partId)
    );

    // SOLO resetear color usando scene.colorObject, MANTENER la parte seleccionada
    if (humanAPI.current) {
      try {
        // Aplicar color que simule el aspecto original/natural del músculo
        humanAPI.current.send("scene.colorObject", {
          objectId: partId,
          tintColor: ANATOMICAL_COLORS.MUSCLE, // Color muscular natural 
          opacity: 1.0, // Completamente opaco
          brightness: 0.0, // Sin modificación de brillo
          saturation: 0.0, // Sin saturación adicional
          contrast: 0.0 // Sin contraste adicional
        });
        
        console.log(`🎨 Color restaurado a natural: ${partId} (parte sigue seleccionada)`);
      } catch (error) {
        console.warn(`⚠️ Error al restaurar color de ${partId}:`, error);
      }
    }
  }, []);

  // Función optimizada para fetch de datos
  const fetchHumanData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/get-human-data");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const json: BioDigitalResponse = await response.json();

      if (!json?.myhuman?.length) {
        throw new Error("No human models found in response");
      }

      setData(json);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Error desconocido al cargar datos";
      console.error("Error fetching human data:", err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Configuración optimizada del Human API
  const initializeHumanAPI = useCallback(() => {
    try {
      const windowWithHuman = window as typeof window & {
        HumanAPI: new (containerId: string) => HumanAPI;
      };
      
      if (!windowWithHuman.HumanAPI) {
        throw new Error("HumanAPI no está disponible");
      }

      const human = new windowWithHuman.HumanAPI("biodigital");
      humanAPI.current = human; // Guardar referencia

      // Seleccionar objetos iniciales
      human.send("scene.selectObjects", selectedParts.current);

      // Manejar eventos de selección de objetos
      const handleObjectSelection = (event: Record<string, boolean>) => {
        Object.keys(event).forEach((objectId: string) => {
          if (event[objectId]) {
            // Protección contra clics rápidos (debouncing)
            const now = Date.now();
            const lastTime = lastSelectionTime.current[objectId] || 0;
            if (now - lastTime < 500) { // 500ms de debounce
              console.log(`⏰ Clic muy rápido ignorado para: ${objectId}`);
              return;
            }
            lastSelectionTime.current[objectId] = now;

            // Verificar si ya existe en selectedPartsWithPain usando ref
            const currentParts = selectedPartsWithPainRef.current;
            const existingPartIndex = currentParts.findIndex(
              (part) => part.id === objectId
            );
            if (existingPartIndex >= 0) {
              // Parte ya existe - solo actualizar color
              const existingPart = currentParts[existingPartIndex];
              const colorConfig = createPainColorConfig(
                objectId,
                existingPart.painLevel
              );
              human.send("scene.colorObject", colorConfig);
              console.log(`🔄 Parte ya existe, actualizando color: ${objectId} (Nivel: ${existingPart.painLevel})`);
            } else {
              // Agregar nueva parte con dolor nivel 1 por defecto
              const newPart: PartWithPain = {
                id: objectId,
                painLevel: 1,
                tintColor: createPainColorConfig(objectId, 1).tintColor,
              };

              setSelectedPartsWithPain((prev) => [...prev, newPart]);

              // Aplicar color en el modelo
              const colorConfig = createPainColorConfig(objectId, 1);
              human.send("scene.colorObject", colorConfig);

              console.log(
                `🎯 Nueva parte seleccionada: ${objectId} (Nivel de dolor: 1)`
              );
            }
          } else {
            // Deshabilitar highlight para objetos no seleccionados
            human.send("scene.disableHighlight", {
              objectId: objectId,
            });
          }
        });
      };

      // Registrar event listener
      human.on("scene.objectsSelected", handleObjectSelection);

      setScriptLoaded(true);

      // Cleanup function para remover listeners si es necesario
      return () => {
        try {
          human.off("scene.objectsSelected", handleObjectSelection);
        } catch (err) {
          console.warn("Error removing event listener:", err);
        }
      };
    } catch (err) {
      console.error("Error inicializando HumanAPI:", err);
      setError("Error al inicializar el visor 3D");
    }
  }, []); // Remover dependencia problemática

  const handleScriptLoad = useCallback(() => {
    initializeHumanAPI();
  }, [initializeHumanAPI]);

  const handleScriptError = useCallback(() => {
    console.error("Error cargando el script de BioDigital");
    setError("Error al cargar el script de BioDigital");
  }, []);

  return {
    data,
    isLoading,
    error,
    scriptLoaded,
    selectedParts,
    selectedPartsWithPain,
    setSelectedPartsWithPain,
    humanAPI: humanAPI.current,
    fetchHumanData,
    initializeHumanAPI,
    handleScriptLoad,
    handleScriptError,
    updatePartPainLevel,
    updatePartNotes,
    addSelectedPart,
    removeSelectedPart,
  };
}
