import { del, get, patch, post } from './requestHandler';
import { CreateCareer } from '@/types/career/create-career';
import { UpdateCareer } from '@/types/career/update-career';
import { Career } from '@/types/career/get-careers';

interface GetCareersParams {
  page?: number;
  limit?: number;
  name?: string; // Filtro por nombre para búsqueda
}

// Crear una nueva carrera
export const createCareer = async (data: CreateCareer, token: string) => {
  return post('/careers', data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// Obtener todas las carreras (con soporte para paginación y filtro por nombre)
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

// Actualizar una carrera existente
export const updateCareer = async (
  data: UpdateCareer,
  id: string,
  token: string
) => {
  return patch(`/careers/${id}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// Eliminar (borrar) una carrera
export const deleteCareer = async (id: string, token: string) => {
  return del(`/careers/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
