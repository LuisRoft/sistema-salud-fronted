import { Group } from './groupsService';
import { Patient } from './patientService';
import { post, get, patch, del } from './requestHandler';


interface createTeam {
  teamName: string;
  groupId: string;
  patientId: string;
  userIds?: string[]; // IDs de usuarios a asignar
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
  try {
    // Primero creamos el equipo
    const response = await post('/teams', {
      teamName: data.teamName,
      groupId: data.groupId,
      patientId: data.patientId
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Si hay usuarios seleccionados, actualizamos sus team_id
    if (data.userIds && data.userIds.length > 0) {
      await post('/teams/assign-users', {
        teamId: response.data.id,
        userIds: data.userIds
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

    return response.data;
  } catch (error: Error) {
    if ('response' in error && error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error('Error al crear el equipo');
  }
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
    // Primero actualizamos el equipo
    const response = await patch(`/teams/${teamId}`, {
      teamName: data.teamName,
      groupId: data.groupId,
      patientId: data.patientId
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Si hay usuarios seleccionados, actualizamos sus asignaciones
    if (data.userIds) {
      await post('/teams/assign-users', {
        teamId: teamId,
        userIds: data.userIds
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

    return response.data;
  } catch (error: Error) {
    if ('response' in error && error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error('Error al actualizar el equipo');
  }
};

export const deleteTeam = async (teamId: string, token: string) => {
  return del(`/teams/${teamId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}