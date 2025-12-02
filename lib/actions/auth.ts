'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
      // emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`,
    },
  })

  if (error) {
    redirect('/auth?error=Could not authenticate user')
  }

  revalidatePath('/', 'layout')
  redirect('/auth/verify?email=' + encodeURIComponent(email))
}

export async function verifyOtp(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const token = formData.get('token') as string

  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email',
  })

  if (error) {
    redirect('/auth/verify?email=' + encodeURIComponent(email) + '&error=Invalid OTP')
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}
