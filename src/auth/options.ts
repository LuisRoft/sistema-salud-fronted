import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

const cleanUrl = (value?: string) =>
  (value || '').trim().replace(/^['"`]+|['"`]+$/g, '');

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        identification: { label: 'identification', type: 'string', placeholder: '1312172199' },
        password: { label: 'Password', type: 'password', placeholder: '****' },
      },
      async authorize(credentials) {
        try {
          const rawBackend = cleanUrl(process.env.NEXT_PUBLIC_BACKEND_URL) || 'http://localhost:3000';
          const backendUrl = rawBackend.replace(/\/api\/?$/, '');
          const res = await fetch(`${backendUrl}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              document: credentials?.identification,
              password: credentials?.password,
            }),
          });
          const data = await res.json();
          if (res.ok && data.token) {
            return {
              id: data.document,
              name: data.name,
              email: data.email || `${data.document}@example.com`,
              document: data.document,
              lastName: data.lastName,
              role: data.role,
              token: data.token,
              team: data.team,
            } as any;
          }
          return null;
        } catch {
          return null;
        }
      },
    }),
  ],
  pages: { signIn: '/login', error: '/login' },
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        return {
          ...token,
          document: (user as any).document,
          name: (user as any).name,
          lastName: (user as any).lastName,
          role: (user as any).role,
          access_token: (user as any).token,
          team: (user as any).team,
        };
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        id: token.document as string,
        document: token.document as string,
        name: token.name as string,
        lastName: token.lastName as string,
        role: token.role as string,
        access_token: token.access_token as string,
        team: token.team as {
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
              document: string;
              name: string;
              lastName: string;
              gender: string;
              birthday: string;
              phone: string;
              address: string;
              email: string;
              isActive: boolean;
            };
          } | undefined;
        },
      };
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
  cookies: {
    sessionToken: {
      name: cleanUrl(process.env.NEXTAUTH_URL).startsWith('https://')
        ? '__Secure-next-auth.session-token'
        : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: cleanUrl(process.env.NEXTAUTH_URL).startsWith('https://'),
      },
    },
    csrfToken: {
      name: cleanUrl(process.env.NEXTAUTH_URL).startsWith('https://')
        ? '__Host-next-auth.csrf-token'
        : 'next-auth.csrf-token',
      options: {
        httpOnly: false,
        sameSite: 'lax',
        path: '/',
        secure: cleanUrl(process.env.NEXTAUTH_URL).startsWith('https://'),
      },
    },
  },
  useSecureCookies: cleanUrl(process.env.NEXTAUTH_URL).startsWith('https://'),
};
