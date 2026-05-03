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
      <header className="sticky top-0 z-50 w-full border-b bg-[#00181A] text-white shadow-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-[#00C9A7] to-blue-400 bg-clip-text text-transparent">
              BUKOO
            </span>
          </Link>
          
          <div className="hidden md:flex flex-1 items-center justify-center px-6">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="search"
                placeholder="Cari judul, penulis, atau penerbit..."
                className="flex h-10 w-full rounded-full border-none bg-white/10 px-4 py-2 pl-10 text-sm text-white placeholder:text-gray-500 focus:bg-white/20 focus:outline-none focus:ring-1 focus:ring-[#00C9A7] transition-all"
              />
            </div>
          </div>

          <nav className="flex items-center space-x-4">
            <Link href="/library">
              <Button variant="ghost" size="sm" className="hidden sm:flex text-gray-300 hover:text-white hover:bg-white/10">
                <BookOpen className="h-4 w-4 mr-2" />
                Library
              </Button>
            </Link>
            <Link href="/account">
              <Button variant="ghost" size="icon" className="rounded-full text-gray-300 hover:text-white hover:bg-white/10">
                <User className="h-5 w-5" />
                <span className="sr-only">Akun Saya</span>
              </Button>
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 bg-[#F8FAFC]">{children}</main>
    </div>
  )
}
