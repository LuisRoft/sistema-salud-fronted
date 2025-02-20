import { del, get, patch, post } from './requestHandler';
import { CreateManager } from '@/types/manager/create-manager';
import { UpdateManager } from '@/types/manager/update-manager';
import { GetManagersResponse } from '@/types/manager/get-manager';

interface GetManagersParams {
  page?: number;
  limit?: number;
  role?: string; // 'user' por defecto
}

// Crear un nuevo manager
export const createManager = async (data: CreateManager, token: string) => {
  console.log('Datos enviados al servidor:', data); // Verifica los datos enviados
  return post('/users/user', {
    ...data,
    career: data.career, // career es un string (el ID de la carrera)
  }, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// Obtener managers
export const getManagers = async (
  token: string,
  params?: GetManagersParams
): Promise<GetManagersResponse> => {
  const queryParams = new URLSearchParams();

  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.role) queryParams.append('role', params.role);

  const queryString = queryParams.toString();
  const endpoint = `/users/role/user?${queryString}`;

  return get(endpoint, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).then((res) => res.data);
};

export const updateManager = async (
  id: string,
  data: UpdateManager,
  token: string
) => {
  console.log('Datos enviados al servidor para actualización:', id, data);
  return patch(`/users/user/${id}`, { ...data, career: data.career, team: data.team }, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};



// Eliminar un manager
export const deleteManager = async (id: string, token: string) => {
  console.log(`Eliminando manager con ID: ${id}`); // Verificar ID antes de eliminar
  return del(`/users/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
