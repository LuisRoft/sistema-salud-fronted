import { get, post } from './requestHandler';
import { getSession } from 'next-auth/react';

interface GetPatientsParams {
  page?: number;
  limit?: number;
}

interface PatientsResponse {
  patients: Patient[];
  total: number;
}

export interface Patient {
  id: string;
  name: string;
  lastName: string;
  isActive: boolean;
  typeDisability: string;
  typeBeneficiary: string;
  address: string;
  birthday: string;
  gender: string;
  document: string;
  percentageDisability: number;
  zone: string;
}

interface CreateUser {
  document: string;
  name: string;
  lastName: string;
  gender: string;
  birthday: string;
  typeBeneficiary: string;
  typeDisability: string;
  percentageDisability: number;
  zone: string;
  caregiverId: string;
  isActive?: boolean;
}

export const getPatients = async (
  token: string,
  params?: GetPatientsParams
): Promise<PatientsResponse> => {
  const queryParams = new URLSearchParams();

  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());

  const queryString = queryParams.toString();
  const endpoint = `/patients?${queryString}`;

  const res = await get(endpoint, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};

export const createUser = async (data: CreateUser, token: string) => {
  console.log(data);
  return post('/patients', data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getPatientByDocument = async (document: string, token: string) => {
  const response = await get(`/patients/document/${document}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const getPatientByUserAssigned = async (
  userId: string,
  token: string,
): Promise<Patient[]> => {
  console.log('🔍 Fetching patients for user:', userId);
  try {
    // First try to get patients from team assignment
    const session = await getSession();
    const teamData = session?.user?.team;
    
    // If user has team with patients, use those first
    if (teamData?.patient && Object.values(teamData.patient).length > 0) {
      const teamPatients = Object.values(teamData.patient) as Patient[];
      console.log('✅ Using patients from team assignment:', teamPatients);
      return teamPatients;
    }
    
    // Otherwise fetch from API
    const response = await get(`/patients/user/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    console.log('✅ API Response:', response.data);
    
    // Handle both array and object with patients property
    const patients = Array.isArray(response.data) 
      ? response.data 
      : response.data.patients || [];
      
    console.log('✅ Processed patients:', patients);
    return patients;
  } catch (error) {
    console.error('❌ Error fetching patients:', error);
    if ((error as any).response) {
      console.error('Server response:', (error as any).response.data);
      console.error('Status code:', (error as any).response.status);
    }
    
    // Try to get patients from session as fallback
    try {
      const session = await getSession();
      const teamData = session?.user?.team;
      if (teamData?.patient && Object.values(teamData.patient).length > 0) {
        const teamPatients = Object.values(teamData.patient) as Patient[];
        console.log('✅ Fallback: Using patients from team assignment:', teamPatients);
        return teamPatients;
      }
    } catch (sessionError) {
      console.error('Failed to get patients from session:', sessionError);
    }
    
    return [];
  }
};


