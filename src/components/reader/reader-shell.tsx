'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Settings, Moon, Sun, FileWarning } from 'lucide-react'
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
  const [theme, setTheme] = useState<'light' | 'dark' | 'sepia'>('light')

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

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* Top Navigation Bar */}
      <div className="h-14 border-b bg-background/95 backdrop-blur flex items-center justify-between px-4 z-10 shrink-0">
        <Link href={`/book/${book.id}`}>
          <Button variant="ghost" size="sm" className="text-muted-foreground mr-2">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Tutup
          </Button>
        </Link>
        <div className="font-medium text-sm text-center flex-1 truncate px-4">
          {book.title}
        </div>
        <Button variant="ghost" size="icon" onClick={() => setShowSettings(!showSettings)}>
          <Settings className="w-5 h-5 text-muted-foreground" />
        </Button>
      </div>

      {/* Settings Dropdown */}
      {showSettings && (
        <div className="absolute top-16 right-4 w-64 bg-background border rounded-lg shadow-xl p-4 z-20 animate-in slide-in-from-top-2">
          <h4 className="font-semibold text-sm mb-3">Tampilan</h4>
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
          />
        ) : (
          <EpubViewer 
            bookId={book.id} 
            fileUrl={book.fileUrl} 
            initialLocation={initialLocation}
            theme={theme}
          />
        )}
      </div>
    </div>
  )
}
