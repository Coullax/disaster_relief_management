'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function ListingTypeTabs() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentType = searchParams.get('type') || 'all'

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (value === 'all') {
      params.delete('type')
    } else {
      params.set('type', value)
    }
    
    // Reset to page 1 when changing tabs
    params.delete('page')
    
    const newUrl = params.toString() ? `/?${params.toString()}` : '/'
    router.push(newUrl)
  }

  return (
    <Tabs value={currentType} onValueChange={handleTabChange} className="w-full">
      <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 h-11">
        <TabsTrigger value="all" className="text-sm font-semibold">
          🌐 All Listings
        </TabsTrigger>
        <TabsTrigger value="need" className="text-sm font-semibold">
          🆘 Request Help
        </TabsTrigger>
        <TabsTrigger value="offer" className="text-sm font-semibold">
          🤝 Offer Help
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
