import { getListings } from '@/lib/actions/listings'
import { ListingCard } from '@/components/listing-card'
import { SearchFilters } from '@/components/search-filters'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const page = typeof params.page === 'string' ? Number(params.page) : 1
  const search = typeof params.search === 'string' ? params.search : ''
  const category = typeof params.category === 'string' ? params.category : ''
  const type = typeof params.type === 'string' ? params.type : ''

  const { listings, count } = await getListings({ page, search, category, type })

  return (
    <main className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">FloodRelief Hub</h1>
          <p className="text-muted-foreground">
            Connecting those in need with those who can help.
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/create-listing">Request Help / Offer Help</Link>
        </Button>
      </div>

      <SearchFilters />

      {listings.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold mb-2">No listings found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search or filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
      
      {/* Simple Pagination */}
      <div className="mt-8 flex justify-center gap-2">
        {page > 1 && (
          <Button variant="outline" asChild>
            <Link href={`/?page=${page - 1}&search=${search}&category=${category}&type=${type}`}>
              Previous
            </Link>
          </Button>
        )}
        {count && count > page * 10 && (
          <Button variant="outline" asChild>
            <Link href={`/?page=${page + 1}&search=${search}&category=${category}&type=${type}`}>
              Next
            </Link>
          </Button>
        )}
      </div>
    </main>
  )
}
