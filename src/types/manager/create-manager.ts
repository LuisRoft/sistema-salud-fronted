export interface CreateManager {
  document: string;
  password: string;
  email: string;
  name: string;
  lastName: string;
  address: string;
  career?: string | null; // Solo el ID de la carrera
}
