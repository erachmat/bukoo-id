'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { put, del } from '@vercel/blob'
import { prisma } from '@/lib/prisma'

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function saveUploadedFile(file: File, prefix: string): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'bin'
  const filename = `${prefix}-${Date.now()}.${ext}`
  
  try {
    const blob = await put(filename, file, { access: 'public' })
    return blob.url
  } catch (err: any) {
    console.warn('Vercel Blob upload failed:', err.message)
    if (prefix === 'cover') {
      return `https://placehold.co/400x600?text=Cover+Preview`
    }
    return '#'
  }
}

async function deleteFile(publicUrl: string | null | undefined) {
  if (!publicUrl) return
  // Only try to delete from Blob if it's a vercel blob URL
  if (publicUrl.includes('public.blob.vercel-storage.com')) {
    try {
      await del(publicUrl)
    } catch {
      // File might not exist — ignore
    }
  }
}

// ─── Create ──────────────────────────────────────────────────────────────────

export async function createBook(formData: FormData) {
  const title = formData.get('title') as string
  const author = formData.get('author') as string
  const description = formData.get('description') as string
  const genre = formData.get('genre') as string
  const language = formData.get('language') as 'ID' | 'EN'
  const isPremium = formData.get('isPremium') === 'true'
  const year = formData.get('year') ? Number(formData.get('year')) : null
  const publisher = formData.get('publisher') as string | null
  const pageCount = formData.get('pageCount') ? Number(formData.get('pageCount')) : null

  const coverFile = formData.get('cover') as File | null
  const epubFile = formData.get('epub') as File | null

  let coverUrl: string | undefined
  let fileUrl: string | undefined

  let fileType: 'EPUB' | 'PDF' = 'EPUB'

  if (coverFile && coverFile.size > 0) {
    coverUrl = await saveUploadedFile(coverFile, 'cover')
  }
  if (epubFile && epubFile.size > 0) {
    fileUrl = await saveUploadedFile(epubFile, 'epub')
    if (epubFile.name.toLowerCase().endsWith('.pdf')) {
      fileType = 'PDF'
    }
  }

  await prisma.book.create({
    data: {
      title,
      author,
      description: description || null,
      coverUrl: coverUrl ?? null,
      fileUrl: fileUrl ?? null,
      fileType,
      genre: genre ? [genre] : [],
      language,
      isPremium,
      isPublished: true,
      year: year ?? null,
      publisher: publisher || null,
      pageCount: pageCount ?? null,
    },
  })

  revalidatePath('/admin/books')
  redirect('/admin/books')
}

// ─── Update ──────────────────────────────────────────────────────────────────

export async function updateBook(id: string, formData: FormData) {
  const existing = await prisma.book.findUnique({ where: { id } })
  if (!existing) redirect('/admin/books')

  const title = formData.get('title') as string
  const author = formData.get('author') as string
  const description = formData.get('description') as string
  const genre = formData.get('genre') as string
  const language = formData.get('language') as 'ID' | 'EN'
  const isPremium = formData.get('isPremium') === 'true'
  const year = formData.get('year') ? Number(formData.get('year')) : null
  const publisher = formData.get('publisher') as string | null
  const pageCount = formData.get('pageCount') ? Number(formData.get('pageCount')) : null

  const coverFile = formData.get('cover') as File | null
  const epubFile = formData.get('epub') as File | null

  let coverUrl = existing.coverUrl
  let fileUrl = existing.fileUrl
  let fileType = existing.fileType

  if (coverFile && coverFile.size > 0) {
    await deleteFile(existing.coverUrl)
    coverUrl = await saveUploadedFile(coverFile, 'cover')
  }
  if (epubFile && epubFile.size > 0) {
    await deleteFile(existing.fileUrl)
    fileUrl = await saveUploadedFile(epubFile, 'epub')
    fileType = epubFile.name.toLowerCase().endsWith('.pdf') ? 'PDF' : 'EPUB'
  }

  await prisma.book.update({
    where: { id },
    data: {
      title,
      author,
      description: description || null,
      coverUrl,
      fileUrl,
      fileType,
      genre: genre ? [genre] : [],
      language,
      isPremium,
      year: year ?? null,
      publisher: publisher || null,
      pageCount: pageCount ?? null,
    },
  })

  revalidatePath('/admin/books')
  redirect('/admin/books')
}

// ─── Delete ──────────────────────────────────────────────────────────────────

export async function deleteBook(id: string) {
  const book = await prisma.book.findUnique({ where: { id } })
  if (book) {
    await deleteFile(book.coverUrl)
    await deleteFile(book.fileUrl)
    await prisma.book.delete({ where: { id } })
  }
  revalidatePath('/admin/books')
}
