'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Settings, Moon, Sun, FileWarning, Bookmark, Trash2, X } from 'lucide-react'

// epubjs (react-reader) and pdf.js (react-pdf) rely on browser-only APIs such
// as DOMMatrix, which are not available in the Workers runtime during SSR.
// Load both only on the client to avoid "ReferenceError: DOMMatrix is not
// defined".
const EpubViewer = dynamic(() => import('./epub-viewer'), { ssr: false })
const PdfViewer = dynamic(() => import('./pdf-viewer'), { ssr: false })

interface ReaderShellProps {
  book: {
    id: string
    title: string
    fileUrl: string | null
    fileType: 'EPUB' | 'PDF'
  }
  initialLocation?: string | null
}

interface BookmarkItem {
  id: string
  location: string
  label: string
  createdAt: number
}

interface HighlightItem {
  id: string
  cfiRange: string
  text: string
  note?: string
  color: string
  createdAt: number
}

export default function ReaderShell({ book, initialLocation }: ReaderShellProps) {
  const [location, setLocation] = useState<string | number>(initialLocation || (book.fileType === 'PDF' ? 1 : 0))
  const [showSidebar, setShowSidebar] = useState(false)
  const [activeTab, setActiveTab] = useState<'tampilan' | 'bookmarks' | 'sorotan'>('tampilan')
  const [theme, setTheme] = useState<'light' | 'dark' | 'sepia'>('sepia')
  
  // Typography states
  const [fontSize, setFontSize] = useState<string>('100%')
  const [fontFamily, setFontFamily] = useState<string>('serif')

  // Annotations lists
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([])
  const [highlights, setHighlights] = useState<HighlightItem[]>([])

  // Selection states
  const [selectedText, setSelectedText] = useState<{ cfiRange: string; text: string } | null>(null)
  const [selectedColor, setSelectedColor] = useState<string>('rgba(250,204,21,0.4)')
  const [selectedNote, setSelectedNote] = useState<string>('')

  const [chapter, setChapter] = useState<string>('Memuat...')

  // Load configuration and data from LocalStorage
  useEffect(() => {
    const storedSettings = localStorage.getItem('bukoo-reader-settings')
    if (storedSettings) {
      try {
        const parsed = JSON.parse(storedSettings)
        if (parsed.theme) setTheme(parsed.theme)
        if (parsed.fontSize) setFontSize(parsed.fontSize)
        if (parsed.fontFamily) setFontFamily(parsed.fontFamily)
      } catch (e) {}
    }

    const storedBm = localStorage.getItem(`bukoo-bookmarks-${book.id}`)
    if (storedBm) {
      try {
        setBookmarks(JSON.parse(storedBm))
      } catch (e) {}
    }

    const storedHl = localStorage.getItem(`bukoo-highlights-${book.id}`)
    if (storedHl) {
      try {
        setHighlights(JSON.parse(storedHl))
      } catch (e) {}
    }
  }, [book.id])

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

  // Update specific setting in LocalStorage
  const updateSettings = (key: string, value: string) => {
    const current = localStorage.getItem('bukoo-reader-settings')
    let parsed = {}
    if (current) {
      try { parsed = JSON.parse(current) } catch (e) {}
    }
    const updated = { ...parsed, [key]: value }
    localStorage.setItem('bukoo-reader-settings', JSON.stringify(updated))
  }

  const decreaseFontSize = () => {
    const sizeInt = parseInt(fontSize, 10)
    const newSize = Math.max(80, sizeInt - 10) + '%'
    setFontSize(newSize)
    updateSettings('fontSize', newSize)
  }

  const increaseFontSize = () => {
    const sizeInt = parseInt(fontSize, 10)
    const newSize = Math.min(180, sizeInt + 10) + '%'
    setFontSize(newSize)
    updateSettings('fontSize', newSize)
  }

  const handleSetTheme = (newTheme: 'light' | 'dark' | 'sepia') => {
    setTheme(newTheme)
    updateSettings('theme', newTheme)
  }

  const handleSetFontFamily = (newFont: string) => {
    setFontFamily(newFont)
    updateSettings('fontFamily', newFont)
  }

  // Bookmarking helpers
  const isBookmarked = bookmarks.some((bm) => bm.location.toString() === location.toString())

  const toggleBookmark = () => {
    const locStr = location.toString()
    const found = bookmarks.find((bm) => bm.location.toString() === locStr)
    if (found) {
      removeBookmark(found.id)
    } else {
      const label = book.fileType === 'PDF' 
        ? `Halaman ${locStr}` 
        : `${chapter === 'Memuat...' ? 'Lokasi' : chapter} (${locStr.substring(0, 10)}...)`
      
      const newBm: BookmarkItem = {
        id: Date.now().toString(),
        location: locStr,
        label,
        createdAt: Date.now()
      }
      const updated = [newBm, ...bookmarks]
      setBookmarks(updated)
      localStorage.setItem(`bukoo-bookmarks-${book.id}`, JSON.stringify(updated))
    }
  }

  const removeBookmark = (id: string) => {
    const updated = bookmarks.filter((bm) => bm.id !== id)
    setBookmarks(updated)
    localStorage.setItem(`bukoo-bookmarks-${book.id}`, JSON.stringify(updated))
  }

  // Highlights & Notes helpers
  const addHighlight = () => {
    if (!selectedText) return
    const newHl: HighlightItem = {
      id: Date.now().toString(),
      cfiRange: selectedText.cfiRange,
      text: selectedText.text,
      color: selectedColor,
      note: selectedNote.trim() ? selectedNote.trim() : undefined,
      createdAt: Date.now()
    }
    const updated = [newHl, ...highlights]
    setHighlights(updated)
    localStorage.setItem(`bukoo-highlights-${book.id}`, JSON.stringify(updated))
    
    // Clear selection state
    setSelectedText(null)
    setSelectedNote('')
  }

  const removeHighlight = (id: string) => {
    const updated = highlights.filter((hl) => hl.id !== id)
    setHighlights(updated)
    localStorage.setItem(`bukoo-highlights-${book.id}`, JSON.stringify(updated))
  }

  const shellBg = 
    theme === 'dark' ? 'bg-[#0f172a] text-white border-slate-800' : 
    theme === 'sepia' ? 'bg-[#fbf0d9] text-[#43302b] border-[#e8dcc3]' : 
    'bg-white text-slate-900 border-slate-200'

  return (
    <div className={`fixed inset-0 z-50 flex flex-col ${shellBg} transition-colors duration-300`}>
      
      {/* Top Navbar */}
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
        
        <div className="flex items-center gap-1 shrink-0">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleBookmark} 
            className={`hover:bg-black/5 dark:hover:bg-white/10 ${
              isBookmarked ? 'text-[#00C9A7]' : 'text-inherit opacity-60'
            }`}
          >
            <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setShowSidebar(true)} 
            className="text-inherit opacity-80 hover:bg-black/5 dark:hover:bg-white/10"
          >
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Slide-Over Drawer / Sidebar */}
      {showSidebar && (
        <>
          <div 
            className="fixed inset-0 bg-black/40 z-30 transition-opacity duration-300"
            onClick={() => setShowSidebar(false)}
          />
          
          <div className={`fixed right-0 top-0 bottom-0 w-80 sm:w-96 z-40 shadow-2xl flex flex-col border-l transition-transform duration-300 ${
            theme === 'dark' ? 'bg-[#0f172a] text-slate-200 border-slate-800' : 
            theme === 'sepia' ? 'bg-[#fbf0d9] text-[#43302b] border-[#e8dcc3]' : 
            'bg-white text-slate-850 border-slate-200'
          }`}>
            {/* Sidebar Header */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-inherit">
              <h3 className="font-bold text-[15px] tracking-wide">Alat Baca</h3>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setShowSidebar(false)} 
                className="text-inherit hover:bg-black/5 dark:hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Sidebar Tabs */}
            <div className="flex border-b border-inherit bg-black/[0.02] dark:bg-white/[0.02]">
              {(['tampilan', 'bookmarks', 'sorotan'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab)
                    if (tab === 'sorotan') setSelectedText(null)
                  }}
                  className={`flex-1 py-3.5 text-[11px] font-bold uppercase tracking-wider border-b-2 transition-colors ${
                    activeTab === tab
                      ? 'border-[#00C9A7] text-[#00C9A7]'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  {tab === 'tampilan' ? 'Tampilan' : tab === 'bookmarks' ? 'Bookmark' : 'Catatan'}
                </button>
              ))}
            </div>

            {/* Sidebar Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {activeTab === 'tampilan' && (
                <div className="space-y-6">
                  {/* Theme buttons */}
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-wider opacity-60 mb-2.5">Tema Warna</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'light', label: 'Terang', class: 'bg-white text-slate-900 border-slate-200 hover:bg-slate-50' },
                        { id: 'sepia', label: 'Sepia', class: 'bg-[#fbf0d9] text-amber-950 border-amber-200 hover:bg-[#f5e7c8]' },
                        { id: 'dark', label: 'Gelap', class: 'bg-[#0f172a] text-slate-200 border-slate-800 hover:bg-slate-900' }
                      ].map((t) => (
                        <button
                          key={t.id}
                          onClick={() => handleSetTheme(t.id as any)}
                          className={`h-10 rounded border text-xs font-semibold flex items-center justify-center transition-all ${t.class} ${
                            theme === t.id ? 'ring-2 ring-[#00C9A7] border-transparent scale-102 font-bold' : ''
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Font Size buttons */}
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-wider opacity-60 mb-2.5">Ukuran Huruf</h4>
                    <div className="flex items-center gap-4">
                      <Button 
                        variant="outline" 
                        onClick={decreaseFontSize}
                        className="w-10 h-10 flex items-center justify-center font-bold text-base text-inherit border-inherit hover:bg-black/5 dark:hover:bg-white/10"
                      >
                        A-
                      </Button>
                      <div className="flex-1 text-center font-bold text-sm">
                        {fontSize}
                      </div>
                      <Button 
                        variant="outline" 
                        onClick={increaseFontSize}
                        className="w-10 h-10 flex items-center justify-center font-bold text-base text-inherit border-inherit hover:bg-black/5 dark:hover:bg-white/10"
                      >
                        A+
                      </Button>
                    </div>
                  </div>

                  {/* Font Family buttons */}
                  {book.fileType === 'EPUB' && (
                    <div>
                      <h4 className="text-[10px] font-bold uppercase tracking-wider opacity-60 mb-2.5">Jenis Huruf</h4>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'serif', label: 'Serif', style: 'font-serif' },
                          { id: 'sans-serif', label: 'Sans', style: 'font-sans' },
                          { id: 'monospace', label: 'Mono', style: 'font-mono' }
                        ].map((f) => (
                          <button
                            key={f.id}
                            onClick={() => handleSetFontFamily(f.id)}
                            className={`h-10 rounded border text-xs font-semibold flex items-center justify-center border-inherit transition-all hover:bg-black/5 dark:hover:bg-white/10 ${f.style} ${
                              fontFamily === f.id ? 'ring-2 ring-[#00C9A7] border-transparent font-bold' : ''
                            }`}
                          >
                            {f.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'bookmarks' && (
                <div className="space-y-4">
                  {bookmarks.length === 0 ? (
                    <div className="text-xs text-center opacity-60 py-10 font-medium">Belum ada bookmark untuk buku ini.</div>
                  ) : (
                    <div className="space-y-2">
                      {bookmarks.map((bm) => (
                        <div 
                          key={bm.id} 
                          className="p-3 rounded-lg border border-inherit flex items-center justify-between gap-4 cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                        >
                          <div 
                            onClick={() => {
                              setLocation(bm.location)
                              setShowSidebar(false)
                            }}
                            className="flex-1 min-w-0"
                          >
                            <div className="font-bold text-xs truncate">{bm.label}</div>
                            <div className="text-[9px] opacity-50 mt-1">
                              {new Date(bm.createdAt).toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={(e) => {
                              e.stopPropagation()
                              removeBookmark(bm.id)
                            }}
                            className="text-red-500 hover:text-red-650 hover:bg-black/5 dark:hover:bg-white/10 shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'sorotan' && (
                <div className="space-y-4">
                  {/* Select text highlight creator */}
                  {selectedText ? (
                    <div className="p-4 rounded-lg border border-[#00C9A7]/40 bg-[#00C9A7]/5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-[#00C9A7] uppercase tracking-wider">Teks Terpilih</span>
                        <button 
                          onClick={() => setSelectedText(null)} 
                          className="text-[10px] font-bold opacity-60 hover:opacity-100 transition-opacity"
                        >
                          Batal
                        </button>
                      </div>
                      <blockquote className="text-xs italic pl-2.5 border-l-2 border-[#00C9A7] opacity-80 line-clamp-3">
                        "{selectedText.text}"
                      </blockquote>
                      
                      {/* Color bubbles */}
                      <div>
                        <label className="text-[9px] font-bold uppercase tracking-wider opacity-60 block mb-1.5">Pilih Warna</label>
                        <div className="flex gap-2.5">
                          {[
                            { color: 'rgba(250,204,21,0.4)', bg: 'bg-yellow-400' },
                            { color: 'rgba(52,211,153,0.4)', bg: 'bg-emerald-400' },
                            { color: 'rgba(96,165,250,0.4)', bg: 'bg-blue-400' },
                            { color: 'rgba(244,114,182,0.4)', bg: 'bg-pink-400' },
                          ].map((col) => (
                            <button
                              key={col.color}
                              onClick={() => setSelectedColor(col.color)}
                              className={`w-6 h-6 rounded-full border border-black/10 transition-transform ${col.bg} ${
                                selectedColor === col.color ? 'scale-125 ring-2 ring-white' : 'hover:scale-110'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Notes area */}
                      <div>
                        <label className="text-[9px] font-bold uppercase tracking-wider opacity-60 block mb-1.5">Catatan</label>
                        <textarea
                          value={selectedNote}
                          onChange={(e) => setSelectedNote(e.target.value)}
                          placeholder="Tambahkan catatan khusus..."
                          className="w-full p-2 text-xs rounded border border-inherit bg-transparent focus:ring-1 focus:ring-[#00C9A7] outline-none resize-none h-16"
                        />
                      </div>

                      <Button 
                        onClick={addHighlight} 
                        className="w-full text-[11px] bg-[#00C9A7] hover:bg-[#00B294] text-white py-1 h-8 font-bold"
                      >
                        Simpan Sorotan
                      </Button>
                    </div>
                  ) : (
                    <div className="text-[11px] opacity-60 italic text-center py-2">
                      Sorot kalimat di buku untuk membuat catatan & sorotan baru.
                    </div>
                  )}

                  {/* Highlights list */}
                  {highlights.length === 0 ? (
                    <div className="text-xs text-center opacity-60 py-10 font-medium">Belum ada catatan atau sorotan.</div>
                  ) : (
                    <div className="space-y-3">
                      {highlights.map((hl) => (
                        <div 
                          key={hl.id} 
                          className="p-3.5 rounded-lg border border-inherit space-y-2 relative"
                          style={{ borderLeft: `4px solid ${hl.color}` }}
                        >
                          <div 
                            onClick={() => {
                              setLocation(hl.cfiRange)
                              setShowSidebar(false)
                            }}
                            className="cursor-pointer"
                          >
                            <blockquote className="text-xs italic opacity-85 line-clamp-3">
                              "{hl.text}"
                            </blockquote>
                            {hl.note && (
                              <div className="mt-2 text-xs font-semibold p-2.5 rounded bg-black/5 dark:bg-white/5 border border-inherit/30">
                                {hl.note}
                              </div>
                            )}
                            <div className="text-[9px] opacity-50 mt-1">
                              {new Date(hl.createdAt).toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                          
                          <button 
                            onClick={() => removeHighlight(hl.id)}
                            className="absolute top-2.5 right-2 text-red-500 hover:text-red-650 opacity-60 hover:opacity-100 p-1 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Modular Reader Area */}
      <div className="flex-1 relative overflow-hidden">
        {book.fileType === 'PDF' ? (
          <PdfViewer 
            bookId={book.id} 
            fileUrl={book.fileUrl} 
            location={location}
            onLocationChange={setLocation}
            theme={theme}
            onChapterChange={setChapter}
          />
        ) : (
          <EpubViewer 
            bookId={book.id} 
            fileUrl={book.fileUrl} 
            location={location}
            onLocationChange={setLocation}
            theme={theme}
            fontSize={fontSize}
            fontFamily={fontFamily}
            highlights={highlights}
            onTextSelected={(cfiRange, text) => {
              setSelectedText({ cfiRange, text })
              setActiveTab('sorotan')
              setShowSidebar(true)
            }}
            onChapterChange={setChapter}
          />
        )}
      </div>
    </div>
  )
}
