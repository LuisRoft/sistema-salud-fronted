import { useCallback, useRef, useState } from "react";
import {
  BioDigitalResponse,
  SelectedPart,
  PartWithPain,
  createColorConfig,
  createPainColorConfig,
} from "@/utils/biodigital-config";

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
  humanAPI: any;
  fetchHumanData: () => Promise<void>;
  initializeHumanAPI: () => (() => void) | undefined;
  handleScriptLoad: () => void;
  handleScriptError: () => void;
  updatePartPainLevel: (partId: string, painLevel: number) => void;
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
  const humanAPI = useRef<any>(null);

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

  // Función para agregar una parte seleccionada
  const addSelectedPart = useCallback(
    (partId: string, painLevel: number = 1) => {
      updatePartPainLevel(partId, painLevel);
    },
    [updatePartPainLevel]
  );

  // Función para remover una parte seleccionada
  const removeSelectedPart = useCallback((partId: string) => {
    setSelectedPartsWithPain((prev) =>
      prev.filter((part) => part.id !== partId)
    );

    // Remover color en el modelo 3D
    if (humanAPI.current) {
      humanAPI.current.send("scene.disableHighlight", { objectId: partId });
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
      if (!(window as any).HumanAPI) {
        throw new Error("HumanAPI no está disponible");
      }

      const human = new (window as any).HumanAPI("biodigital");
      humanAPI.current = human; // Guardar referencia

      // Seleccionar objetos iniciales
      human.send("scene.selectObjects", selectedParts.current);

      // Manejar eventos de selección de objetos
      const handleObjectSelection = (event: Record<string, boolean>) => {
        Object.keys(event).forEach((objectId: string) => {
          if (event[objectId]) {
            // Verificar si ya existe en selectedPartsWithPain
            const existingPartIndex = selectedPartsWithPain.findIndex(
              (part) => part.id === objectId
            );
            if (existingPartIndex >= 0) {
              // Aplicar el color de dolor existente
              const existingPart = selectedPartsWithPain[existingPartIndex];
              const colorConfig = createPainColorConfig(
                objectId,
                existingPart.painLevel
              );
              human.send("scene.colorObject", colorConfig);
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
  }, [selectedPartsWithPain]);

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
    addSelectedPart,
    removeSelectedPart,
  };
}
