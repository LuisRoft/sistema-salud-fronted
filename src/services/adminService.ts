import { CreateAdmin } from '@/types/create-admin';
import { del, get, patch, post } from './requestHandler';
import { UpdateAdmin } from '@/types/update-admin';
import { ResponseUsers } from '@/types/get-users';

interface GetAdminsParams {
  page?: number;
  limit?: number;
  username?: string;
  name_role?: string;
}

export const createAdmin = async (data: CreateAdmin, token: string) => {
  const res = await post('/users/admin', data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

export const getAdmins = async (
  token: string,
  params?: GetAdminsParams
): Promise<ResponseUsers> => {
  const queryParams = new URLSearchParams();

  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.username) queryParams.append('username', params.username);
  if (params?.name_role) queryParams.append('name_role', params.name_role);

  const queryString = queryParams.toString();
  const endpoint = `/users/role/admin?${queryString}`;

  const res = await get(endpoint, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};

export const updateAdmin = async (
  data: UpdateAdmin,
  id: string,
  token: string
) => {
  const res = await patch(`/users/admin/${id}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};

export const deleteAdmin = async (id: string, token: string) => {
  const res = await del(`/users/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
