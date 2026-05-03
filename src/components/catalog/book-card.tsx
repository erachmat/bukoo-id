import Link from 'next/link'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Star, BookOpen } from 'lucide-react'
import type { MockBook } from '@/lib/data/mock-books'

interface BookCardProps {
  book: MockBook
}

export function BookCard({ book }: BookCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden h-full group hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 border-slate-100 bg-white">
      <Link href={`/book/${book.id}`} className="block relative overflow-hidden flex-1 shrink-0">
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center">
          <Button variant="secondary" size="sm" className="rounded-full shadow-2xl translate-y-8 group-hover:translate-y-0 transition-all duration-500 bg-white text-slate-900 font-bold px-6">
            <BookOpen className="w-4 h-4 mr-2" />
            Baca Sekarang
          </Button>
        </div>
        
        {/* Aspect Ratio container for Cover */}
        <div className="relative aspect-[2/3] w-full bg-slate-100">
          <img 
            src={book.coverUrl} 
            alt={book.title}
            className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700"
            loading="lazy"
          />
          <div className="absolute top-3 right-3 z-20 flex flex-col gap-2">
            {book.isPremium && (
              <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 shadow-lg border-0 font-black text-[9px] px-2 py-0.5 uppercase tracking-tighter">
                Premium
              </Badge>
            )}
            <Badge variant="secondary" className="shadow-md border-0 backdrop-blur-md bg-white/80 text-slate-900 font-bold text-[9px] px-2 py-0.5">
              {book.language}
            </Badge>
          </div>
        </div>
      </Link>
      
      <CardContent className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] text-[#00C9A7] font-black uppercase tracking-widest">{book.genre[0]}</span>
            <div className="flex items-center text-[10px] text-slate-400 font-bold">
              <Star className="w-3 h-3 text-amber-400 fill-amber-400 mr-1" />
              4.8
            </div>
          </div>
          <Link href={`/book/${book.id}`}>
            <h3 className="font-black text-xl leading-[1.2] line-clamp-2 group-hover:text-[#00C9A7] transition-colors text-slate-800">
              {book.title}
            </h3>
          </Link>
        </div>
        <p className="text-sm font-semibold text-slate-400 mt-3 line-clamp-1 italic">— {book.author}</p>
      </CardContent>
    </Card>
  )
}
