export interface CIFSubestructura {
  codigo: string;
  descripcion: string;
}

export interface CIFEstructura {
  codigo: string;
  tema: string;
  subestructuras?: CIFSubestructura[];
}

export interface CIFData {
  nombre: string;
  descripcion: string;
  estructuras: CIFEstructura[];
  metadata: {
    total_estructuras: number;
    sistemas_principales: string[];
    formato_original: string;
    clasificacion: string;
    idioma: string;
    fecha_conversion: string;
  };
}

export interface CIFSearchResult {
  codigo: string;
  tema: string;
  descripcion?: string;
  nivel: 'principal' | 'subestructura';
  rutaCompleta: string;
} 