import Link from 'next/link'
import { BookCard } from '@/components/catalog/book-card'
import { mockBooks } from '@/lib/data/mock-books'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Filter, SlidersHorizontal, LayoutGrid } from 'lucide-react'

export default function LibraryPage() {
  const genres = ["Semua", "Fiksi", "Sastra", "Bisnis", "Pengembangan Diri", "Sejarah", "Roman"]
  
  return (
    <div className="container mx-auto py-8 px-4 md:px-8">
      <div className="flex flex-col lg:flex-row gap-10">
        
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-72 shrink-0">
          <div className="sticky top-24 space-y-8 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center text-slate-800">
                <Filter className="w-5 h-5 mr-3 text-[#00C9A7]" />
                Filter
              </h2>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <SlidersHorizontal className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="space-y-8">
              <section>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-5">Kategori</h3>
                <div className="grid grid-cols-1 gap-4">
                  {genres.map((genre) => (
                    <div key={genre} className="flex items-center space-x-3 group cursor-pointer">
                      <Checkbox id={`genre-${genre}`} className="w-5 h-5 border-slate-300 data-[state=checked]:bg-[#00C9A7] data-[state=checked]:border-[#00C9A7]" />
                      <Label htmlFor={`genre-${genre}`} className="text-sm font-semibold text-slate-600 group-hover:text-[#00C9A7] transition-colors cursor-pointer">
                        {genre}
                      </Label>
                    </div>
                  ))}
                </div>
              </section>
              
              <Separator className="bg-slate-100" />
              
              <section>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-5">Tipe Akses</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 group cursor-pointer">
                    <Checkbox id="access-free" className="w-5 h-5 border-slate-300 data-[state=checked]:bg-[#00C9A7]" />
                    <Label htmlFor="access-free" className="text-sm font-semibold text-slate-600 group-hover:text-[#00C9A7] transition-colors cursor-pointer">Gratis</Label>
                  </div>
                  <div className="flex items-center space-x-3 group cursor-pointer">
                    <Checkbox id="access-premium" className="w-5 h-5 border-slate-300 data-[state=checked]:bg-[#00C9A7]" />
                    <Label htmlFor="access-premium" className="text-sm font-semibold text-slate-600 group-hover:text-[#00C9A7] transition-colors cursor-pointer flex items-center">
                      Premium <Badge className="ml-2 px-1.5 py-0 h-4 text-[9px] font-black bg-gradient-to-r from-amber-400 to-orange-500 text-white border-0">PRO</Badge>
                    </Label>
                  </div>
                </div>
              </section>
              
              <Separator className="bg-slate-100" />
              
              <section>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-5">Bahasa</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 group cursor-pointer">
                    <Checkbox id="lang-id" className="w-5 h-5 border-slate-300 data-[state=checked]:bg-[#00C9A7]" />
                    <Label htmlFor="lang-id" className="text-sm font-semibold text-slate-600 group-hover:text-[#00C9A7] transition-colors cursor-pointer">Indonesia</Label>
                  </div>
                  <div className="flex items-center space-x-3 group cursor-pointer">
                    <Checkbox id="lang-en" className="w-5 h-5 border-slate-300 data-[state=checked]:bg-[#00C9A7]" />
                    <Label htmlFor="lang-en" className="text-sm font-semibold text-slate-600 group-hover:text-[#00C9A7] transition-colors cursor-pointer">English</Label>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-6">
            <div className="space-y-2">
              <nav className="flex items-center text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                <Link href="/" className="hover:text-[#00C9A7] transition-colors">Beranda</Link>
                <span className="mx-2">/</span>
                <span className="text-slate-800">Katalog</span>
              </nav>
              <h1 className="text-5xl font-black tracking-tight text-slate-900 leading-none">Katalog Buku</h1>
              <p className="text-slate-500 text-lg font-medium">Temukan bacaan Anda selanjutnya dari {mockBooks.length} judul pilihan terbaik.</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-1 p-1 bg-slate-100 rounded-lg mr-2">
                <Button variant="ghost" size="icon" className="h-8 w-8 bg-white shadow-sm text-primary"><LayoutGrid className="w-4 h-4"/></Button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Urutkan</span>
                <Select defaultValue="terpopuler">
                  <SelectTrigger className="w-[180px] h-10 rounded-xl border-slate-200 bg-white font-semibold text-slate-700 focus:ring-primary/20">
                    <SelectValue placeholder="Urutkan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="terpopuler">Terpopuler</SelectItem>
                    <SelectItem value="terbaru">Terbaru</SelectItem>
                    <SelectItem value="rating">Rating Tertinggi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Mobile Filter Chips */}
          <div className="flex flex-wrap gap-2 mb-10 lg:hidden overflow-x-auto pb-2 no-scrollbar">
            <Badge className="px-5 py-2 rounded-full bg-[#00C9A7] hover:bg-[#00B899] text-white border-0 shadow-md transition-all font-bold">Semua</Badge>
            {["Fiksi", "Sastra", "Bisnis", "Sejarah", "Roman"].map(g => (
              <Badge key={g} variant="outline" className="px-5 py-2 rounded-full bg-white border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer transition-all font-bold whitespace-nowrap">{g}</Badge>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
            {mockBooks.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
            {/* Duplicate for demo purposes */}
            {mockBooks.map((book) => (
              <BookCard key={`${book.id}-copy`} book={{...book, id: `${book.id}-copy`}} />
            ))}
          </div>
          
          <div className="mt-16 flex justify-center pb-20">
            <Button variant="outline" className="h-12 px-10 rounded-full border-slate-200 font-bold hover:bg-slate-50 hover:text-primary transition-all shadow-sm">
              Muat Lebih Banyak Buku
            </Button>
          </div>
        </main>
      </div>
    </div>
  )
}
