'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { put, del } from '@vercel/blob'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

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
  if (publicUrl.includes('public.blob.vercel-storage.com')) {
    try {
      await del(publicUrl)
    } catch {
      // File might not exist — ignore
    }
  }
}

async function getPublisherUser() {
  const session = await auth()
  const user = session?.user
  if (!user || (user as any).role !== 'PUBLISHER') {
    throw new Error('Unauthorized')
  }
  return user
}

// ─── Create ──────────────────────────────────────────────────────────────────

export async function createPublisherBook(formData: FormData) {
  const user = await getPublisherUser()

  const title = formData.get('title') as string
  const author = formData.get('author') as string
  const description = formData.get('description') as string
  const genre = formData.get('genre') as string
  const language = formData.get('language') as 'ID' | 'EN'
  const subscriptionRequired = formData.get('subscriptionRequired') as any || 'FREE'
  const year = formData.get('year') ? Number(formData.get('year')) : null
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
      subscriptionRequired,
      isPublished: true,
      year: year ?? null,
      publisher: user.name || 'Mitra Penerbit',
      publisherUserId: user.id,
      pageCount: pageCount ?? null,
    },
  })

  revalidatePath('/publisher/books')
  revalidatePath('/publisher/dashboard')
  redirect('/publisher/books')
}

// ─── Delete ──────────────────────────────────────────────────────────────────

export async function deletePublisherBook(id: string) {
  const user = await getPublisherUser()

  const book = await prisma.book.findFirst({
    where: { id, publisherUserId: user.id },
  })

  if (!book) {
    throw new Error('Book not found or unauthorized')
  }

  await deleteFile(book.coverUrl)
  await deleteFile(book.fileUrl)
  
  await prisma.book.delete({
    where: { id },
  })

  revalidatePath('/publisher/books')
  revalidatePath('/publisher/dashboard')
}
