'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { writeFile, mkdir, unlink } from 'fs/promises'
import path from 'path'
import { prisma } from '@/lib/prisma'

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function saveUploadedFile(file: File, prefix: string): Promise<string> {
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
  await mkdir(uploadsDir, { recursive: true })

  const ext = file.name.split('.').pop() ?? 'bin'
  const filename = `${prefix}-${Date.now()}.${ext}`
  const filepath = path.join(uploadsDir, filename)
  await writeFile(filepath, Buffer.from(await file.arrayBuffer()))
  return `/uploads/${filename}`
}

async function deleteFile(publicPath: string | null | undefined) {
  if (!publicPath) return
  try {
    const absPath = path.join(process.cwd(), 'public', publicPath)
    await unlink(absPath)
  } catch {
    // File might not exist — ignore
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

  if (coverFile && coverFile.size > 0) {
    coverUrl = await saveUploadedFile(coverFile, 'cover')
  }
  if (epubFile && epubFile.size > 0) {
    fileUrl = await saveUploadedFile(epubFile, 'epub')
  }

  await prisma.book.create({
    data: {
      title,
      author,
      description: description || null,
      coverUrl: coverUrl ?? null,
      fileUrl: fileUrl ?? null,
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

  if (coverFile && coverFile.size > 0) {
    await deleteFile(existing.coverUrl)
    coverUrl = await saveUploadedFile(coverFile, 'cover')
  }
  if (epubFile && epubFile.size > 0) {
    await deleteFile(existing.fileUrl)
    fileUrl = await saveUploadedFile(epubFile, 'epub')
  }

  await prisma.book.update({
    where: { id },
    data: {
      title,
      author,
      description: description || null,
      coverUrl,
      fileUrl,
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
