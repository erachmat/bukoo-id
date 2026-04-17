'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

// The deployed site URL - used for email redirect links
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://bukoo-woad.vercel.app'

export async function signUp(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const name = formData.get('name') as string

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: name },
      emailRedirectTo: `${SITE_URL}/auth/callback`,
    },
  })

  if (error) {
    return redirect(`/register?error=${encodeURIComponent(error.message)}`)
  }

  // If identities is empty, the user already exists (Supabase security behavior)
  if (data?.user && data.user.identities?.length === 0) {
    return redirect(
      `/register?error=${encodeURIComponent('Email ini sudah terdaftar. Silakan masuk atau gunakan email lain.')}`
    )
  }

  return redirect('/register?success=Cek%20email%20Anda%20untuk%20konfirmasi%20akun!')
}

export async function signIn(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return redirect(`/login?error=${encodeURIComponent(error.message)}`)
  }

  return redirect('/library')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  return redirect('/')
}
