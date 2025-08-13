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
  data: {
    teamName?: string;
    groupId?: string;
    patientIds: string[];
  },
  token: string,
  teamId: string
) => {
  try {
    console.log('Updating team with data:', data);
    
    // Ensure we're sending the exact format the backend expects
    const formattedData = {
      teamName: data.teamName,
      groupId: data.groupId,
      patientIds: Array.isArray(data.patientIds) ? data.patientIds : [data.patientIds],
    };

    const response = await patch(`/teams/${teamId}`, formattedData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error updating team:', error);
    throw error;
  }
};


export const deleteTeam = async (teamId: string, token: string) => {
  return del(`/teams/${teamId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}