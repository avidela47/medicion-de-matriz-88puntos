import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { getDb } from '../../../lib/mongodb';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credenciales',
      credentials: {
        username: { label: 'Usuario', type: 'text' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;
        const db = await getDb();
        const user = await db.collection('users').findOne({
          username: credentials.username.trim().toLowerCase(),
        });
        if (!user) return null;
        const ok = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!ok) return null;
        return {
          id: user._id.toString(),
          name: user.nombre || user.username,
          username: user.username,
        };
      },
    }),
  ],
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.username = user.username;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        name: token.name ?? null,
        username: token.username ?? null,
      };
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);