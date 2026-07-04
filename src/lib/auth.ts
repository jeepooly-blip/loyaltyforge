import { NextAuthOptions, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
          include: { memberships: { include: { organization: true } } },
        });
        if (!user) return null;

        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) return null;

        const membership = user.memberships[0];
        if (!membership) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? user.email,
          orgId: membership.organizationId,
          orgName: membership.organization.name,
          orgSlug: membership.organization.slug,
          role: membership.role,
        } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as any;
        token.userId = u.id;
        token.orgId = u.orgId;
        token.orgName = u.orgName;
        token.orgSlug = u.orgSlug;
        token.role = u.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.userId;
        (session.user as any).orgId = token.orgId;
        (session.user as any).orgName = token.orgName;
        (session.user as any).orgSlug = token.orgSlug;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
};

export function getAuthSession() {
  return getServerSession(authOptions);
}

/** Throws-free helper: returns the current session's org context, or null. */
export async function getCurrentOrgContext() {
  const session = await getAuthSession();
  if (!session?.user) return null;
  const u = session.user as any;
  return {
    userId: u.id as string,
    orgId: u.orgId as string,
    orgName: u.orgName as string,
    orgSlug: u.orgSlug as string,
    role: u.role as "OWNER" | "MANAGER" | "STAFF",
  };
}
