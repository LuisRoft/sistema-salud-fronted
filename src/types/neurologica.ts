export interface AlteracionesMarcha {
  marchaTrendelenburg: boolean;
  marchaTuerca: boolean;
  marchaAtaxica: boolean;
  marchaSegador: boolean;
  marchaTijeras: boolean;
  marchaTabetica: boolean;
  marchaCoreica: boolean;
  marchaDistonica: boolean;
  otrasAlteraciones?: string;
}

export interface RiesgoCaida {
  tiempoTimedUpGo?: string;
  riesgoEvaluado?: string;
  comentariosRiesgo?: string;
}

export interface EvaluacionDolor {
  localizacion?: string;
  tiempo?: string;
  irradiado?: string;
  tipo?: string;
  escalaVisualNumerica?: number;
  escalaSubjetiva?: string;
  actividadesAlivian?: string;
  actividadesAgravan?: string;
  comentariosDolor?: string;
}

export interface BarthelIndex {
  vestirse?: number;
  arreglarse?: number;
  deposicion?: number;
  miccion?: number;
  usoRetrete?: number;
  trasladarse?: number;
  deambular?: number;
  escaleras?: number;
}

export interface EvaluacionNeurologica {
  id?: string;
  name: string;
  ci: string;
  edad: number;
  discapacidad: string;
  diagnostico: string;
  antecedentesHeredofamiliares?: string;
  antecedentesFarmacologicos?: string;
  historiaNutricional?: string;
  alergias?: string;
  habitosToxicos?: string;
  quirurgico?: string;
  comunicacion?: string;
  dolor?: string;
  utilizaSillaRuedas?: boolean;
  amnesis?: string;
  inicioEvolucion?: string;
  entornoFamiliar?: string;
  alteracionesMarcha?: AlteracionesMarcha;
  riesgoCaida?: RiesgoCaida;
  alcanceMotor?: string;
  comentariosExaminador?: string;
  resumenResultados?: string;
  evaluacionDolor?: EvaluacionDolor;
  cif?: string[];
  diagnosticoFisioterapeutico?: string;
  planFisioterapeutico?: string;
}

export interface CreateNeurologicaRequest {
  name: string;
  ci: string;
  edad: number;
  discapacidad: string;
  diagnostico: string;
  antecedentesHeredofamiliares?: string;
  antecedentesFarmacologicos?: string;
  historiaNutricional?: string;
  alergias?: string;
  habitosToxicos?: string;
  quirurgico?: string;
  comunicacion?: string;
  dolor?: string;
  utilizaSillaRuedas?: boolean;
  amnesis?: string;
  inicioEvolucion?: string;
  entornoFamiliar?: string;
  alteracionesMarcha?: AlteracionesMarcha;
  riesgoCaida?: RiesgoCaida;
  barthel?: BarthelIndex;
  alcanceMotor?: string;
  comentariosExaminador?: string;
  resumenResultados?: string;
  evaluacionDolor?: EvaluacionDolor;
  cif?: string[];
  diagnosticoFisioterapeutico?: string;
  planFisioterapeutico?: string;
} 