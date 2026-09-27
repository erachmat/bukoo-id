export const MAX_PUBLISHER_FILE_BYTES = 50 * 1024 * 1024;

export const PUBLISHER_GENRES = ['Fiksi', 'Non-Fiksi', 'Pengembangan Diri', 'Roman', 'Sastra', 'Bisnis', 'Sejarah', 'Klasik'] as const;
export const PUBLISHER_TIERS = ['FREE', 'PELAJAR', 'PERSONAL', 'PLUS', 'FAMILY', 'PREMIUM'] as const;

export function normalizeCatalogText(value: string): string {
  return value.normalize('NFKC').trim().replace(/\s+/g, ' ').toLocaleLowerCase('id-ID');
}

export function catalogFingerprint(title: string, author: string): string {
  return JSON.stringify([normalizeCatalogText(title), normalizeCatalogText(author)]);
}

export function normalizeBookIsbn(value: string): string | null {
  const isbn = value.replace(/[\s-]/g, '').toUpperCase();
  if (!isbn) return null;
  if (!/^(?:\d{13}|\d{9}[\dX])$/.test(isbn)) {
    throw new Error('ISBN harus 10 atau 13 karakter angka yang valid.');
  }
  return isbn;
}

export function parsePublisherBookFields(formData: FormData) {
  const field = (name: string) => {
    const value = formData.get(name);
    return typeof value === 'string' ? value.trim() : '';
  };
  const title = field('title');
  const author = field('author');
  const description = field('description');
  const genre = field('genre');
  const language = field('language') || 'ID';
  const subscriptionRequired = field('subscriptionRequired') || 'FREE';
  const isbn = normalizeBookIsbn(field('isbn'));
  const yearValue = field('year');
  const pageValue = field('pageCount');
  const year = yearValue ? Number(yearValue) : null;
  const pageCount = pageValue ? Number(pageValue) : null;

  if (!title || !author) throw new Error('Judul dan penulis wajib diisi sebelum menyimpan draft.');
  if (title.length > 200 || author.length > 160) throw new Error('Judul atau nama penulis terlalu panjang.');
  if (description.length > 5000) throw new Error('Sinopsis maksimal 5.000 karakter.');
  if (genre && !PUBLISHER_GENRES.includes(genre as typeof PUBLISHER_GENRES[number])) throw new Error('Kategori buku tidak valid.');
  if (!['ID', 'EN'].includes(language)) throw new Error('Bahasa buku tidak valid.');
  if (!PUBLISHER_TIERS.includes(subscriptionRequired as typeof PUBLISHER_TIERS[number])) throw new Error('Tipe akses tidak valid.');
  if (year !== null && (!Number.isInteger(year) || year < 1900 || year > 2100)) throw new Error('Tahun terbit harus antara 1900 dan 2100.');
  if (pageCount !== null && (!Number.isInteger(pageCount) || pageCount < 1)) throw new Error('Jumlah halaman harus bilangan positif.');

  return {
    title, author, description, genre, language, subscriptionRequired, isbn, year, pageCount,
    catalogFingerprint: isbn ? null : catalogFingerprint(title, author),
  };
}

export function reviewRequirements(book: { description: string | null; genre: string; coverKey: string | null; epubKey: string | null }): string[] {
  const missing: string[] = [];
  if (!book.description?.trim()) missing.push('sinopsis');
  let genres: unknown;
  try { genres = JSON.parse(book.genre); } catch { genres = []; }
  if (!Array.isArray(genres) || genres.length === 0) missing.push('kategori');
  if (!book.coverKey) missing.push('cover');
  if (!book.epubKey) missing.push('file EPUB/PDF');
  return missing;
}
