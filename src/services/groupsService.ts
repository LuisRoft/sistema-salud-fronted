import { get, post } from './requestHandler';

interface createGroup {
  groupName: string;
}

interface GroupResponse {
  groups: Group[];
  total: number;
}

export interface Group {
  id: string;
  groupName: string;
}

export const createGroup = async (data: createGroup, token: string) => {
  return post('/groups', data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getGroups = async (
  token: string,
  limit: number = 10,
  page: number = 1
): Promise<GroupResponse> => {
  const response = await get(`/groups?limit=${limit}&page=${page}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  console.log(response.data);
  return response.data;
};
