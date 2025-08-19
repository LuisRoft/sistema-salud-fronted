/* eslint-disable @typescript-eslint/no-unused-vars */
import { CreateNeurologicaRequest } from '@/types/neurologica';

type PaginationParams = {
  page: number;
  limit: number;
};

export async function getNeurologicas(_: string, params: PaginationParams) {
  // Simula delay de red
  await new Promise((resolve) => setTimeout(resolve, 500));

  return {
    neurologicas: [
      {
        id: '1',
        name: 'Gabriela Gómez',
        ci: '063320109',
        edad: 29,
        discapacidad: 'Física 95%',
        diagnostico: 'Parálisis Cerebral Infantil Moderada',
      },
      {
        id: '2',
        name: 'Carlos Pérez',
        ci: '0102030405',
        edad: 35,
        discapacidad: 'Auditiva 60%',
        diagnostico: 'Hipoacusia neurosensorial',
      },
    ],
    total: 2,
  };
}

export async function createNeurologica(data: CreateNeurologicaRequest, _token: string) {
  console.log(' Mock: Evaluación neurológica creada con datos completos', data);
  return { message: 'Evaluación neurológica registrada correctamente (mock)' };
}

