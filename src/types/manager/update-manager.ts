export interface UpdateManager {
  document: string;
  name: string;
  lastName: string;
  email: string;
  address?: string;
  career?: string; // ID de la carrera
  password?: string; // Contraseña opcional
}
