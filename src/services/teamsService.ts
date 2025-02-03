import { Group } from './groupsService';
import { Patient } from './patientService';
import { post, get, patch, del } from './requestHandler';

interface createTeam {
  teamName: string;
  groupId: string;
  patientId: string;
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
  const response = await patch(`/teams/${teamId}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

export const deleteTeam = async (teamId: string, token: string) => {
  return del(`/teams/${teamId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}