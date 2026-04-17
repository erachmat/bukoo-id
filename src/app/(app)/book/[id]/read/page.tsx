'use client'

import { useState, useRef, useEffect, use } from 'react'
import { ReactReader, ReactReaderStyle } from 'react-reader'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Settings, Moon, Sun, Monitor } from 'lucide-react'
import Link from 'next/link'

export default function ReaderPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params)
  
  const [location, setLocation] = useState<string | number>(0)
  const [showSettings, setShowSettings] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark' | 'sepia'>('light')
  
  // Using a public domain epub for demo
  const DEMO_EPUB_URL = "https://react-reader.metabits.no/files/alice.epub"

  // Basic styling customization
  const customStyles = {
    ...ReactReaderStyle,
    readerArea: {
      ...ReactReaderStyle.readerArea,
      backgroundColor: theme === 'dark' ? '#0f172a' : theme === 'sepia' ? '#fbf0d9' : '#ffffff',
      transition: 'background-color 0.3s ease',
    },
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* Top Navigation Bar */}
      <div className="h-14 border-b bg-background/95 backdrop-blur flex items-center justify-between px-4 z-10">
        <Link href={`/book/${unwrappedParams.id}`}>
          <Button variant="ghost" size="sm" className="text-muted-foreground mr-2">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Tutup
          </Button>
        </Link>
        <div className="font-medium text-sm text-center flex-1 truncate px-4">
          BUKOO Web Reader
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

      {/* Reader Area */}
      <div className="flex-1 relative">
        <ReactReader
          url={DEMO_EPUB_URL}
          location={location}
          locationChanged={(epubcifi: string) => setLocation(epubcifi)}
          epubOptions={{
            flow: 'scrolled-doc', // Or 'paginated', using scrolled-doc for better web feel usually
          }}
          getRendition={(rendition) => {
            // Apply theme to the iframe inside epub.js
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
          }}
        />
      </div>
    </div>
  )
}
