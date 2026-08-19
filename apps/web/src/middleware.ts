import NextAuth from "next-auth"
import { authConfig } from "./auth.config"
import { NextResponse, type NextRequest } from "next/server"

const { auth } = NextAuth(authConfig)

interface AuthUser {
  role?: string;
  name?: string | null;
  email?: string | null;
}

export default auth((req: NextRequest & { auth?: { user?: AuthUser } }) => {
  const { pathname } = req.nextUrl
  const host = req.headers.get("host") || ""
  const user = req.auth?.user as AuthUser | undefined
  const isPublisherHost = host.startsWith("publisher.") || host.includes("publisher.bukoo.id")

  // Rewrite static .html path aliases for publisher landing pages
  const htmlPublisherMap: Record<string, string> = {
    "/penerbit-daftar.html": "/publisher/daftar",
    "/penerbit-dashboard.html": "/publisher/dashboard",
    "/penerbit-royalti.html": "/publisher/royalti",
    "/penerbit-submit.html": "/publisher/submit",
    "/penerbit-panduan.html": "/publisher/panduan",
  }
  if (htmlPublisherMap[pathname]) {
    return NextResponse.rewrite(new URL(htmlPublisherMap[pathname], req.url))
  }

  // Handle requests on publisher.bukoo.id domain
  if (isPublisherHost) {
    if (user && user.role === "PUBLISHER" && (pathname === "/" || pathname === "/daftar" || pathname === "/publisher/daftar")) {
      return NextResponse.redirect(new URL("/publisher/dashboard", req.url))
    }

    // Redirect root / to /publisher/daftar
    if (pathname === "/") {
      return NextResponse.redirect(new URL("/publisher/daftar", req.url))
    }

    // Redirect short paths like /daftar, /royalti, /panduan, /dashboard to /publisher/*
    const shortPublisherPaths = ["/daftar", "/royalti", "/panduan", "/dashboard", "/submit", "/books"]
    if (shortPublisherPaths.includes(pathname)) {
      return NextResponse.redirect(new URL(`/publisher${pathname}`, req.url))
    }
  }

  // Redirect authenticated roles landing on public root or login page
  if (user) {
    if (user.role === "PUBLISHER" && (pathname === "/" || pathname === "/login")) {
      return NextResponse.redirect(new URL("/publisher/dashboard", req.url))
    }
    if (user.role === "ADMIN" && (pathname === "/" || pathname === "/login")) {
      return NextResponse.redirect(new URL("/admin", req.url))
    }
  }

  // Protected customer/reader routes
  if (pathname.startsWith("/library") || pathname.startsWith("/book")) {
    if (!user) {
      return NextResponse.redirect(new URL("/login", req.url))
    }
    if (pathname === "/library" && user.role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin", req.url))
    }
    if (pathname === "/library" && user.role === "PUBLISHER") {
      return NextResponse.redirect(new URL("/publisher/dashboard", req.url))
    }
  }

  // Admin routes: require ADMIN role
  if (pathname.startsWith("/admin")) {
    if (!user) {
      return NextResponse.redirect(new URL("/login", req.url))
    }
    if (user.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/library", req.url))
    }
  }

  // Protected publisher operations (e.g. books/new)
  if (pathname.startsWith("/publisher/books/new")) {
    if (!user) {
      return NextResponse.redirect(new URL("/login", req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
