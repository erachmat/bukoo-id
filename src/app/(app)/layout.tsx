import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Search, User, BookOpen } from 'lucide-react'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 px-4">
            <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              BUKOO
            </span>
          </Link>
          
          <div className="hidden md:flex flex-1 items-center justify-center px-6">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="Cari judul, penulis, atau penerbit..."
                className="flex h-9 w-full rounded-full border border-input bg-muted/50 px-3 py-1 pl-9 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>

          <nav className="flex items-center space-x-2 sm:space-x-4 pr-4">
            <Link href="/library">
              <Button variant="ghost" size="sm" className="hidden sm:flex text-muted-foreground hover:text-foreground">
                <BookOpen className="h-4 w-4 mr-2" />
                Library
              </Button>
            </Link>
            <Link href="/account">
              <Button variant="outline" size="icon" className="rounded-full">
                <User className="h-4 w-4" />
                <span className="sr-only">Akun Saya</span>
              </Button>
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  )
}
