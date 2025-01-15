export interface Manager {
    id: string;
    document: string;
    email: string;
    name: string;
    lastName: string;
    address?: string;
    career: {
      id: string;
      careerName: string;
    }; // Cambiado de string a objeto
  }
    
export interface GetManagersResponse {
    users: Manager[];
    total: number;
}
