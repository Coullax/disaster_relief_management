'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search } from 'lucide-react'
import { useState } from 'react'

export function SearchFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [category, setCategory] = useState(searchParams.get('category') || 'all')
  const [type, setType] = useState(searchParams.get('type') || 'all')

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (category && category !== 'all') params.set('category', category)
    if (type && type !== 'all') params.set('type', type)
    
    router.push(`/?${params.toString()}`)
  }

  return (
    <div className="bg-card p-4 rounded-lg shadow-sm border mb-6 space-y-4 md:space-y-0 md:flex md:items-center md:gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search listings..."
          className="pl-8"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
      </div>
      <Select value={category} onValueChange={setCategory}>
        <SelectTrigger className="w-full md:w-[180px]">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          <SelectItem value="food">Food & Water</SelectItem>
          <SelectItem value="medical">Medical</SelectItem>
          <SelectItem value="shelter">Shelter</SelectItem>
          <SelectItem value="transport">Transport</SelectItem>
          <SelectItem value="other">Other</SelectItem>
        </SelectContent>
      </Select>
      <Select value={type} onValueChange={setType}>
        <SelectTrigger className="w-full md:w-[180px]">
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="need">Requesting Help</SelectItem>
          <SelectItem value="offer">Offering Help</SelectItem>
        </SelectContent>
      </Select>
      <Button onClick={handleSearch} className="w-full md:w-auto">
        Search
      </Button>
    </div>
  )
}
