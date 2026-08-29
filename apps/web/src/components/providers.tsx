'use client'

import { SessionProvider } from "next-auth/react"
import type { Session } from "next-auth"
import { ThemeProvider } from "@/components/theme/theme-provider"

export function Providers({ children, session }: { children: React.ReactNode, session: Session | null }) {
  return (
    <SessionProvider session={session} refetchOnWindowFocus={false} refetchInterval={0}>
      <ThemeProvider>{children}</ThemeProvider>
    </SessionProvider>
  )
}
