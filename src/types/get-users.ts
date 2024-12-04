export interface ResponseUsers {
  UserPaginated: UserPaginated;
  totalCount: number;
}

export interface UserPaginated {
  data: Datum[];
  totalCount: number;
  userPerPage: number;
  totalPages: number;
}

export interface Datum {
  id: number;
  email: string;
  role: Role;
  status: boolean;
  document: string;
  direction: string;
  createdAt: Date;
}

export interface Role {
  id: number;
  name_role: string;
  createdAt: Date;
  updatedAt: Date;
}
