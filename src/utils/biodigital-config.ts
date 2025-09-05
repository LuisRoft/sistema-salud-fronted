// Configuraciones y utilidades para BioDigital

export interface SelectedPart {
  id: string;
  tintColor: [number, number, number];
  saturation?: number;
  brightness?: number;
}

// Nueva interfaz para partes con nivel de dolor
export interface PartWithPain {
  id: string;
  painLevel: number; // 1-5
  tintColor: [number, number, number];
  saturation?: number;
  brightness?: number;
  notes?: string; // Campo para observaciones específicas
}

export interface ColorConfig {
  objectId: string;
  tintColor: [number, number, number];
  brightness: number;
  saturation: number;
  contrast: number;
  opacity: number;
}

export interface BioDigitalContent {
  content_url: string;
  id: string;
  title?: string;
}

export interface BioDigitalResponse {
  myhuman: BioDigitalContent[];
}

// Colores para niveles de dolor del 1 al 5
export const PAIN_LEVEL_COLORS = {
  1: [0.2, 0.8, 0.2] as [number, number, number], // Verde claro - Sin dolor
  2: [0.8, 0.8, 0.2] as [number, number, number], // Amarillo - Dolor leve
  3: [1.0, 0.6, 0.0] as [number, number, number], // Naranja - Dolor moderado
  4: [1.0, 0.3, 0.1] as [number, number, number], // Rojo claro - Dolor fuerte
  5: [0.8, 0.0, 0.0] as [number, number, number], // Rojo oscuro - Dolor severo
} as const;

// Configuración por defecto para objetos seleccionados
export const DEFAULT_COLOR_CONFIG: Omit<ColorConfig, "objectId"> = {
  tintColor: [1, 0, 0],
  brightness: 0.1,
  saturation: -0.5,
  contrast: 0.5,
  opacity: 1.0,
} as const;

// Partes anatómicas predefinidas para casos comunes
export const PREDEFINED_PARTS = {
  FRONTAL_BONE: {
    id: "maleAdult_standard-Frontal_bone_52734_ID",
    tintColor: [1, 0, 0] as [number, number, number],
    saturation: -0.5,
  },
  SUPERIOR_FRONTAL_GYRUS: {
    id: "bd_brain-right_superior_frontal_gyrus_ID",
    tintColor: [0, 1, 0] as [number, number, number],
    brightness: 0.1,
  },
} as const;

// Colores predefinidos para diferentes sistemas anatómicos
export const ANATOMICAL_COLORS = {
  BONE: [0.9, 0.9, 0.8] as [number, number, number],
  MUSCLE: [0.8, 0.3, 0.3] as [number, number, number],
  BRAIN: [0.9, 0.8, 0.9] as [number, number, number],
  ORGAN: [0.8, 0.5, 0.3] as [number, number, number],
  NERVOUS: [1.0, 1.0, 0.3] as [number, number, number],
  VASCULAR: [0.8, 0.2, 0.2] as [number, number, number],
} as const;

// Utilidad para crear configuración de color personalizada
export function createColorConfig(
  objectId: string,
  customConfig?: Partial<Omit<ColorConfig, "objectId">>
): ColorConfig {
  return {
    objectId,
    ...DEFAULT_COLOR_CONFIG,
    ...customConfig,
  };
}

// Nueva utilidad para crear configuración basada en nivel de dolor
export function createPainColorConfig(
  objectId: string,
  painLevel: number
): ColorConfig {
  const tintColor =
    PAIN_LEVEL_COLORS[painLevel as keyof typeof PAIN_LEVEL_COLORS] ||
    PAIN_LEVEL_COLORS[1];

  return {
    objectId,
    tintColor,
    brightness: 0.2,
    saturation: 0.3,
    contrast: 0.7,
    opacity: 0.8,
  };
}

// Utilidad para obtener el nombre descriptivo del nivel de dolor
export function getPainLevelName(level: number): string {
  const names = {
    1: "Sin dolor",
    2: "Dolor leve",
    3: "Dolor moderado",
    4: "Dolor fuerte",
    5: "Dolor severo",
  };
  return names[level as keyof typeof names] || "Desconocido";
}

// Utilidad para validar nivel de dolor
export function isValidPainLevel(level: number): boolean {
  return Number.isInteger(level) && level >= 1 && level <= 5;
}

// Utilidad para validar si una parte anatómica es válida
export function isValidAnatomicalPart(part: any): part is SelectedPart {
  return (
    typeof part === "object" &&
    typeof part.id === "string" &&
    Array.isArray(part.tintColor) &&
    part.tintColor.length === 3 &&
    part.tintColor.every((val: any) => typeof val === "number")
  );
}

// Configuración del script de BioDigital
export const BIODIGITAL_SCRIPT_CONFIG = {
  src: "https://developer.biodigital.com/builds/api/human-api-3.0.0.min.js",
  strategy: "lazyOnload" as const,
  timeout: 15000, // 15 segundos timeout
} as const;
