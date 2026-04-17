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
    <Card className="flex flex-col overflow-hidden h-full group hover:shadow-lg transition-all duration-300 border-border/50">
      <Link href={`/book/${book.id}`} className="block relative overflow-hidden flex-1 shrink-0">
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center">
          <Button variant="secondary" size="sm" className="rounded-full shadow-xl translate-y-4 group-hover:translate-y-0 transition-all">
            <BookOpen className="w-4 h-4 mr-2" />
            Detail
          </Button>
        </div>
        
        {/* Aspect Ratio container for Cover */}
        <div className="relative aspect-[2/3] w-full bg-muted">
          <img 
            src={book.coverUrl} 
            alt={book.title}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute top-2 right-2 z-20 flex flex-col gap-2">
            {book.isPremium && (
              <Badge variant="default" className="bg-gradient-to-r from-yellow-500 to-amber-600 shadow-sm border-0">
                Premium
              </Badge>
            )}
            <Badge variant="secondary" className="shadow-sm border border-border/50 backdrop-blur-md bg-background/80">
              {book.language}
            </Badge>
          </div>
        </div>
      </Link>
      
      <CardContent className="p-4 flex-1">
        <div className="flex items-center justify-between space-x-2 mb-1">
          <span className="text-xs text-primary font-medium">{book.genre[0]}</span>
          <div className="flex items-center text-xs text-muted-foreground font-medium">
            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500 mr-1" />
            4.8
          </div>
        </div>
        <Link href={`/book/${book.id}`}>
          <h3 className="font-bold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {book.title}
          </h3>
        </Link>
        <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{book.author}</p>
      </CardContent>
    </Card>
  )
}
