'use client'

import { useTransition, useState } from 'react'

const GENRES = ['Fiksi', 'Non-Fiksi', 'Pengembangan Diri', 'Roman', 'Sastra', 'Bisnis', 'Sejarah', 'Klasik']

type BookFormProps = {
  action: (formData: FormData) => Promise<void>
  defaultValues?: {
    title?: string
    author?: string
    description?: string
    genre?: string
    language?: string
    subscriptionRequired?: string
    year?: number | null
    publisher?: string | null
    pageCount?: number | null
    coverUrl?: string | null
    fileUrl?: string | null
  }
  submitLabel?: string
}

export function BookForm({ action, defaultValues = {}, submitLabel = 'Simpan & Terbitkan' }: BookFormProps) {
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
      } catch (err: any) {
        console.error(err)
        setErrorMsg(err.message || 'Terjadi kesalahan saat menyimpan buku. Pastikan ukuran file tidak melebihi 50MB.')
      }
    })
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #D1D9E0',
    fontSize: 14, color: '#1A2332', background: '#fff', outline: 'none', boxSizing: 'border-box',
  }
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 12, fontWeight: 700, color: '#6B7A8D',
    textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6,
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
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E8ECF0', padding: 28, boxShadow: '0 2px 12px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={labelStyle}>Judul Buku *</label>
              <input style={inputStyle} name="title" required placeholder="Masukkan judul..." defaultValue={defaultValues.title ?? ''} />
            </div>
            <div>
              <label style={labelStyle}>Penulis *</label>
              <input style={inputStyle} name="author" required placeholder="Nama penulis..." defaultValue={defaultValues.author ?? ''} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Deskripsi / Sinopsis</label>
            <textarea
              name="description"
              placeholder="Sinopsis singkat..."
              defaultValue={defaultValues.description ?? ''}
              style={{ ...inputStyle, minHeight: 120, resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={labelStyle}>Kategori *</label>
              <select name="genre" required style={inputStyle} defaultValue={defaultValues.genre ?? 'Fiksi'}>
                {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Bahasa *</label>
              <select name="language" required style={inputStyle} defaultValue={defaultValues.language ?? 'ID'}>
                <option value="ID">Indonesia 🇮🇩</option>
                <option value="EN">English 🇺🇸</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <div>
              <label style={labelStyle}>Tahun Terbit</label>
              <input style={inputStyle} name="year" type="number" placeholder="2024" defaultValue={defaultValues.year ?? ''} min={1900} max={2100} />
            </div>
            <div>
              <label style={labelStyle}>Penerbit</label>
              <input style={inputStyle} name="publisher" placeholder="Nama penerbit..." defaultValue={defaultValues.publisher ?? ''} />
            </div>
            <div>
              <label style={labelStyle}>Jumlah Halaman</label>
              <input style={inputStyle} name="pageCount" type="number" placeholder="250" defaultValue={defaultValues.pageCount ?? ''} min={1} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Tipe Akses / Subscription Tier *</label>
            <select
              name="subscriptionRequired"
              required
              style={inputStyle}
              defaultValue={defaultValues.subscriptionRequired ?? 'FREE'}
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
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E8ECF0', padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
            <label style={labelStyle}>Cover Buku</label>
            {defaultValues.coverUrl && !coverName && (
              <img src={defaultValues.coverUrl} alt="Current cover" style={{ width: '100%', aspectRatio: '2/3', objectFit: 'cover', borderRadius: 8, marginBottom: 12, border: '1px solid #E8ECF0' }} />
            )}
            <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 24, border: '2px dashed #D1D9E0', borderRadius: 12, cursor: 'pointer', background: coverName ? '#ECFDF5' : '#F8FAFB', textAlign: 'center' }}>
              <span style={{ fontSize: 28 }}>🖼️</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: coverName ? '#047857' : '#6B7A8D' }}>
                {coverName ? coverName : (defaultValues.coverUrl ? 'Ganti cover' : 'Upload Cover')}
              </span>
              {!coverName && <span style={{ fontSize: 11, color: '#AAB4C0' }}>JPG / PNG · Rasio 2:3</span>}
              <input type="file" name="cover" accept="image/*" style={{ display: 'none' }} onChange={(e) => setCoverName(e.target.files?.[0]?.name ?? null)} />
            </label>
          </div>

          {/* File */}
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E8ECF0', padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
            <label style={labelStyle}>File Buku (EPUB/PDF)</label>
            {defaultValues.fileUrl && !epubName && (
              <div style={{ marginBottom: 10, fontSize: 12, color: '#00856F', padding: '6px 12px', background: 'rgba(0,201,167,0.08)', borderRadius: 8, wordBreak: 'break-all' }}>
                ✓ {defaultValues.fileUrl.split('/').pop()}
              </div>
            )}
            <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 24, border: '2px dashed #D1D9E0', borderRadius: 12, cursor: 'pointer', background: epubName ? '#ECFDF5' : '#F8FAFB', textAlign: 'center' }}>
              <span style={{ fontSize: 28 }}>📄</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: epubName ? '#047857' : '#6B7A8D' }}>
                {epubName ? epubName : (defaultValues.fileUrl ? 'Ganti file' : 'Upload File')}
              </span>
              {!epubName && <span style={{ fontSize: 11, color: '#AAB4C0' }}>EPUB atau PDF · Maks 50MB</span>}
              <input type="file" name="epub" accept=".epub,.pdf" style={{ display: 'none' }} onChange={(e) => setEpubName(e.target.files?.[0]?.name ?? null)} />
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isPending}
            style={{
              width: '100%', padding: '14px', borderRadius: 12, border: 'none',
              background: isPending ? '#ccc' : '#00C9A7', color: '#00181A',
              fontWeight: 800, fontSize: 15, cursor: isPending ? 'wait' : 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {isPending ? 'Menyimpan... (Mohon tunggu)' : submitLabel}
          </button>
        </div>
      </div>
    </form>
  )
}
