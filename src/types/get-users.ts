export interface ResponseUsers {
  admins: Admin[];
  total: number;
}

export interface Admin {
  id: string;
  document: string;
  email: string;
  name: string;
  lastName: string;
}
