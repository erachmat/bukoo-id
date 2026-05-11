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
  initialLocation?: string | null
  theme: 'light' | 'dark' | 'sepia'
}

export default function PdfViewer({ bookId, fileUrl, initialLocation, theme }: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number>(0)
  const [pageNumber, setPageNumber] = useState<number>(
    initialLocation ? parseInt(initialLocation, 10) || 1 : 1
  )

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages)
  }

  // Update remote storage whenever page changes
  useEffect(() => {
    if (!numPages) return
    
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
      <div className="h-16 w-full bg-background/95 backdrop-blur border-t flex items-center justify-center gap-6 px-4 z-10">
        <Button
          variant="outline"
          size="icon"
          onClick={previousPage}
          disabled={pageNumber <= 1}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        <div className="text-sm font-medium flex items-center gap-1">
          <span>Halaman</span>
          <span className="inline-flex h-8 px-2 items-center border rounded-md bg-muted/50 min-w-[40px] justify-center">
            {pageNumber}
          </span>
          <span className="text-muted-foreground">dari {numPages || '...'}</span>
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={nextPage}
          disabled={pageNumber >= numPages}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}
