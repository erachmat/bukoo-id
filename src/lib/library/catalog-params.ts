export const LIBRARY_GENRES = [
  'Semua',
  'Fiksi',
  'Non-Fiksi',
  'Sastra',
  'Pengembangan Diri',
  'Bisnis',
  'Sejarah',
  'Roman',
  'Klasik',
] as const

export type LibraryGenre = (typeof LIBRARY_GENRES)[number]

export type LibraryAccess = 'all' | 'free' | 'premium'
export type LibraryLang = 'all' | 'id' | 'en'
export type LibrarySort = 'popular' | 'newest' | 'rating'

export type LibraryCatalogParams = {
  q: string
  genre: string
  access: LibraryAccess
  lang: LibraryLang
  sort: LibrarySort
}

const SORT_VALUES: LibrarySort[] = ['popular', 'newest', 'rating']
const ACCESS_VALUES: LibraryAccess[] = ['all', 'free', 'premium']
const LANG_VALUES: LibraryLang[] = ['all', 'id', 'en']

export function parseLibraryCatalogParams(
  raw: Record<string, string | string[] | undefined>,
): LibraryCatalogParams {
  const pick = (key: string): string | undefined => {
    const v = raw[key]
    if (Array.isArray(v)) return v[0]
    return v
  }

  const q = pick('q')?.trim() ?? ''
  const genreRaw = pick('genre')?.trim() ?? 'Semua'
  const genre = LIBRARY_GENRES.includes(genreRaw as LibraryGenre)
    ? genreRaw
    : 'Semua'

  const accessPick = pick('access') as LibraryAccess | undefined
  const access = ACCESS_VALUES.includes(accessPick as LibraryAccess)
    ? (accessPick as LibraryAccess)
    : 'all'

  const langPick = pick('lang') as LibraryLang | undefined
  const lang = LANG_VALUES.includes(langPick as LibraryLang)
    ? (langPick as LibraryLang)
    : 'all'

  const sortPick = pick('sort') as LibrarySort | undefined
  const sort = SORT_VALUES.includes(sortPick as LibrarySort)
    ? (sortPick as LibrarySort)
    : 'popular'

  return { q, genre, access, lang, sort }
}

export function serializeLibraryParams(p: LibraryCatalogParams): string {
  const params = new URLSearchParams()

  if (p.q.trim()) params.set('q', p.q.trim())

  if (p.genre !== 'Semua') params.set('genre', p.genre)

  if (p.access !== 'all') params.set('access', p.access)

  if (p.lang !== 'all') params.set('lang', p.lang)

  if (p.sort !== 'popular') params.set('sort', p.sort)

  return params.toString()
}

export function libraryPath(p: LibraryCatalogParams): string {
  const qs = serializeLibraryParams(p)
  return qs ? `/library?${qs}` : '/library'
}

export function mergeLibraryPath(
  current: URLSearchParams,
  updates: Partial<LibraryCatalogParams>,
): string {
  const cur = parseLibraryCatalogParams(Object.fromEntries(current.entries()))
  const merged: LibraryCatalogParams = { ...cur, ...updates }
  return libraryPath(merged)
}
