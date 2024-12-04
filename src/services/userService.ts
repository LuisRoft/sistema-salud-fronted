import { CreateUser } from '@/types/create-user';
import { get, patch, post } from './requestHandler';
import { ResponseUsers } from '@/types/get-users';

interface GetUsersParams {
  page?: number;
  limit?: number;
  username?: string;
  name_role?: string;
}

export const createUser = async (data: CreateUser) => {
  const res = await post('/users', data);
  return res.data;
};

export const getUsers = async (
  token: string,
  params?: GetUsersParams
): Promise<ResponseUsers> => {
  const queryParams = new URLSearchParams();

  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.username) queryParams.append('username', params.username);
  if (params?.name_role) queryParams.append('name_role', params.name_role);

  const queryString = queryParams.toString();
  const endpoint = queryString ? `/users?${queryString}` : '/users';

  const res = await get(endpoint, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

export const updateUser = async (
  data: CreateUser,
  id: string,
  token: string
) => {
  const res = await patch(`/users/${id}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};
