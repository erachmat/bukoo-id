import Link from 'next/link'
import { LayoutDashboard, BookText, Users, Settings, LogOut } from 'lucide-react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-muted/20">
      <aside className="w-full md:w-64 bg-background border-r flex flex-col">
        <div className="h-16 flex items-center px-6 border-b">
          <Link href="/admin">
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              BUKOO<span className="text-foreground ml-1 text-sm font-normal uppercase tracking-widest">Admin</span>
            </span>
          </Link>
        </div>
        
        <nav className="flex-1 py-6 px-4 space-y-1">
          <Link href="/admin" className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            <LayoutDashboard className="w-5 h-5" />
            <span className="font-medium">Dashboard</span>
          </Link>
          <Link href="/admin/books" className="flex items-center space-x-3 px-3 py-2.5 rounded-lg bg-primary/10 text-primary transition-colors">
            <BookText className="w-5 h-5" />
            <span className="font-medium">Kelola Buku</span>
          </Link>
          <Link href="/admin/users" className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            <Users className="w-5 h-5" />
            <span className="font-medium">Pengguna</span>
          </Link>
          <Link href="/admin/settings" className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            <Settings className="w-5 h-5" />
            <span className="font-medium">Pengaturan</span>
          </Link>
        </nav>
        
        <div className="p-4 border-t">
          <button className="flex w-full items-center space-x-3 px-3 py-2.5 rounded-lg text-destructive hover:bg-destructive/10 transition-colors">
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Keluar</span>
          </button>
        </div>
      </aside>
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
