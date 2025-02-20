import { get } from './requestHandler';

// Ya no necesitamos esta función ya que los datos vienen en la sesión
 export const getTeamDetails = async (teamId: string, token: string) => {
   return get(`/teams/${teamId}/details`, {
     headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  }).then((res) => res.data);
 }; 