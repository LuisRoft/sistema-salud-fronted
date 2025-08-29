import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        identification: {
          label: 'identification',
          type: 'string',
          placeholder: '1312172199',
        },
        password: {
          label: 'Password',
          type: 'password',
          placeholder: '****',
        },
      },
      async authorize(credentials) {
        try {
          const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';
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
            };
          } else {
            throw new Error(
              data.message || 'Authorization failed: Invalid credentials.'
            );
          }
        } catch (error) {
          throw new Error(`Authorization error: ${(error as Error).message}`);
        }
      },
    }),
  ],
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        return {
          ...token,
          document: user.document,
          name: user.name,
          lastName: user.lastName,
          role: user.role,
          access_token: user.token,
          team: user.team,
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
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        domain: process.env.NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_COOKIE_DOMAIN : 'localhost',
      }
    }
  },
  useSecureCookies: process.env.NODE_ENV === 'production'
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
