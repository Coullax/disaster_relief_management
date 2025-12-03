import { getListings } from '@/lib/actions/listings'
import { ListingCard } from '@/components/listing-card'
import { FilterSidebar, InformationalCard } from '@/components/filter-sidebar'
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
  const heading = 'People Needing Help'
  const subheading = 'Connect with those affected by disasters and provide direct assistance.'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Logo and Hero Banner */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Logo and Title - Left Side */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <img 
                  src="/branding/logo.png" 
                  alt="DisasterRelief Management Logo" 
                  className="h-22 w-auto"
                />
              </div>
              <h1 className="text-3xl font-bold">CareBridge</h1>
            </div>

            {/* Hero Banner - Right Side */}
            <div className="md:col-span-2">
              <div className="relative h-40 rounded-lg overflow-hidden shadow-lg">
                <img 
                  src="/branding/hero-banner.png" 
                  alt="Disaster Relief Management - Resilience and Recovery" 
                  className="w-full h-full object-cover"
                />
                {/* <div className="absolute inset-0 bg-gradient-to-r from-gray-900/30 to-transparent"></div>
                <div className="absolute top-4 right-4 w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                  </svg>
                </div> */}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-6 space-y-4">
              <FilterSidebar 
                currentType={currentType} 
                currentCategory={category}
                currentSearch={search}
              />
              <InformationalCard />
            </div>
          </aside>

          {/* Main Listings */}
          <main className="lg:col-span-3">
            {/* Tabs and Share Button */}
            <div className="flex items-center justify-between mb-6 gap-4">
              <div className="flex gap-2">
                <Link href="/?type=need">
                  <button
                    className={`px-6 py-2.5 rounded font-medium transition-all ${
                      currentType === 'need'
                        ? 'bg-gray-800 text-white shadow-md'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    See who Needs Help
                  </button>
                </Link>
                <Link href="/?type=offer">
                  <button
                    className={`px-6 py-2.5 rounded font-medium transition-all ${
                      currentType === 'offer'
                        ? 'bg-gray-800 text-white shadow-md'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    See who&apos;s Helping
                  </button>
                </Link>
              </div>
              <Button asChild className="bg-green-600 hover:bg-green-700 text-white font-semibold">
                <Link href="/create-listing">Share Your Request</Link>
              </Button>
            </div>

            {/* Section Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-1">{heading}</h2>
              <p className="text-gray-600 text-sm">{subheading}</p>
            </div>

            {/* Listings */}
            {listings.length === 0 ? (
              <div className="bg-white rounded-lg p-12 text-center shadow-sm">
                <p className="text-gray-500">No listings found</p>
                {(search || category) && (
                  <p className="text-sm text-gray-400 mt-2">
                    Try adjusting your search or filters
                  </p>
                )}
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
                    <Link href={`/?page=${page - 1}&type=${type}&category=${category}&search=${search}`}>
                      Previous
                    </Link>
                  </Button>
                )}
                {count > page * 10 && (
                  <Button variant="outline" asChild>
                    <Link href={`/?page=${page + 1}&type=${type}&category=${category}&search=${search}`}>
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
