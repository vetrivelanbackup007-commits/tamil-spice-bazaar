import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
 import { prisma } from "@/server/db";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })
  ],
  callbacks: {
    async session({ session, token }) {
      if (session?.user && token) {
        // Augment session.user with id and role
        // Types are augmented elsewhere in the project
        (session.user as any).id = (token as any).sub!;
        (session.user as any).role = (token as any).role as string;
      }
      return session;
    },
    async jwt({ user, token }) {
      if (user) {
        // Get user role from database
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email! },
          select: { role: true, id: true }
        });
        (token as any).role = dbUser?.role || 'USER';
        (token as any).id = dbUser?.id;
      }
      return token;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};
