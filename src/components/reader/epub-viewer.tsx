'use client'

import { useState, useEffect, useCallback } from 'react'
import { ReactReader, ReactReaderStyle } from 'react-reader'
import { updateReadingProgress } from '@/app/(app)/book/actions'

import { useRef } from 'react'

interface EpubViewerProps {
  bookId: string
  fileUrl: string
  initialLocation?: string | null
  theme: 'light' | 'dark' | 'sepia'
  onChapterChange?: (title: string) => void
}

export default function EpubViewer({ bookId, fileUrl, initialLocation, theme, onChapterChange }: EpubViewerProps) {
  const [location, setLocation] = useState<string | number>(initialLocation || 0)
  const [progress, setProgress] = useState<number>(0)
  const renditionRef = useRef<any>(null)
  
  // Simple debounce hook logic or timer ref
  useEffect(() => {
    if (!location || location === initialLocation) return

    const timer = setTimeout(() => {
      updateReadingProgress(bookId, location.toString(), progress).catch(console.error)
    }, 2000)

    return () => clearTimeout(timer)
  }, [location, bookId, progress])

  const onLocationChange = (epubcifi: string) => {
    setLocation(epubcifi)
    if (renditionRef.current) {
      const locationInfo = renditionRef.current.location
      if (locationInfo && locationInfo.start) {
        const percentage = locationInfo.start.percentage
        setProgress(percentage)
      }
    }
  }

  const previousPage = () => {
    if (renditionRef.current) renditionRef.current.prev()
  }

  const nextPage = () => {
    if (renditionRef.current) renditionRef.current.next()
  }

  return (
    <div className="h-full w-full flex flex-col relative epub-viewer-container">
      <style>{`
        .epub-viewer-container button[class*="arrow"] {
          display: none !important;
        }
      `}</style>
      <div className="flex-1 relative">
        <ReactReader
          url={fileUrl}
          location={location}
          locationChanged={onLocationChange}
          tocChanged={(toc) => {
            if (onChapterChange && toc.length > 0) {
              onChapterChange('Dokumen EPUB') // For better toc integration, we'd find the current chapter
            }
          }}
          epubOptions={{
            flow: 'paginated', 
          }}
          getRendition={(rendition) => {
            renditionRef.current = rendition
          // Inject styles dynamically to the iframe contents whenever theme changes
          const applyTheme = () => {
            if (theme === 'dark') {
              rendition.themes.register('dark', { body: { background: '#0f172a', color: '#f8fafc' } })
              rendition.themes.select('dark')
            } else if (theme === 'sepia') {
              rendition.themes.register('sepia', { body: { background: '#fbf0d9', color: '#43302b' } })
              rendition.themes.select('sepia')
            } else {
              rendition.themes.register('light', { body: { background: '#ffffff', color: '#0f172a' } })
              rendition.themes.select('light')
            }
          }
          applyTheme()
          
          // Re-apply theme specifically on orientation/location jumps
          rendition.on('relocated', applyTheme)
        }}
      />
      
      {/* Hide React-Reader default nav via absolute overlay or we can just let it exist since it's on sides. 
          But we will add our bottom bar matching PDF viewer. */}
      </div>

      {/* Bottom Persistent Control Sticky Bar */}
      <div className="h-20 w-full bg-[#0f172a] text-white flex flex-col z-10 shrink-0 relative">
        {/* Progress Bar Track */}
        <div className="absolute top-0 left-0 w-full h-1 bg-white/10">
          <div 
            className="h-full bg-[#00C9A7] transition-all duration-300" 
            style={{ width: `${progress * 100}%` }} 
          />
        </div>
        
        <div className="flex-1 flex items-center justify-between px-6">
          <button
            onClick={previousPage}
            className="text-[15px] font-medium text-slate-400 hover:text-white transition-colors"
          >
            ← Prev
          </button>

          <div className="flex flex-col items-center justify-center">
            <div className="text-[15px] font-bold text-white tracking-wide">
              {Math.round(progress * 100)}%
            </div>
            <div className="text-[11px] font-medium text-slate-400 mt-0.5">
              selesai
            </div>
          </div>

          <button
            onClick={nextPage}
            className="text-[15px] font-bold text-[#00C9A7] hover:text-[#34d399] transition-colors"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  )
}
