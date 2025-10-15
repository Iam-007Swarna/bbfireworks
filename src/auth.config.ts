import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/auth/login",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: { email: {}, password: {} },
      authorize: async (creds) => {
        const email = (creds?.email ?? "").toString().toLowerCase().trim();
        const password = (creds?.password ?? "").toString();
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;
        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;
        return { id: user.id, email: user.email, name: user.name ?? "", role: user.role };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      // Initial sign in - populate token with user data
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }

      // Only refresh role from database if explicitly triggered (e.g., profile update)
      // This reduces unnecessary database queries on every request
      if (trigger === "update" && token.sub) {
        const u = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { role: true }
        });
        if (u) {
          token.role = u.role;
        }
      }

      return token;
    },
    async session({ session, token }) {
      // Populate session with token data
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.role = token.role as string;
      }
      return session;
    }
  }
});