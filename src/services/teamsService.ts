import { post, get, patch, del } from './requestHandler';


interface createTeam {
  teamName: string;
  groupId: string;
  patientIds: string[];  // ✅ Ahora acepta múltiples pacientes
}


interface TeamsResponse {
  teams: Team[];
  total: number;
}

export interface Team {
  id: string;
  teamName: string;
  patientCount: number;
  userCount: number;  // ✅ Agregamos userCount
  patient?: {  
    id: string;
    document: string;
    name: string;
    lastName: string;
  };
  group: {
    id: string;
    groupName: string;
  };
}


export interface editTeam {
  id: string;
  teamName: string;
  patientIds: string[];
  patientCount?: number;  // ✅ Ahora patientCount es opcional
  group: {
     id: string;
     groupName: string;
   };
}



export const createTeam = async (data: createTeam, token: string) => {
  return post('/teams', {
    ...data,
    patientIds: data.patientIds, // ✅ Asegura que se envía como array
  }, {
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
  data: editTeam,  // ✅ Ahora usa editTeam correctamente
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
  } catch (error: any) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else {
      throw new Error('Error inesperado al actualizar el equipo');
    }
  }
};


export const deleteTeam = async (teamId: string, token: string) => {
  return del(`/teams/${teamId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}