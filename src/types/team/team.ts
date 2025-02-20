export interface Team {
  id: string;
  teamName: string;
  patient: {
    id: string;
    document: string;
    name: string;
    lastName: string;
  };
  group: {
    id: string;
    groupName: string;
  };
  users: {
    id: string;
    document: string;
    name: string;
    lastName: string;
    team_id?: string | null;
  }[];
} 