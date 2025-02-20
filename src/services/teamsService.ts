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
    const response = await patch(`/teams/${teamId}`, {
      teamName: data.teamName,
      groupId: data.groupId,
      patientId: data.patientId
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Obtenemos los usuarios actuales del equipo
    const currentTeam = await get(`/teams/${teamId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const currentUserIds = currentTeam.data.users.map((user: any) => user.id);
    const newUserIds = data.userIds || [];

    // Usuarios a remover del equipo (establecer team_id a null)
    const usersToRemove = currentUserIds.filter(id => !newUserIds.includes(id));
    
    // Usuarios a agregar al equipo
    const usersToAdd = newUserIds.filter(id => !currentUserIds.includes(id));

    // Actualizamos los usuarios que se remueven (team_id = null)
    await Promise.all(
      usersToRemove.map(userId =>
        patchUser(`/users/user/${userId}`, {
          team_id: null
        }, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      )
    );

    // Actualizamos los usuarios que se agregan (team_id = teamId)
    await Promise.all(
      usersToAdd.map(userId =>
        patchUser(`/users/user/${userId}`, {
          team_id: teamId
        }, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      )
    );

    return response.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
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