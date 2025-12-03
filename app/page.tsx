import { getListings } from '@/lib/actions/listings'
import { ListingCard } from '@/components/listing-card'
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

  const currentType = type || 'need'
  const heading = currentType === 'need' ? 'People Needing Help' : 'People Offering Help'
  const subheading = currentType === 'need' 
    ? 'People who need your help. Contact them directly.' 
    : 'People ready to help. Reach out to them.'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">FloodRelief Hub</h1>
            <Button asChild>
              <Link href="/create-listing">Create Listing</Link>
            </Button>
          </div>

          {/* Simple Tabs */}
          <div className="flex gap-2">
            <Link href="/?type=need">
              <button
                className={`px-6 py-2 rounded-full font-medium transition-all ${
                  currentType === 'need'
                    ? 'bg-gray-200 text-gray-900'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                I need help
              </button>
            </Link>
            <Link href="/?type=offer">
              <button
                className={`px-6 py-2 rounded-full font-medium transition-all ${
                  currentType === 'offer'
                    ? 'bg-gray-200 text-gray-900'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                I can help
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Filters */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-lg p-4 space-y-4 sticky top-24">
              {/* Category Filter */}
              <details className="group">
                <summary className="flex justify-between items-center cursor-pointer font-semibold text-sm">
                  Category
                  <span className="group-open:rotate-45 transition-transform">+</span>
                </summary>
                <div className="mt-3 space-y-2 text-sm">
                  {['medical', 'shelter', 'transport', 'other'].map((cat) => (
                    <Link key={cat} href={`/?type=${currentType}&category=${cat}`}>
                      <div className={`p-2 rounded hover:bg-gray-100 capitalize ${category === cat ? 'bg-gray-100 font-medium' : ''}`}>
                        {cat}
                      </div>
                    </Link>
                  ))}
                </div>
              </details>

              <div className="border-t pt-4">
                {/* District Filter */}
                <details className="group">
                  <summary className="flex justify-between items-center cursor-pointer font-semibold text-sm">
                    District
                    <span className="group-open:rotate-45 transition-transform">+</span>
                  </summary>
                  <div className="mt-3 space-y-2 text-sm max-h-64 overflow-y-auto">
                    <input 
                      type="text" 
                      placeholder="Search district..." 
                      className="w-full px-3 py-2 border rounded-md text-sm"
                    />
                  </div>
                </details>
              </div>
            </div>
          </aside>

          {/* Listings */}
          <main className="lg:col-span-3">
            {/* Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-1">{heading}</h2>
              <p className="text-gray-600 text-sm">{subheading}</p>
            </div>

            {/* Listings */}
            {listings.length === 0 ? (
              <div className="bg-white rounded-lg p-12 text-center">
                <p className="text-gray-500">No listings found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {listings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {count && count > 10 && (
              <div className="mt-6 flex justify-center gap-2">
                {page > 1 && (
                  <Button variant="outline" asChild>
                    <Link href={`/?page=${page - 1}&type=${type}&category=${category}`}>
                      Previous
                    </Link>
                  </Button>
                )}
                {count > page * 10 && (
                  <Button variant="outline" asChild>
                    <Link href={`/?page=${page + 1}&type=${type}&category=${category}`}>
                      Next
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
