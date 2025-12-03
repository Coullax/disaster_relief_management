import { createClient } from '@/lib/supabase/server'
import { incrementListingViewCount } from '@/lib/actions/listings'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { MapPin, Calendar, Mail, Phone, User } from 'lucide-react'
import Link from 'next/link'

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

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="relative h-96 w-full bg-muted rounded-lg overflow-hidden">
            {listing.media_urls && listing.media_urls.length > 0 ? (
              <img
                src={listing.media_urls[0]}
                alt={listing.title}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full text-muted-foreground bg-secondary">
                No Image
              </div>
            )}
            <Badge
              className="absolute top-4 right-4 text-lg px-4 py-1 capitalize"
              variant={listing.type === 'need' ? 'destructive' : 'default'}
            >
              {listing.type}
            </Badge>
          </div>

          <div>
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-3xl font-bold">{listing.title}</h1>
              <Badge variant="outline" className="text-sm capitalize">
                {listing.category}
              </Badge>
            </div>
            
            <div className="flex items-center text-muted-foreground mb-6 space-x-4">
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                {listing.location}
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {new Date(listing.created_at).toLocaleDateString()}
              </div>
            </div>

            <div className="prose max-w-none">
              <h3 className="text-xl font-semibold mb-2">Description</h3>
              <p className="whitespace-pre-wrap">{listing.description}</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="font-semibold text-lg">Contact Information</h3>
              
              {listing.contact_email && (
                <div className="flex items-center">
                  <Mail className="w-4 h-4 mr-2 text-muted-foreground" />
                  <a href={`mailto:${listing.contact_email}`} className="hover:underline">
                    {listing.contact_email}
                  </a>
                </div>
              )}
              
              {listing.contact_phone && (
                <div className="flex items-center">
                  <Phone className="w-4 h-4 mr-2 text-muted-foreground" />
                  <a href={`tel:${listing.contact_phone}`} className="hover:underline">
                    {listing.contact_phone}
                  </a>
                </div>
              )}

              {!listing.contact_email && !listing.contact_phone && (
                <p className="text-muted-foreground text-sm">
                  No direct contact info provided. Use the button below to offer help.
                </p>
              )}

              <Button className="w-full" size="lg">
                {listing.type === 'need' ? 'Offer Help' : 'Request Help'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-4">Posted by</h3>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                  <User className="w-6 h-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">
                    {listing.profiles?.full_name || 'Anonymous User'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Member since {new Date(listing.created_at).getFullYear()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
