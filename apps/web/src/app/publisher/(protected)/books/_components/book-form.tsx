'use client';

import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { getCoverUrl } from '@/lib/cover-url';
import { MAX_PUBLISHER_FILE_BYTES, PUBLISHER_GENRES, PUBLISHER_TIERS } from '@/lib/publisher-book-input';
import { savePublisherBook, submitPublisherBookForReview } from '../actions';
import './book-form.css';

type Initial = {
  title?: string; author?: string; isbn?: string; description?: string; genre?: string;
  language?: string; year?: string; pageCount?: string; subscriptionRequired?: string;
  coverKey?: string | null; epubKey?: string | null; publicationStatus?: string; archivedAt?: string | null;
};

export function PublisherBookForm({ bookId = null, initial }: { bookId?: string | null; initial?: Initial }) {
  const router = useRouter();
  const form = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [coverName, setCoverName] = useState('');
  const [contentName, setContentName] = useState('');
  const [rightsConfirmed, setRightsConfirmed] = useState(false);
  const [currentBookId, setCurrentBookId] = useState(bookId);
  const [preview, setPreview] = useState<string | null>(initial?.coverKey ? getCoverUrl(initial.coverKey) : null);
  const canSubmit = !initial || ['DRAFT', 'REJECTED'].includes(initial.publicationStatus ?? 'DRAFT');

  function chooseFile(file: File | undefined, kind: 'cover' | 'content') {
    if (!file) return;
    if (file.size > MAX_PUBLISHER_FILE_BYTES) {
      setError('Ukuran setiap file maksimal 50 MB.');
      return;
    }
    setError(null);
    if (kind === 'cover') {
      setCoverName(file.name);
      const reader = new FileReader();
      reader.onload = () => setPreview(typeof reader.result === 'string' ? reader.result : null);
      reader.readAsDataURL(file);
    } else setContentName(file.name);
  }

  function submit(sendForReview: boolean) {
    const node = form.current;
    if (!node) return;
    if (!node.reportValidity()) return;
    if (sendForReview && !rightsConfirmed) {
      setError('Konfirmasi hak distribusi sebelum mengirim buku.');
      return;
    }
    setError(null);
    const fields = new FormData(node);
    startTransition(async () => {
      try {
        const saved = await savePublisherBook(currentBookId, fields);
        setCurrentBookId(saved.bookId);
        if (sendForReview && !saved.sentForReview) await submitPublisherBookForReview(saved.bookId, rightsConfirmed);
        router.push('/publisher/books');
        router.refresh();
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : 'Buku gagal disimpan. Coba lagi.');
      }
    });
  }

  return <form ref={form} className="pbf" onSubmit={(event) => { event.preventDefault(); submit(false); }}>
    {error && <div role="alert" className="pbf-error">{error}</div>}
    {initial?.archivedAt && <div className="pbf-notice">Buku berada di arsip. Pulihkan dari katalog sebelum mengirim untuk review atau menerbitkan kembali.</div>}
    {initial?.publicationStatus === 'IN_REVIEW' && <div className="pbf-notice">Buku sedang ditinjau. Perubahan metadata dan file akan memperbarui berkas review.</div>}
    {initial && ['PUBLISHED', 'UNPUBLISHED'].includes(initial.publicationStatus ?? '') && <div className="pbf-notice">Mengganti file buku akan menarik buku dari toko dan mengirimnya untuk review ulang. Perubahan metadata saja tidak mengubah status terbit.</div>}
    <div className="pbf-grid">
      <section className="pbf-card" aria-labelledby="pbf-metadata-title">
        <div className="pbf-section-head"><span className="pbf-step">01</span><div><h2 id="pbf-metadata-title">Informasi buku</h2><p>Judul dan penulis cukup untuk menyimpan draft.</p></div></div>
        <div className="pbf-fields two">
          <label>Judul buku <span>*</span><input name="title" required maxLength={200} defaultValue={initial?.title} placeholder="Judul buku" /></label>
          <label>Nama penulis <span>*</span><input name="author" required maxLength={160} defaultValue={initial?.author} placeholder="Nama penulis" /></label>
        </div>
        <label>ISBN <small>Opsional · edisi berbeda perlu ISBN berbeda</small><input name="isbn" defaultValue={initial?.isbn} placeholder="ISBN-10 atau ISBN-13" inputMode="numeric" /></label>
        <label>Sinopsis <small>Wajib sebelum review</small><textarea name="description" maxLength={5000} rows={5} defaultValue={initial?.description} placeholder="Ceritakan isi buku kepada pembaca" /></label>
        <div className="pbf-fields two">
          <label>Kategori <small>Wajib sebelum review</small><select name="genre" defaultValue={initial?.genre ?? ''}><option value="">Pilih kategori</option>{PUBLISHER_GENRES.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
          <label>Bahasa<select name="language" defaultValue={initial?.language ?? 'ID'}><option value="ID">Indonesia</option><option value="EN">English</option></select></label>
          <label>Tahun terbit<input name="year" type="number" min={1900} max={2100} defaultValue={initial?.year} placeholder="2026" /></label>
          <label>Jumlah halaman<input name="pageCount" type="number" min={1} defaultValue={initial?.pageCount} placeholder="250" /></label>
        </div>
        <label>Akses pembaca<select name="subscriptionRequired" defaultValue={initial?.subscriptionRequired ?? 'FREE'}>{PUBLISHER_TIERS.map((value) => <option key={value} value={value}>{value === 'FREE' ? 'Gratis' : value}</option>)}</select></label>
      </section>
      <aside className="pbf-side">
        <section className="pbf-card" aria-labelledby="pbf-files-title">
          <div className="pbf-section-head"><span className="pbf-step">02</span><div><h2 id="pbf-files-title">Berkas buku</h2><p>Wajib sebelum dikirim untuk review. Maksimal 50 MB per file.</p></div></div>
          <label className="pbf-file">Cover buku {preview && <img src={preview} alt="Pratinjau cover buku" className="pbf-cover-preview" />}
            <span>{coverName || (initial?.coverKey ? 'Cover sudah diunggah · pilih untuk mengganti' : 'Pilih cover JPG, PNG, atau WebP')}</span>
            <input type="file" name="cover" accept=".jpg,.jpeg,.png,.webp" onChange={(event) => chooseFile(event.target.files?.[0], 'cover')} />
          </label>
          <label className="pbf-file">File buku
            <span>{contentName || (initial?.epubKey ? 'File buku sudah diunggah · pilih untuk mengganti' : 'Pilih file EPUB atau PDF')}</span>
            <input type="file" name="epub" accept=".epub,.pdf" onChange={(event) => chooseFile(event.target.files?.[0], 'content')} />
          </label>
        </section>
        {canSubmit && <section className="pbf-card pbf-review"><h2>Siap dikirim?</h2><p>Tim kurasi akan memeriksa metadata, cover, dan isi buku. Buku belum muncul di toko sampai disetujui.</p><label className="pbf-check"><input type="checkbox" checked={rightsConfirmed} onChange={(event) => setRightsConfirmed(event.target.checked)} /> Saya memiliki hak untuk mendistribusikan buku ini di BUKOO.</label></section>}
        <div className="pbf-actions"><button type="submit" disabled={pending} className="pbf-save">{pending ? 'Memproses…' : 'Simpan draft / perubahan'}</button>{canSubmit && !initial?.archivedAt && <button type="button" disabled={pending} onClick={() => submit(true)} className="pbf-submit">Kirim untuk review</button>}</div>
      </aside>
    </div>
  </form>;
}
