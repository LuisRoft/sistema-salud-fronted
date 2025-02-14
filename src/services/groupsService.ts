import { del, get, patch, post } from './requestHandler';

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

  return response.data;
};

export const updateGroup = async (
  data: createGroup,
  token: string,
  groupId: string
) => {
  const response = await patch(`/groups/${groupId}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

export const deleteGroup = async (groupId: string, token: string) => {
  return del(`/groups/${groupId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

