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
          const res = await fetch('http://localhost:3000/api/auth/login', {
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
              document: data.document,
              name: data.name,
              lastName: data.lastName,
              role: data.role,
              token: data.token,
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
  },
  session: { strategy: 'jwt' },
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
      };
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
