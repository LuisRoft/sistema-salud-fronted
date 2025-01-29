import { get, post, patch, del } from './requestHandler';

interface GetCaregiver {
  id: string;
  document: string;
  name: string;
  lastName: string;
  gender: string;
  conventionalNumbers?: string[] | undefined;
  cellphoneNumbers: string[];
  canton: string;
  parish: string;
  zoneType: string;
  address: string;
  reference?: string | undefined;
  patientRelationship: string;
}

interface Caregiver {
  document: string;
  name: string;
  lastName: string;
  gender: string;
  conventionalNumbers?: string[] | undefined;
  cellphoneNumbers: string[];
  canton: string;
  parish: string;
  zoneType: string;
  address: string;
  reference?: string | undefined;
  patientRelationship: string;
}

interface CaregiverResponse {
  caregivers: GetCaregiver[];
  total: number;
}

export const createCaregiver = async (data: Caregiver, token: string) => {
  console.log(data);
  return post('/api/caregivers', data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getCaregivers = async (
  token: string,
  limit: number = 10,
  page: number = 1
): Promise<CaregiverResponse> => {
  const response = await get(`/caregivers?limit=${limit}&page=${page}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  console.log(response.data);

  return {
    caregivers: response.data,
    total: response.data.length,
  };
};

export const updateCaregiver = async (data: Caregiver, id: string, token: string) => {
  const response = await patch(`/caregivers/${id}`, data, {

    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const deleteCaregiver = async (id: string, token: string) => {
  const response = await del(`/caregivers/${id}`, {

    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
