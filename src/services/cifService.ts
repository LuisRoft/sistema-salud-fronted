import { CIFData, CIFSearchResult, CIFEstructura, CIFSubestructura } from '@/types/cif/cif-structure';

class CIFService {
  private cifData: CIFData | null = null;

  async loadCIFData(): Promise<CIFData> {
    if (this.cifData) {
      return this.cifData;
    }

    try {
      const response = await fetch('/cif.json');
      const data = await response.json();
      this.cifData = data;
      return data;
    } catch (error) {
      console.error('Error al cargar datos CIF:', error);
      throw new Error('No se pudieron cargar los datos CIF');
    }
  }

  async searchCIF(query: string): Promise<CIFSearchResult[]> {
    const data = await this.loadCIFData();
    const results: CIFSearchResult[] = [];
    const queryLower = query.toLowerCase();

    data.estructuras.forEach((estructura) => {
      // Buscar en estructuras principales
      if (
        estructura.codigo.toLowerCase().includes(queryLower) ||
        estructura.tema.toLowerCase().includes(queryLower)
      ) {
        results.push({
          codigo: estructura.codigo,
          tema: estructura.tema,
          nivel: 'principal',
          rutaCompleta: estructura.tema,
        });
      }

      // Buscar en subestructuras
      if (estructura.subestructuras) {
        estructura.subestructuras.forEach((sub) => {
          if (
            sub.codigo.toLowerCase().includes(queryLower) ||
            sub.descripcion.toLowerCase().includes(queryLower)
          ) {
            results.push({
              codigo: sub.codigo,
              tema: estructura.tema,
              descripcion: sub.descripcion,
              nivel: 'subestructura',
              rutaCompleta: `${estructura.tema} > ${sub.descripcion}`,
            });
          }
        });
      }
    });

    return results.slice(0, 20); // Limitar a 20 resultados
  }

  async getCIFByCode(code: string): Promise<CIFSearchResult | null> {
    const data = await this.loadCIFData();
    const codeLower = code.toLowerCase();

    for (const estructura of data.estructuras) {
      if (estructura.codigo.toLowerCase() === codeLower) {
        return {
          codigo: estructura.codigo,
          tema: estructura.tema,
          nivel: 'principal',
          rutaCompleta: estructura.tema,
        };
      }

      if (estructura.subestructuras) {
        for (const sub of estructura.subestructuras) {
          if (sub.codigo.toLowerCase() === codeLower) {
            return {
              codigo: sub.codigo,
              tema: estructura.tema,
              descripcion: sub.descripcion,
              nivel: 'subestructura',
              rutaCompleta: `${estructura.tema} > ${sub.descripcion}`,
            };
          }
        }
      }
    }

    return null;
  }

  async getAllCIFStructures(): Promise<CIFEstructura[]> {
    const data = await this.loadCIFData();
    return data.estructuras;
  }

  async getCIFMetadata() {
    const data = await this.loadCIFData();
    return data.metadata;
  }
}

export const cifService = new CIFService();
export default cifService; 