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
    <div className="bg-white rounded-lg p-4 space-y-4 border-[#D9D9D9] border">
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
          {[
            { value: 'business', label: 'Business' },
            { value: 'education', label: 'Education' },
            { value: 'financial', label: 'Financial Assistance' },
            { value: 'legal', label: 'Legal Aid' },
            { value: 'shelter', label: 'Shelter' },
            { value: 'veterinary', label: 'Veterinary Services' },
            { value: 'other', label: 'Other' }
          ].map((cat) => (
            <Link key={cat.value} href={`/?type=${currentType}&category=${cat.value}${currentSearch ? `&search=${currentSearch}` : ''}`}>
              <div className={`p-2 rounded hover:bg-gray-100 ${currentCategory === cat.value ? 'bg-gray-100 font-medium' : ''}`}>
                {cat.label}
              </div>
            </Link>
          ))}
        </div>
      </details>

      <div className="border-t pt-4">
    
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

export function InformationalCard() {
  return (
    <div className="bg-white rounded-lg p-5 shadow-sm border-[#D9D9D9] border">
      <h3 className="font-bold text-[24px] mb-4">A Little Heads Up for Everyone</h3>
      
      <div className="mb-4">
        <h4 className="font-semibold text-sm mb-2">Instructions for Donors</h4>
        <ul className="space-y-1.5 text-xs text-gray-700 list-disc list-inside leading-relaxed">
          <li>Review the fundraiser details carefully before donating.</li>
          <li>Check the documents and information provided by the small business or individual.</li>
          <li>Donate only through the official payment channels shown on the platform.</li>
          <li>Do not send money directly to fundraisers' personal accounts.</li>
          <li>Keep your payment confirmation for future reference.</li>
          <li>Report any suspicious activity or mismatched information immediately.</li>
          <li>Remember, we are only an intermediary platform — we do not directly verify every fundraiser.</li>
        </ul>
      </div>

      <div>
        <h4 className="font-semibold text-sm mb-2">Instructions for Fundraisers</h4>
        <ul className="space-y-1.5 text-xs text-gray-700 list-disc list-inside leading-relaxed">
          <li>Provide accurate and honest information about your situation.</li>
          <li>Upload supporting documents (business proof, damage photos, ID, etc.).</li>
          <li>Clearly explain how the funds will be used for recovery.</li>
          <li>Keep your fundraiser updates transparent and timely.</li>
          <li>Do not attempt to create multiple or duplicate fundraisers for the same cause.</li>
          <li>Respond promptly to donor questions or platform review requests.</li>
          <li>Withdraw funds only through the secure platform process.</li>
          <li>Any suspicious or fraudulent activity will result in immediate removal.</li>
        </ul>
      </div>
    </div>
  )
}
