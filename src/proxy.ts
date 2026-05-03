import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export const proxy = auth((req) => {
  const { pathname } = req.nextUrl
  const user = req.auth?.user

  // Protected routes: redirect to login if not authenticated
  if (pathname.startsWith("/library") || pathname.startsWith("/book")) {
    if (!user) {
      return NextResponse.redirect(new URL("/login", req.url))
    }
  }

  // Admin routes: require ADMIN role
  if (pathname.startsWith("/admin")) {
    if (!user) {
      return NextResponse.redirect(new URL("/login", req.url))
    }
    if ((user as any).role !== "ADMIN") {
      return NextResponse.redirect(new URL("/library", req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
