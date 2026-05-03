import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { prismaBookToCatalogBook } from '@/lib/data/book-mapper'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Star, BookOpen, Globe, ArrowLeft, BookmarkPlus, Share2 } from 'lucide-react'

export default async function BookDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const row = await prisma.book.findUnique({
    where: { id: resolvedParams.id },
  })
  if (!row || !row.isPublished) notFound()

  const book = prismaBookToCatalogBook(row)

  return (
    <div className="w-full max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-10">
      <Link
        href="/library"
        className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-8 transition-colors"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Kembali ke Katalog
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(240px,320px)_minmax(0,1fr)] gap-10 lg:gap-14 lg:items-start">
        {/* Cover */}
        <div className="w-full max-w-[320px] mx-auto lg:mx-0 lg:sticky lg:top-24 lg:self-start">
          <div className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-2xl border">
            <img
              src={book.coverUrl || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600&auto=format&fit=crop'}
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

        {/* Details */}
        <div className="min-w-0 space-y-6 w-full">
          <div>
            <div className="flex flex-wrap gap-2 mb-3">
              {book.genre.map((g) => (
                <Badge key={g} variant="secondary" className="bg-primary/10 text-primary border-primary/20">{g}</Badge>
              ))}
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-2 text-pretty">{book.title}</h1>
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
              <span>{book.language === 'ID' ? 'Indonesia' : 'Inggris'} ({book.year || '—'})</span>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="font-bold text-lg">Sinopsis</h3>
            <p className="max-w-prose text-muted-foreground leading-relaxed text-pretty">
              {book.description || '—'}
            </p>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row gap-4">
            <Link
              href={`/book/${resolvedParams.id}/read`}
              className="inline-flex h-14 shrink-0 items-center justify-center rounded-full bg-primary px-10 text-base font-bold text-primary-foreground shadow-lg transition hover:bg-primary/90 hover:shadow-xl w-full sm:w-auto text-center"
            >
              Mulai Baca Sekarang
            </Link>

            <div className="flex gap-4">
              <Button size="lg" variant="outline" className="h-14 w-14 rounded-full p-0 flex-shrink-0" type="button">
                <BookmarkPlus className="h-5 w-5" />
                <span className="sr-only">Simpan kelist</span>
              </Button>
              <Button size="lg" variant="outline" className="h-14 w-14 rounded-full p-0 flex-shrink-0" type="button">
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
