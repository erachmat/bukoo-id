import Link from 'next/link'
import { mockBooks } from '@/lib/data/mock-books'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Star, BookOpen, Clock, Globe, ArrowLeft, BookmarkPlus, Share2 } from 'lucide-react'

// Next.js standard async paramenters for dynamic routes in App Router
export default async function BookDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const book = mockBooks.find((b) => b.id.includes(resolvedParams.id.split('-copy')[0])) || mockBooks[0]
  
  return (
    <div className="container py-8 px-4 md:px-8 max-w-5xl mx-auto">
      <Link href="/library" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-8 transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Kembali ke Katalog
      </Link>
      
      <div className="flex flex-col md:flex-row gap-10">
        {/* Left Column: Cover */}
        <div className="w-full md:w-1/3 max-w-[300px] shrink-0 mx-auto md:mx-0">
          <div className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-2xl border">
            <img 
              src={book.coverUrl} 
              alt={book.title}
              className="object-cover w-full h-full"
            />
            {book.isPremium && (
              <div className="absolute top-3 right-3">
                <Badge variant="default" className="bg-gradient-to-r from-yellow-500 to-amber-600 shadow-sm border-0 font-bold tracking-wide">
                  PREMIUM
                </Badge>
              </div>
            )}
          </div>
        </div>
        
        {/* Right Column: Details */}
        <div className="flex-1 space-y-6">
          <div>
            <div className="flex flex-wrap gap-2 mb-3">
              {book.genre.map((g) => (
                <Badge key={g} variant="secondary" className="bg-primary/10 text-primary border-primary/20">{g}</Badge>
              ))}
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-2 text-balance">{book.title}</h1>
            <p className="text-xl text-muted-foreground">Oleh <span className="text-foreground font-medium">{book.author}</span></p>
          </div>
          
          <div className="flex flex-wrap gap-6 text-sm">
            <div className="flex items-center">
              <Star className="mr-2 h-5 w-5 text-yellow-500 fill-yellow-500" />
              <span className="font-bold text-base mr-1">4.8</span>
              <span className="text-muted-foreground">({(book.readCount / 1000).toFixed(1)}k ulasan)</span>
            </div>
            <div className="flex items-center text-muted-foreground">
              <BookOpen className="mr-2 h-5 w-5" />
              <span>{book.pageCount} halaman</span>
            </div>
            <div className="flex items-center text-muted-foreground">
              <Globe className="mr-2 h-5 w-5" />
              <span>{book.language === 'ID' ? 'Indonesia' : 'Inggris'} ({book.year})</span>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <h3 className="font-bold text-lg">Sinopsis</h3>
            <p className="text-muted-foreground leading-relaxed text-balance">
              {book.description}
            </p>
          </div>
          
          <div className="pt-6 flex flex-col sm:flex-row gap-4">
            <Link href={`/book/${resolvedParams.id}/read`} className="flex-1 sm:flex-none">
              <Button size="lg" className="w-full sm:w-auto h-14 px-10 rounded-full text-base font-bold shadow-lg hover:shadow-xl transition-all">
                Mulai Baca Sekarang
              </Button>
            </Link>
            
            <div className="flex gap-4">
              <Button size="lg" variant="outline" className="h-14 w-14 rounded-full p-0 flex-shrink-0">
                <BookmarkPlus className="h-5 w-5" />
                <span className="sr-only">Simpan kelist</span>
              </Button>
              <Button size="lg" variant="outline" className="h-14 w-14 rounded-full p-0 flex-shrink-0">
                <Share2 className="h-5 w-5" />
                <span className="sr-only">Bagikan</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
