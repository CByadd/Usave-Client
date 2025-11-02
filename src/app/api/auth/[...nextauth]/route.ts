import NextAuth, { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
    };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        token: { label: "Token", type: "string" }
      } as const,
      async authorize(credentials) {
        if (!credentials?.email) {
          return null;
        }

        try {
          // Get API URL - use HTTP for localhost, HTTPS for production
          const getApiUrl = () => {
            if (process.env.NEXT_PUBLIC_API_URL) {
              return process.env.NEXT_PUBLIC_API_URL;
            }
            // Development: use HTTP (no SSL) for localhost
            return 'http://localhost:3001/api';
          };
          const apiUrl = getApiUrl();

          // Handle token-based login
          if (credentials.token) {
            const response = await fetch(`${apiUrl}/auth/verify-token`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: credentials.email,
                token: credentials.token,
              }),
            });

            if (!response.ok) return null;
            const user = await response.json();
            
            return {
              id: user.id,
              email: user.email,
              name: user.name || `${user.firstName} ${user.lastName}`,
              role: user.role,
            };
          }

          // Handle email/password login
          if (credentials.password) {
            const response = await fetch(`${apiUrl}/auth/login`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: credentials.email,
                password: credentials.password,
              }),
            });

            if (!response.ok) return null;
            const user = await response.json();
            
            return {
              id: user.id,
              email: user.email,
              name: user.name || `${user.firstName} ${user.lastName}`,
              role: user.role,
            };
          }

          return null;
        } catch (error) {
          console.error('Authentication error:', error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Type assertion to include role in the user object
        const userWithRole = user as { id: string; role: string };
        token.role = userWithRole.role;
        token.id = userWithRole.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
