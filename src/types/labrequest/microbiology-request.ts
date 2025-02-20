export interface MicrobiologyRequestDTO {
    muestra: string;
    sitio_anatomico: string;
    cultivo_y_antibiograma?: boolean;
    cristalografia?: boolean;
    gram?: boolean;
    fresco?: boolean;
    estudio_micologico_koh: string;
    cultivo_micotico: string;
    investigacion_paragonimus_spp: string;
    investigacion_histoplasma_spp: string;
    coloracion_zhiel_nielsen: string;
  }
  