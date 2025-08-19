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
  alcanceMotor?: string;
  comentariosExaminador?: string;
  resumenResultados?: string;
} 