export interface UserTeam {
  team: {
    id: string;
    teamName: string;
    patients: {
      id: string;
      document: string;
      name: string;
      lastName: string;
      email: string;
      birthDate: string;
      gender: string;
      phone: string;
      address: string;
    }[];
  };
} 