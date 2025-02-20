import { Group } from './groupsService';
import { Patient } from './patientService';
import { post, get, patch, del } from './requestHandler';


interface createTeam {
  teamName: string;
  groupId: string;
  patientId: string;
  userIds: string[];
}

interface TeamsResponse {
  teams: Team[];
  total: number;
}

export interface Team {
  id: string;
  teamName: string;
  patient: Patient;
  group: Group;
}

export interface editTeam {
  id: string;
  teamName: string;
  patient: {
    id: string;
    document: string;
    name: string;
    lastName: string;
  };
  group: {
    id: string;
    groupName: string;
  };
  users: {
    id: string;
    document: string;
    name: string;
    lastName: string;
  }[];
}

export const createTeam = async (data: createTeam, token: string) => {
  return post('/teams', data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getTeams = async (
  token: string,
  { limit, page }: { limit: number; page: number }
): Promise<TeamsResponse> => {
  const response = await get(`/teams?limit=${limit}&page=${page}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const updateTeam = async (
  data: createTeam,
  token: string,
  teamId: string
) => {
  try {
    const response = await patch(`/teams/${teamId}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      if ('response' in error && typeof error.response === 'object' && error.response && 'data' in error.response) {
        const responseData = error.response.data as { message?: string };
        throw new Error(responseData.message || error.message);
      }
      throw error;
    }
    throw new Error('Error inesperado al actualizar el equipo');
  }
};

export const deleteTeam = async (teamId: string, token: string) => {
  return del(`/teams/${teamId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}