'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ListingCard } from '@/components/listing-card'
import { Listing } from '@/lib/actions/listings'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth')
  }

  // Fetch user's listings
  const { data: listings } = await supabase
    .from('listings')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button asChild>
          <Link href="/create-listing">Create New Listing</Link>
        </Button>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>My Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-2">Email: {user.email}</p>
            <p className="text-sm text-muted-foreground">
              User ID: {user.id}
            </p>
            {/* TODO: Add profile edit form */}
          </CardContent>
        </Card>

        <div>
          <h2 className="text-2xl font-semibold mb-4">My Listings</h2>
          {listings && listings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing as Listing} />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">You haven't created any listings yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}
