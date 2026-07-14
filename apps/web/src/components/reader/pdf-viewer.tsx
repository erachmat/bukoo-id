'use client'

import { useState, useEffect } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import { updateReadingProgress } from '@/app/(app)/book/actions'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

// Standard setup for the unpkg worker consistent with react-pdf's pdf.js version
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

interface PdfViewerProps {
  bookId: string
  fileUrl: string
  location: string | number
  onLocationChange: (loc: string) => void
  theme: 'light' | 'dark' | 'sepia'
  onChapterChange?: (title: string) => void
}

export default function PdfViewer({ bookId, fileUrl, location, onLocationChange, theme, onChapterChange }: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number>(0)
  const [pageNumber, setPageNumber] = useState<number>(
    location ? parseInt(location.toString(), 10) || 1 : 1
  )

  // Handle location changes from parent (e.g. clicking a bookmark)
  useEffect(() => {
    if (location) {
      const p = parseInt(location.toString(), 10)
      if (!isNaN(p) && p !== pageNumber) {
        setPageNumber(p)
      }
    }
  }, [location])

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages)
    if (onChapterChange) onChapterChange('Dokumen PDF')
  }

  // Update remote storage and parent state whenever page changes
  useEffect(() => {
    if (!numPages) return
    
    onLocationChange(pageNumber.toString())
    
    const syncTimer = setTimeout(() => {
      const currentProgress = numPages > 0 ? pageNumber / numPages : 0
      updateReadingProgress(bookId, pageNumber.toString(), Math.min(currentProgress, 1)).catch(console.error)
    }, 1500)

    return () => clearTimeout(syncTimer)
  }, [pageNumber, numPages, bookId])

  function changePage(offset: number) {
    setPageNumber((prevPageNumber) => {
      const nextPage = prevPageNumber + offset
      return Math.min(Math.max(1, nextPage), numPages)
    })
  }

  const previousPage = () => changePage(-1)
  const nextPage = () => changePage(1)

  const containerBg = 
    theme === 'dark' ? '#020617' : 
    theme === 'sepia' ? '#fbf0d9' : '#f8fafc'

  return (
    <div 
      className="h-full w-full flex flex-col items-center overflow-hidden"
      style={{ backgroundColor: containerBg, transition: 'background-color 0.3s ease' }}
    >
      {/* PDF Rendering Canvas/Scroll Area */}
      <div className="flex-1 w-full overflow-auto flex justify-center p-4">
        <Document
          file={fileUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin mb-2" />
              <p className="text-sm font-medium">Memuat dokumen...</p>
            </div>
          }
          error={
            <div className="text-center text-destructive mt-20">
              <p>Gagal memuat dokumen PDF.</p>
            </div>
          }
        >
          <Page 
            pageNumber={pageNumber} 
            renderAnnotationLayer={false}
            renderTextLayer={true}
            className="shadow-lg rounded overflow-hidden"
            // scale handled roughly via width targeting to maintain responsive container fit
            width={Math.min(window?.innerWidth ? window.innerWidth - 32 : 800, 800)}
          />
        </Document>
      </div>

      {/* Bottom Persistent Control Sticky Bar */}
      <div className="h-20 w-full bg-[#0f172a] text-white flex flex-col z-10 shrink-0 relative">
        {/* Progress Bar Track */}
        <div className="absolute top-0 left-0 w-full h-1 bg-white/10">
          <div 
            className="h-full bg-[#00C9A7] transition-all duration-300" 
            style={{ width: `${numPages > 0 ? (pageNumber / numPages) * 100 : 0}%` }} 
          />
        </div>
        
        <div className="flex-1 flex items-center justify-between px-6">
          <button
            onClick={previousPage}
            disabled={pageNumber <= 1}
            className="text-[15px] font-medium text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed hover:text-white transition-colors"
          >
            ← Prev
          </button>

          <div className="flex flex-col items-center justify-center">
            <div className="text-[15px] font-bold text-white tracking-wide">
              Hal. {pageNumber} / {numPages || '...'}
            </div>
            <div className="text-[11px] font-medium text-slate-400 mt-0.5">
              {numPages > 0 ? Math.round((pageNumber / numPages) * 100) : 0}% selesai
            </div>
          </div>

          <button
            onClick={nextPage}
            disabled={pageNumber >= numPages}
            className="text-[15px] font-bold text-[#00C9A7] disabled:opacity-30 disabled:cursor-not-allowed hover:text-[#34d399] transition-colors"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  )
}
