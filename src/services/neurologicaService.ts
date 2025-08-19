import { CreateNeurologicaRequest } from '@/types/neurologica';
import { get, post } from './requestHandler';

type PaginationParams = {
  page: number;
  limit: number;
};

interface NeurologicaResponse {
  neurologicas: Array<{
    id: string;
    name: string;
    ci: string;
    edad: number;
    discapacidad: string;
    diagnostico: string;
    createdAt?: string;
    updatedAt?: string;
  }>;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function getNeurologicas(token: string, params: PaginationParams): Promise<NeurologicaResponse> {
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());
  
  const queryString = queryParams.toString();
  const endpoint = `/neurologica?${queryString}`;
  
  const response = await get(endpoint, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  
  return response.data;
}

export async function createNeurologica(data: CreateNeurologicaRequest, token: string) {
  console.log('📤 Enviando datos de evaluación neurológica:', data);
  
  const response = await post('/neurologica', data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  
  console.log('✅ Respuesta del servidor:', response.data);
  return response.data;
}

export async function getNeurologicaById(id: string, token: string) {
  const response = await get(`/neurologica/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  
  return response.data;
}

export async function getNeurologicasByCI(ci: string, token: string) {
  const response = await get(`/neurologica/by-ci/${ci}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  
  return response.data;
}

