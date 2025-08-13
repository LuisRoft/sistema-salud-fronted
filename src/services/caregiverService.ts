import { get, post } from './requestHandler';

interface Patient {
  id: string;
  document: string;
  name: string;
  lastName: string;
}

interface GetCaregiver {
  id: string;
  document: string;
  name: string;
  lastName: string;
  gender: string;
  conventionalNumbers?: string[];
  cellphoneNumbers: string[];
  canton: string;
  parish: string;
  zoneType: string;
  address: string;
  reference?: string;
  patientRelationship: string;
  patients?: Patient[]; // 🆕 Lista de pacientes asociados
  patientName?: string; // 🆕 Nombre del paciente extraído
}

interface CaregiverResponse {
  caregivers: GetCaregiver[];
  total: number;
}

export const createCaregiver = async (data: GetCaregiver, token: string) => {
  console.log('Datos enviados al backend:', data);
  return post('/caregivers', data, {
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

  console.log('API Response:', response.data); // 🔍 Verificar si la API devuelve patientName

  return {
    caregivers: response.data.map((caregiver: GetCaregiver) => {
      const firstPatient = caregiver.patients?.length ? caregiver.patients[0] : null;
      return {
        ...caregiver,
        patientName: firstPatient ? `${firstPatient.name} ${firstPatient.lastName}` : 'No asignado',
      };
    }),
    total: response.data.length,
  };
};
// Antobriox