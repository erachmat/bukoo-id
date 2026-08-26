'use client'

import { useTransition, useState } from 'react'

const GENRES = ['Fiksi', 'Non-Fiksi', 'Pengembangan Diri', 'Roman', 'Sastra', 'Bisnis', 'Sejarah', 'Klasik']

type BookFormProps = {
  action: (formData: FormData) => Promise<void>
  submitLabel?: string
  initial?: {
    title?: string
    author?: string
    description?: string
    genre?: string
    language?: string
    year?: string
    pageCount?: string
    subscriptionRequired?: string
  }
}

export function PublisherBookForm({ action, submitLabel = 'Terbitkan Buku', initial }: BookFormProps) {
  const [isPending, startTransition] = useTransition()
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  
  const [coverName, setCoverName] = useState<string | null>(null)
  const [epubName, setEpubName] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErrorMsg(null)
    const fd = new FormData(e.currentTarget)
    
    startTransition(async () => {
      try {
        await action(fd)
      } catch (err: unknown) {
        console.error(err)
        setErrorMsg((err as Error).message || 'Terjadi kesalahan saat menyimpan buku. Pastikan ukuran file tidak melebihi 50MB.')
      }
    })
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)',
    fontSize: 14, color: 'var(--text)', background: 'var(--bg-card)', outline: 'none', boxSizing: 'border-box',
    fontFamily: 'inherit'
  }
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-mid)',
    textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6,
    fontFamily: 'inherit'
  }

  return (
    <form onSubmit={handleSubmit}>
      {errorMsg && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', padding: '12px 16px', borderRadius: 10, marginBottom: 24, fontSize: 14, fontWeight: 600 }}>
          {errorMsg}
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'flex-start' }}>

        {/* Left: Metadata */}
        <div style={{ background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border)', padding: 28, boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={labelStyle}>Judul Buku *</label>
              <input style={inputStyle} name="title" required placeholder="Masukkan judul..." defaultValue={initial?.title} />
            </div>
            <div>
              <label style={labelStyle}>Penulis *</label>
              <input style={inputStyle} name="author" required placeholder="Nama penulis..." defaultValue={initial?.author} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Deskripsi / Sinopsis</label>
            <textarea
              name="description"
              placeholder="Sinopsis singkat..."
              defaultValue={initial?.description}
              style={{ ...inputStyle, minHeight: 120, resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={labelStyle}>Kategori *</label>
              <select name="genre" required style={inputStyle} defaultValue={initial?.genre}>
                {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Bahasa *</label>
              <select name="language" required style={inputStyle} defaultValue={initial?.language ?? 'ID'}>
                <option value="ID">Indonesia 🇮🇩</option>
                <option value="EN">English 🇺🇸</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={labelStyle}>Tahun Terbit</label>
              <input style={inputStyle} name="year" type="number" placeholder="2026" min={1900} max={2100} defaultValue={initial?.year} />
            </div>
            <div>
              <label style={labelStyle}>Jumlah Halaman</label>
              <input style={inputStyle} name="pageCount" type="number" placeholder="250" min={1} defaultValue={initial?.pageCount} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Tipe Akses / Subscription Tier *</label>
            <select
              name="subscriptionRequired"
              required
              style={inputStyle}
              defaultValue={initial?.subscriptionRequired ?? 'FREE'}
            >
              <option value="FREE">Gratis (FREE)</option>
              <option value="PELAJAR">Pelajar (PELAJAR)</option>
              <option value="PERSONAL">Personal (PERSONAL)</option>
              <option value="PLUS">Plus (PLUS)</option>
              <option value="FAMILY">Family (FAMILY)</option>
              <option value="PREMIUM">Premium (PREMIUM)</option>
            </select>
          </div>
        </div>

        {/* Right: Files */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Cover */}
          <div style={{ background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border)', padding: 20, boxShadow: 'var(--shadow-sm)' }}>
            <label style={labelStyle}>Cover Buku</label>
            <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 24, border: '2px dashed var(--border-dark)', borderRadius: 12, cursor: 'pointer', background: coverName ? '#E8F8F0' : 'var(--bg)', textAlign: 'center' }}>
              <span style={{ fontSize: 28 }}>🖼️</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: coverName ? '#27AE60' : 'var(--text-mid)', fontFamily: 'inherit' }}>
                {coverName ? coverName : 'Upload Cover'}
              </span>
              {!coverName && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>JPG / PNG · Rasio 2:3</span>}
              <input type="file" name="cover" accept="image/*" style={{ display: 'none' }} onChange={(e) => setCoverName(e.target.files?.[0]?.name ?? null)} />
            </label>
          </div>

          {/* File */}
          <div style={{ background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border)', padding: 20, boxShadow: 'var(--shadow-sm)' }}>
            <label style={labelStyle}>File Buku (EPUB/PDF)</label>
            <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 24, border: '2px dashed var(--border-dark)', borderRadius: 12, cursor: 'pointer', background: epubName ? '#E8F8F0' : 'var(--bg)', textAlign: 'center' }}>
              <span style={{ fontSize: 28 }}>📄</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: epubName ? '#27AE60' : 'var(--text-mid)', fontFamily: 'inherit' }}>
                {epubName ? epubName : 'Upload File'}
              </span>
              {!epubName && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>EPUB atau PDF · Maks 50MB</span>}
              <input type="file" name="epub" accept=".epub,.pdf" style={{ display: 'none' }} onChange={(e) => setEpubName(e.target.files?.[0]?.name ?? null)} />
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isPending}
            style={{
              width: '100%', padding: '14px', borderRadius: 12, border: 'none',
              background: isPending ? 'var(--border)' : 'var(--amber)', color: 'var(--forest-dd)',
              fontWeight: 800, fontSize: 15, cursor: isPending ? 'wait' : 'pointer',
              transition: 'all 0.2s', fontFamily: 'inherit'
            }}
          >
            {isPending ? 'Menyimpan... (Mohon tunggu)' : submitLabel}
          </button>
        </div>
      </div>
    </form>
  )
}
