'use server'

import { createClient } from '@/lib/supabase/server'
import { Database } from '@/types/database.types'

export type Listing = Database['public']['Tables']['listings']['Row']

export async function getListings({
  page = 1,
  limit = 10,
  search = '',
  category = '',
  location = '',
  type = '',
}: {
  page?: number
  limit?: number
  search?: string
  category?: string
  location?: string
  type?: string
}) {
  const supabase = await createClient()
  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = supabase
    .from('listings')
    .select('*', { count: 'exact' })
    .eq('status', 'active')
    // Sort by view_count ascending (lowest first), then by created_at descending
    .order('view_count', { ascending: true })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (search) {
    query = query.ilike('title', `%${search}%`)
  }

  if (category && category !== 'all') {
    query = query.eq('category', category)
  }

  if (location) {
    query = query.ilike('location', `%${location}%`)
  }

  if (type && type !== 'all') {
    query = query.eq('type', type)
  }

  const { data, error, count } = await query

  if (error) {
    console.error('Error fetching listings:', error)
    throw new Error('Failed to fetch listings')
  }

  return { listings: data as Listing[], count }
}

/**
 * Increment the view count for a listing
 * Called when a user views a listing detail page
 */
export async function incrementListingViewCount(listingId: string) {
  const supabase = await createClient()

  const { error } = await supabase.rpc('increment_listing_view_count', {
    listing_id: listingId,
  })

  if (error) {
    console.error('Error incrementing view count:', error)
    // Don't throw error - view count is not critical
  }
}

