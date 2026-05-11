'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Settings, Moon, Sun, FileWarning, Bookmark } from 'lucide-react'
import EpubViewer from './epub-viewer'
import PdfViewer from './pdf-viewer'

interface ReaderShellProps {
  book: {
    id: string
    title: string
    fileUrl: string | null
    fileType: 'EPUB' | 'PDF'
  }
  initialLocation?: string | null
}

export default function ReaderShell({ book, initialLocation }: ReaderShellProps) {
  const [showSettings, setShowSettings] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark' | 'sepia'>('sepia')
  const [chapter, setChapter] = useState<string>('Memuat...')

  if (!book.fileUrl) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex items-center justify-center p-6 text-center">
        <div>
          <FileWarning className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">File Tidak Ditemukan</h2>
          <p className="text-muted-foreground mb-6">Maaf, tautan baca buku ini tidak tersedia saat ini.</p>
          <Link href={`/book/${book.id}`}>
            <Button variant="default">Kembali</Button>
          </Link>
        </div>
      </div>
    )
  }

  const shellBg = theme === 'dark' ? 'bg-[#0f172a] text-white border-slate-800' : theme === 'sepia' ? 'bg-[#fbf0d9] text-[#43302b] border-[#e8dcc3]' : 'bg-white text-slate-900 border-slate-200'

  return (
    <div className={`fixed inset-0 z-50 flex flex-col ${shellBg} transition-colors duration-300`}>
      {/* Top Navigation Bar */}
      <div className={`h-16 border-b flex items-center justify-between px-4 z-10 shrink-0 ${shellBg}`}>
        <Link href={`/book/${book.id}`}>
          <Button variant="ghost" size="icon" className="shrink-0 text-inherit hover:bg-black/5 dark:hover:bg-white/10">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        
        <div className="flex-1 flex flex-col items-center justify-center truncate px-4">
          <div className="font-bold text-[15px] truncate max-w-full">{book.title}</div>
          <div className="text-xs opacity-60 truncate max-w-full">{chapter}</div>
        </div>
        
        <div className="flex items-center shrink-0">
          <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-black/5 dark:hover:bg-white/10">
            <Bookmark className="w-5 h-5 fill-current" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setShowSettings(!showSettings)} className="text-inherit hover:bg-black/5 dark:hover:bg-white/10">
            <Sun className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Settings Dropdown */}
      {showSettings && (
        <div className={`absolute top-16 right-4 w-64 border rounded-lg shadow-xl p-4 z-20 animate-in slide-in-from-top-2 ${theme === 'dark' ? 'bg-[#1e293b] border-slate-700' : 'bg-white border-slate-200'}`}>
          <h4 className={`font-semibold text-sm mb-3 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Tampilan</h4>
          <div className="flex gap-2">
            <Button 
              variant={theme === 'light' ? 'default' : 'outline'} 
              size="sm" 
              className="flex-1"
              onClick={() => setTheme('light')}
            >
              <Sun className="w-4 h-4 mr-1" /> Terang
            </Button>
            <Button 
              variant={theme === 'sepia' ? 'default' : 'outline'} 
              size="sm" 
              className="flex-1 bg-[#fbf0d9] text-amber-900 border-amber-200 hover:bg-[#f3e3c3] hover:text-amber-900"
              onClick={() => setTheme('sepia')}
            >
              Sepia
            </Button>
            <Button 
              variant={theme === 'dark' ? 'default' : 'outline'} 
              size="sm" 
              className="flex-1"
              onClick={() => setTheme('dark')}
            >
              <Moon className="w-4 h-4 mr-1" /> Gelap
            </Button>
          </div>
        </div>
      )}

      {/* Modular Reader Area */}
      <div className="flex-1 relative overflow-hidden">
        {book.fileType === 'PDF' ? (
          <PdfViewer 
            bookId={book.id} 
            fileUrl={book.fileUrl} 
            initialLocation={initialLocation}
            theme={theme}
            onChapterChange={setChapter}
          />
        ) : (
          <EpubViewer 
            bookId={book.id} 
            fileUrl={book.fileUrl} 
            initialLocation={initialLocation}
            theme={theme}
            onChapterChange={setChapter}
          />
        )}
      </div>
    </div>
  )
}
