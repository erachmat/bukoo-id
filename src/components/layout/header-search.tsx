'use client'

import { Search } from 'lucide-react'

export function HeaderSearch() {
  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <Search style={{ 
        position: 'absolute', 
        left: '14px', 
        top: '50%', 
        transform: 'translateY(-50%)', 
        height: '16px', 
        width: '16px', 
        color: '#9CA3AF',
        zIndex: 10
      }} />
      <input
        type="search"
        placeholder="Cari judul, penulis, atau penerbit..."
        style={{ 
          height: '40px', 
          width: '100%', 
          borderRadius: '9999px', 
          border: 'none', 
          background: 'rgba(255, 255, 255, 0.1)', 
          padding: '0 16px 0 42px', 
          fontSize: '14px', 
          color: '#ffffff', 
          outline: 'none',
          transition: 'background 0.2s ease',
          boxSizing: 'border-box'
        }}
        onFocus={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'}
        onBlur={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
      />
    </div>
  )
}
