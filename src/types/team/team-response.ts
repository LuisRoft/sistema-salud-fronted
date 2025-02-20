export interface TeamResponse {
  id: string;
  teamName: string;
  patient: {
    id: string;
    document: string;
    name: string;
    lastName: string;
    email: string;
    birthDate: string;
    gender: string;
    phone: string;
    address: string;
  } | null;
  group: {
    id: string;
    groupName: string;
  };
} 