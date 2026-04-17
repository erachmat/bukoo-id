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
        <aside className="w-full md:w-64 shrink-0 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </h2>
            <Button variant="ghost" size="icon" className="md:hidden">
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="hidden md:block space-y-6">
            <div>
              <h3 className="font-medium text-sm mb-3">Kategori</h3>
              <div className="space-y-2">
                {genres.map((genre) => (
                  <div key={genre} className="flex items-center space-x-2">
                    <input type="checkbox" id={`genre-${genre}`} className="rounded border-gray-300 text-primary shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50" />
                    <label htmlFor={`genre-${genre}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      {genre}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="font-medium text-sm mb-3">Tipe Akses</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="access-free" className="rounded" />
                  <label htmlFor="access-free" className="text-sm">Gratis</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="access-premium" className="rounded text-primary" />
                  <label htmlFor="access-premium" className="text-sm flex items-center">
                    Premium <Badge className="ml-2 h-4 text-[10px] bg-yellow-500 hover:bg-yellow-600 border-0">PRO</Badge>
                  </label>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="font-medium text-sm mb-3">Bahasa</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="lang-id" className="rounded" />
                  <label htmlFor="lang-id" className="text-sm">Indonesia</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="lang-en" className="rounded" />
                  <label htmlFor="lang-en" className="text-sm">English</label>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Katalog Buku</h1>
              <p className="text-muted-foreground mt-1">Temukan bacaan Anda selanjutnya dari {mockBooks.length} judul.</p>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground mr-2 whitespace-nowrap">Urutkan:</span>
              <select className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                <option>Terpopuler</option>
                <option>Terbaru</option>
                <option>Penilaian Tertinggi</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-6 md:hidden">
            <Badge variant="secondary" className="px-3 py-1 bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer">Semua</Badge>
            <Badge variant="outline" className="px-3 py-1 cursor-pointer">Fiksi</Badge>
            <Badge variant="outline" className="px-3 py-1 cursor-pointer">Sastra</Badge>
            <Badge variant="outline" className="px-3 py-1 cursor-pointer">Pengembangan Diri</Badge>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 xl:gap-6">
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
