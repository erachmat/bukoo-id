import type { NextAuthConfig } from "next-auth"

export const authConfig = {
  session: { strategy: "jwt" },
  // Required when not hosted on Vercel (Cloudflare Workers) so NextAuth trusts
  // the incoming Host header for redirect/callback URLs.
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized() {
      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role || "USER"
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string
        (session.user as { role?: string }).role = token.role as string
      }
      return session
    },
  },
  providers: [], // Empty array for middleware/edge compatibility, overridden in auth.ts
} satisfies NextAuthConfig
