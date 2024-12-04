import 'next-auth';

interface Role {
  id: number;
  name_role: string;
  createdAt: string;
  updatedAt: string;
}

declare module 'next-auth' {
  interface User {
    id: number;
    document: string;
    name: string;
    role: Role;
    token?: string;
  }

  interface Session {
    user: User & {
      access_token?: string;
    };
    expires: string;
  }
}
