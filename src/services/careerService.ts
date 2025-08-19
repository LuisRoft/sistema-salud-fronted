import { get, post } from './requestHandler';
import { CreateCareer } from '@/types/career/create-career';
import { Career } from '@/types/career/get-careers';
import { getSession } from 'next-auth/react';

interface GetCareersParams {
  page?: number;
  limit?: number;
  name?: string;
}

// Crear una nueva carrera
export const createCareer = async (data: CreateCareer, token: string) => {
  return post('/careers', data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// Obtener todas las carreras con autenticación
export const getCareers = async (
  token: string,
  params?: GetCareersParams
): Promise<Career[] | []> => {
  const queryParams = new URLSearchParams();

  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.name) queryParams.append('name', params.name);

  const queryString = queryParams.toString();
  const endpoint = `/careers?${queryString}`;

  const response = await get(endpoint, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

// Obtener carreras con autenticación desde la sesión
export async function fetchCareers() {
  try {
    const session = await getSession();
    const token = session?.user.access_token;

    if (!token) {
      console.error('Token no encontrado');
      return [];
    }

    const careers = await getCareers(token);
    console.log('Carreras obtenidas:', careers);
    return careers;
  } catch (error) {
    console.error('Error al obtener las carreras:', error);
    return [];
  }
}
