import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt" },
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
    async jwt({ token }) {
      if (token.sub) {
        const u = await prisma.user.findUnique({ where: { id: token.sub } });
        if (u) {
          token.role = u.role;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.role) {
        session.user.role = token.role as string;
      }
      return session;
    }
  }
});