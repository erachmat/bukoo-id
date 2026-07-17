import type { NextAuthConfig } from "next-auth"

export const authConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role || "USER"
      }
      return token
    },
    async session({ session, token }: { session: any, token: any }) {
      if (session.user) {
        session.user.id = token.sub
        session.user.role = token.role
      }
      return session
    },
  },
  providers: [], // Empty array for middleware/edge compatibility, overridden in auth.ts
} satisfies NextAuthConfig
