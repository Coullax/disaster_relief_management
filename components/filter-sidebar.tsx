'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'
import { useState, useTransition } from 'react'

interface FilterSidebarProps {
  currentType: string
  currentCategory: string
  currentSearch: string
}

export function FilterSidebar({ currentType, currentCategory, currentSearch }: FilterSidebarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [searchValue, setSearchValue] = useState(currentSearch)

  const handleSearch = (value: string) => {
    setSearchValue(value)
    const params = new URLSearchParams(searchParams.toString())
    
    if (value) {
      params.set('search', value)
    } else {
      params.delete('search')
    }
    
    // Reset to page 1 when searching
    params.delete('page')
    
    const newUrl = params.toString() ? `/?${params.toString()}` : '/'
    
    startTransition(() => {
      router.push(newUrl)
    })
  }

  return (
    <div className="bg-white rounded-lg p-4 space-y-4 sticky top-24">
      {/* Search Bar */}
      <div className="pb-4 border-b">
        <label htmlFor="search" className="block text-sm font-semibold mb-2">
          Search
        </label>
        <div className="relative">
          <input
            type="text"
            id="search"
            name="search"
            placeholder="Search listings..."
            value={searchValue}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full px-3 py-2 pl-9 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>
      </div>

      {/* Category Filter */}
      <details className="group" open>
        <summary className="flex justify-between items-center cursor-pointer font-semibold text-sm">
          Category
          <span className="group-open:rotate-45 transition-transform">+</span>
        </summary>
        <div className="mt-3 space-y-2 text-sm">
          <Link href={`/?type=${currentType}`}>
            <div className={`p-2 rounded hover:bg-gray-100 ${!currentCategory ? 'bg-gray-100 font-medium' : ''}`}>
              All Categories
            </div>
          </Link>
          {['medical', 'shelter', 'transport', 'other'].map((cat) => (
            <Link key={cat} href={`/?type=${currentType}&category=${cat}${currentSearch ? `&search=${currentSearch}` : ''}`}>
              <div className={`p-2 rounded hover:bg-gray-100 capitalize ${currentCategory === cat ? 'bg-gray-100 font-medium' : ''}`}>
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="text-xs text-gray-500 mt-2">
              District filtering coming soon
            </div>
          </div>
        </details>
      </div>
    </div>
  )
}
