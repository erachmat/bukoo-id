'use server'

import { signIn as nextAuthSignIn, signOut as nextAuthSignOut } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

export async function signUp(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const name = formData.get('name') as string

  const existing = await prisma.user.findUnique({
    where: { email }
  })

  if (existing) {
    return redirect(`/register?error=${encodeURIComponent('Email ini sudah terdaftar. Silakan masuk atau gunakan email lain.')}`)
  }

  const hashedPassword = await bcrypt.hash(password, 12)

  await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
    }
  })

  // Auto sign-in after registration
  try {
    await nextAuthSignIn("credentials", {
      email,
      password,
      redirectTo: "/library",
    })
  } catch (error: any) {
    if (error.type === "CredentialsSignin") {
        return redirect(`/login?error=${encodeURIComponent('Pendaftaran berhasil, silakan masuk secara manual.')}`)
    }
    if (error.message === "NEXT_REDIRECT") {
        revalidatePath('/', 'layout')
        throw error
    }
    throw error
  }
}

export async function signIn(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  try {
    await nextAuthSignIn("credentials", {
      email,
      password,
      redirectTo: "/library",
    })
  } catch (error: any) {
    if (error.type === "CredentialsSignin") {
        return redirect(`/login?error=${encodeURIComponent('Email atau password salah.')}`)
    }
    // NextAuth throws a redirect error for successful sign-ins, so we need to re-throw it
    // if it's a redirect, otherwise we can handle the error.
    if (error.message === "NEXT_REDIRECT") {
        revalidatePath('/', 'layout')
        throw error
    }
    // For other errors, redirect back with message
    return redirect(`/login?error=${encodeURIComponent('Terjadi kesalahan. Silakan coba lagi.')}`)
  }
}

export async function signOut() {
  await nextAuthSignOut({ redirectTo: "/" })
}

export async function resetPassword(formData: FormData) {
  const email = formData.get('email') as string
  const newPassword = formData.get('password') as string

  const existing = await prisma.user.findUnique({
    where: { email }
  })

  if (!existing) {
    return redirect(`/forgot-password?error=${encodeURIComponent('Email tidak ditemukan.')}`)
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12)
  await prisma.user.update({
    where: { email },
    data: { password: hashedPassword }
  })

  return redirect(`/login?message=${encodeURIComponent('Kata sandi berhasil diperbarui. Silakan masuk.')}`)
}

export async function signInWithGoogle() {
  try {
    await nextAuthSignIn("google", { redirectTo: "/library" })
  } catch (error: any) {
    if (error.message === "NEXT_REDIRECT") {
      revalidatePath('/', 'layout')
      throw error
    }
    throw error
  }
}


