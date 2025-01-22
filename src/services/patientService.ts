import { get, post } from './requestHandler';

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
