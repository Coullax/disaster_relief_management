'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function createListing(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const type = formData.get('type') as 'need' | 'offer'
  const category = formData.get('category') as string
  const location = formData.get('location') as string
  let contact_email = formData.get('contact_email') as string
  if (!contact_email && user?.email) {
    contact_email = user.email
  }
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

  // Find or create profile based on contact info
  let profileId = user?.id

  if (!profileId) {
    // Check if profile exists with email or phone
    const query = supabase.from('profiles').select('id')
    
    if (contact_email) {
      query.or(`email.eq.${contact_email}`)
    }
    if (contact_phone) {
      // Note: This OR logic with previous might need careful construction if both exist
      // Simple approach: check both independently or use OR syntax correctly
      // .or(`email.eq.${contact_email},phone.eq.${contact_phone}`)
      // But we need to handle if one is missing.
      
      let orQuery = ''
      if (contact_email) orQuery += `email.eq.${contact_email}`
      if (contact_email && contact_phone) orQuery += ','
      if (contact_phone) orQuery += `phone.eq.${contact_phone}`
      
      if (orQuery) query.or(orQuery)
    }

    const { data: existingProfiles } = await query.limit(1)

    if (existingProfiles && existingProfiles.length > 0) {
      profileId = existingProfiles[0].id
    } else {
      // Create new profile
      const { data: newProfile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          email: contact_email || null,
          phone: contact_phone || null,
          full_name: 'Anonymous User', // Or derive from something else if available
        })
        .select()
        .single()

      if (profileError) {
        console.error('Error creating profile:', profileError)
        return { error: 'Failed to create user profile' }
      }
      profileId = newProfile.id
    }
  }

  // Check for existing listings to determine status
  let status = 'active'
  if (profileId) {
    const { count } = await supabase
      .from('listings')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', profileId)

    if (count && count > 0) {
      status = 'pending'
    }
  }

  const { error } = await supabase.from('listings').insert({
    user_id: profileId,
    title,
    description,
    type,
    category,
    location,
    contact_email,
    contact_phone,
    media_urls,
    status,
  })

  if (error) {
    console.error('Error creating listing:', error)
    return { error: 'Failed to create listing' }
  }

  revalidatePath('/')
  redirect('/')
}
