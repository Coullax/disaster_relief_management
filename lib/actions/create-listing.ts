'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function createListing(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth')
  }

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const type = formData.get('type') as 'need' | 'offer'
  const category = formData.get('category') as string
  const location = formData.get('location') as string
  const contact_email = formData.get('contact_email') as string
  const contact_phone = formData.get('contact_phone') as string
  
  // Handle media upload (simplified for now, assumes URLs or we need to implement upload)
  // For this step, we'll just insert the listing without media or assume media_urls is passed if we had a client uploader.
  // But the prompt says "Multipart/Form-data handling" and "Implement Image Upload".
  // We will implement image upload in a separate step or here.
  // Let's assume we upload first and get URLs, or upload here.
  // Uploading files in server action:
  const files = formData.getAll('media') as File[]
  const media_urls: string[] = []

  if (files.length > 0) {
    for (const file of files) {
      if (file.size > 0) {
        const name = `${Date.now()}-${file.name}`
        const { data, error } = await supabase.storage
          .from('media')
          .upload(name, file)
        
        if (data) {
          const { data: { publicUrl } } = supabase.storage
            .from('media')
            .getPublicUrl(name)
          media_urls.push(publicUrl)
        }
      }
    }
  }

  const { error } = await supabase.from('listings').insert({
    user_id: user.id,
    title,
    description,
    type,
    category,
    location,
    contact_email,
    contact_phone,
    media_urls,
    status: 'active',
  })

  if (error) {
    console.error('Error creating listing:', error)
    return { error: 'Failed to create listing' }
  }

  revalidatePath('/')
  revalidatePath('/dashboard')
  redirect('/dashboard')
}
