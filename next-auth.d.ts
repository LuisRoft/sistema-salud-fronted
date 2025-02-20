import 'next-auth';

declare module 'next-auth' {
  interface User {
    document: string;
    name: string;
    lastName: string;
    role: string;
    token?: string;
    team?: string;
  }

  interface Session {
    user: {
      sub: string;
      name: string;
      email: string;
      role: string;
      access_token: string;
      team?: {
        id: string;
        teamName: string;
        patient?: {
          id: string;
          document: string;
          name: string;
          lastName: string;
          gender: string;
          birthday: string;
          typeBeneficiary: string;
          typeDisability: string;
          percentageDisability: number;
          zone: string;
          isActive: boolean;
          caregiver: {
            id: string;
            name: string;
            lastName: string;
            // otros campos del cuidador que necesites
          };
        };
      };
    };
    expires: string;
  }
}
