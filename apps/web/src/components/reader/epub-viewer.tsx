'use client'

import { useState, useEffect, useRef } from 'react'
import { ReactReader } from 'react-reader'
import { updateReadingProgress } from '@/app/(app)/book/actions'

interface EpubViewerProps {
  bookId: string
  fileUrl: string
  location: string | number
  onLocationChange: (loc: string) => void
  theme: 'light' | 'dark' | 'sepia'
  fontSize: string
  fontFamily: string
  highlights: any[]
  onTextSelected: (cfiRange: string, text: string) => void
  onChapterChange?: (title: string) => void
}

export default function EpubViewer({ 
  bookId, 
  fileUrl, 
  location, 
  onLocationChange, 
  theme, 
  fontSize,
  fontFamily,
  highlights,
  onTextSelected,
  onChapterChange 
}: EpubViewerProps) {
  const [progress, setProgress] = useState<number>(0)
  const renditionRef = useRef<any>(null)
  
  // Debounce syncing progress to DB
  useEffect(() => {
    if (!location) return

    const timer = setTimeout(() => {
      updateReadingProgress(bookId, location.toString(), progress).catch(console.error)
    }, 2000)

    return () => clearTimeout(timer)
  }, [location, bookId, progress])

  const handleLocationChanged = (epubcifi: string) => {
    onLocationChange(epubcifi)
    if (renditionRef.current) {
      const locationInfo = renditionRef.current.location
      if (locationInfo && locationInfo.start) {
        const percentage = locationInfo.start.percentage
        setProgress(percentage)
      }
    }
  }

  // Handle highlights rendering
  useEffect(() => {
    const rendition = renditionRef.current
    if (!rendition) return

    // Clean previous highlights (standard epubjs pattern)
    highlights.forEach((hl) => {
      try {
        rendition.annotations.remove(hl.cfiRange, 'highlight')
      } catch (e) {}
    })

    // Apply new highlights
    highlights.forEach((hl) => {
      try {
        rendition.annotations.add(
          'highlight',
          hl.cfiRange,
          {},
          () => {},
          'epubjs-hl',
          { fill: hl.color || 'rgba(250,204,21,0.4)' }
        )
      } catch (e) {
        console.error('Failed to render highlight:', e)
      }
    })
  }, [highlights, location])

  // Handle dynamic font size & font family changes
  useEffect(() => {
    const rendition = renditionRef.current
    if (rendition) {
      rendition.themes.fontSize(fontSize)
    }
  }, [fontSize])

  useEffect(() => {
    const rendition = renditionRef.current
    if (rendition) {
      rendition.themes.font(fontFamily)
    }
  }, [fontFamily])

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
          locationChanged={handleLocationChanged}
          tocChanged={(toc) => {
            if (onChapterChange && toc.length > 0) {
              onChapterChange('Dokumen EPUB')
            }
          }}
          epubOptions={{
            flow: 'paginated', 
          }}
          getRendition={(rendition) => {
            renditionRef.current = rendition
            
            // Set dynamic typography
            rendition.themes.fontSize(fontSize)
            rendition.themes.font(fontFamily)

            // Setup Theme configuration
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
            
            rendition.on('relocated', applyTheme)

            // Selection handler
            rendition.on('selected', (cfiRange: string) => {
              try {
                const range = rendition.getRange(cfiRange)
                const text = range.toString()
                if (text && text.trim().length > 0) {
                  onTextSelected(cfiRange, text)
                }
              } catch (e) {
                console.error('Error on selecting text:', e)
              }
            })
          }}
        />
      </div>

      {/* Bottom Control Bar */}
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

