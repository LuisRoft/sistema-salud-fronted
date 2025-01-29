import 'next-auth';

declare module 'next-auth' {
  interface User {
    document: string;
    name: string;
    lastName: string;
    role: string;
    token?: string;
  }

  interface Session {
    user: User & {
      access_token?: string;
    };
    expires: string;
  }
}
