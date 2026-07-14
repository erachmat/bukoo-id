import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req: any) => {
  const { pathname } = req.nextUrl
  const user = req.auth?.user

  // Redirect authenticated roles landing on public root or login page
  if (user) {
    if ((user as any).role === "PUBLISHER" && (pathname === "/" || pathname === "/login")) {
      return NextResponse.redirect(new URL("/publisher/dashboard", req.url))
    }
    if ((user as any).role === "ADMIN" && (pathname === "/" || pathname === "/login")) {
      return NextResponse.redirect(new URL("/admin", req.url))
    }
  }

  // Protected customer/reader routes
  if (pathname.startsWith("/library") || pathname.startsWith("/book")) {
    if (!user) {
      return NextResponse.redirect(new URL("/login", req.url))
    }
    // Redirect ADMINs or PUBLISHERs away from user library
    if (pathname === "/library" && (user as any).role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin", req.url))
    }
    if (pathname === "/library" && (user as any).role === "PUBLISHER") {
      return NextResponse.redirect(new URL("/publisher/dashboard", req.url))
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

  // Publisher routes: require PUBLISHER role
  if (pathname.startsWith("/publisher")) {
    if (!user) {
      return NextResponse.redirect(new URL("/login", req.url))
    }
    if ((user as any).role !== "PUBLISHER") {
      return NextResponse.redirect(new URL("/library", req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
