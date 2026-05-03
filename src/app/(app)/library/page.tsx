import { BookCard } from '@/components/catalog/book-card'
import { mockBooks } from '@/lib/data/mock-books'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Filter, SlidersHorizontal } from 'lucide-react'

export default function LibraryPage() {
  const genres = ["Semua", "Fiksi", "Non-Fiksi", "Sastra", "Pengembangan Diri", "Bisnis", "Sejarah", "Roman"]
  
  return (
    <div className="container py-8 px-4 md:px-6">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Filters */}
        <aside className="w-full md:w-64 shrink-0 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center text-slate-800">
              <Filter className="w-5 h-5 mr-2.5 text-[#00C9A7]" />
              Filter
            </h2>
            <Button variant="ghost" size="icon" className="md:hidden">
              <SlidersHorizontal className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="hidden md:block space-y-8">
            <section>
              <h3 className="font-bold text-sm text-slate-400 uppercase tracking-wider mb-4">Kategori</h3>
              <div className="space-y-3">
                {genres.map((genre) => (
                  <label key={genre} className="flex items-center group cursor-pointer">
                    <input type="checkbox" className="w-5 h-5 rounded-md border-slate-300 text-[#00C9A7] focus:ring-[#00C9A7] transition-all cursor-pointer" />
                    <span className="ml-3 text-sm font-semibold text-slate-600 group-hover:text-[#00C9A7] transition-colors">
                      {genre}
                    </span>
                  </label>
                ))}
              </div>
            </section>
            
            <Separator className="bg-slate-200" />
            
            <section>
              <h3 className="font-bold text-sm text-slate-400 uppercase tracking-wider mb-4">Tipe Akses</h3>
              <div className="space-y-3">
                <label className="flex items-center group cursor-pointer">
                  <input type="checkbox" className="w-5 h-5 rounded-md border-slate-300 text-[#00C9A7] focus:ring-[#00C9A7] transition-all cursor-pointer" />
                  <span className="ml-3 text-sm font-semibold text-slate-600 group-hover:text-[#00C9A7] transition-colors">Gratis</span>
                </label>
                <label className="flex items-center group cursor-pointer">
                  <input type="checkbox" className="w-5 h-5 rounded-md border-slate-300 text-[#00C9A7] focus:ring-[#00C9A7] transition-all cursor-pointer" />
                  <span className="ml-3 text-sm font-semibold text-slate-600 group-hover:text-[#00C9A7] transition-colors flex items-center">
                    Premium <Badge className="ml-2 px-2 py-0 h-4 text-[9px] font-black bg-gradient-to-r from-amber-400 to-orange-500 text-white border-0 shadow-sm">PRO</Badge>
                  </span>
                </label>
              </div>
            </section>
            
            <Separator className="bg-slate-200" />
            
            <section>
              <h3 className="font-bold text-sm text-slate-400 uppercase tracking-wider mb-4">Bahasa</h3>
              <div className="space-y-3">
                <label className="flex items-center group cursor-pointer">
                  <input type="checkbox" className="w-5 h-5 rounded-md border-slate-300 text-[#00C9A7] focus:ring-[#00C9A7] transition-all cursor-pointer" />
                  <span className="ml-3 text-sm font-semibold text-slate-600 group-hover:text-[#00C9A7] transition-colors">Indonesia</span>
                </label>
                <label className="flex items-center group cursor-pointer">
                  <input type="checkbox" className="w-5 h-5 rounded-md border-slate-300 text-[#00C9A7] focus:ring-[#00C9A7] transition-all cursor-pointer" />
                  <span className="ml-3 text-sm font-semibold text-slate-600 group-hover:text-[#00C9A7] transition-colors">English</span>
                </label>
              </div>
            </section>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <nav className="flex text-xs font-medium text-muted-foreground mb-2 space-x-2">
                <Link href="/" className="hover:text-primary transition-colors">Beranda</Link>
                <span>/</span>
                <span className="text-foreground">Katalog</span>
              </nav>
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Katalog Buku</h1>
              <p className="text-slate-500 mt-2 text-lg">Temukan bacaan Anda selanjutnya dari {mockBooks.length} judul pilihan.</p>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-slate-600 whitespace-nowrap">Urutkan:</span>
              <select className="h-10 rounded-xl border-slate-200 bg-white px-4 py-1 text-sm font-medium shadow-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer">
                <option>Terpopuler</option>
                <option>Terbaru</option>
                <option>Penilaian Tertinggi</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-8 md:hidden">
            <Badge className="px-4 py-1.5 rounded-full bg-[#00C9A7] hover:bg-[#00B899] text-white border-0 shadow-sm transition-all">Semua</Badge>
            {["Fiksi", "Sastra", "Bisnis"].map(g => (
              <Badge key={g} variant="outline" className="px-4 py-1.5 rounded-full bg-white border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer transition-all">{g}</Badge>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
            {mockBooks.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
            {/* Duplicate for demo purposes to fill up grid */}
            {mockBooks.map((book) => (
              <BookCard key={`${book.id}-copy`} book={{...book, id: `${book.id}-copy`}} />
            ))}
          </div>
          
          <div className="mt-12 flex justify-center">
            <Button variant="outline" className="w-full sm:w-auto">
              Muat Lebih Banyak
            </Button>
          </div>
        </main>
      </div>
    </div>
  )
}
