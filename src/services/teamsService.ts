import { Group } from './groupsService';
import { Patient } from './patientService';
import { post, get, patch, del, patch as patchUser } from './requestHandler';


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

interface User {
  id: string;
  document: string;
  name: string;
  lastName: string;
  team_id?: string | null;
}

interface TeamResponse {
  id: string;
  teamName: string;
  patient: Patient;
  group: Group;
  users: User[];
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

interface ApiError {
  message: string;
  data?: any;
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

    // Si hay usuarios seleccionados, actualizamos el team_id de cada uno
    if (data.userIds && data.userIds.length > 0) {
      await Promise.all(
        data.userIds.map(userId =>
          patchUser(`/users/user/${userId}`, {
            team_id: response.data.id
          }, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
        )
      );
    }

    return response.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw error;
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
    const response = await patch<TeamResponse>(`/teams/${teamId}`, {
      teamName: data.teamName,
      groupId: data.groupId,
      patientId: data.patientId
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Obtenemos los usuarios actuales del equipo
    const currentTeamResponse = await get<TeamResponse>(`/teams/${teamId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const currentTeam = currentTeamResponse.data;
    const currentUserIds = currentTeam.users?.map((user: User) => user.id) || [];
    const newUserIds = data.userIds || [];

    // Usuarios a remover del equipo
    const usersToRemove = currentUserIds.filter(id => !newUserIds.includes(id));
    
    // Usuarios a agregar al equipo
    const usersToAdd = newUserIds.filter(id => !currentUserIds.includes(id));

    // Actualizamos los usuarios que se remueven
    if (usersToRemove.length > 0) {
      await Promise.all(
        usersToRemove.map(userId =>
          patch(`/users/user/${userId}`, {
            team_id: null
          }, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
        )
      );
    }

    // Actualizamos los usuarios que se agregan
    if (usersToAdd.length > 0) {
      await Promise.all(
        usersToAdd.map(userId =>
          patch(`/users/user/${userId}`, {
            team_id: teamId
          }, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
        )
      );
    }

    return response.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      const apiError = error as { response?: { data: ApiError } };
      if (apiError.response?.data) {
        throw new Error(apiError.response.data.message);
      }
      throw error;
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