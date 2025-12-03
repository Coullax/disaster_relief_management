import { createClient } from '@/lib/supabase/server'
import { incrementListingViewCount } from '@/lib/actions/listings'
import { notFound } from 'next/navigation'
import { ListingDetailClient } from '@/components/listing-detail-client'

export default async function ListingPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: listing } = await supabase
    .from('listings')
    .select('*, profiles(full_name, avatar_url)')
    .eq('id', id)
    .single()

  if (!listing) {
    notFound()
  }

  // Increment view count (fire and forget - don't await)
  incrementListingViewCount(id).catch(console.error)

  return <ListingDetailClient listing={listing} />
}
