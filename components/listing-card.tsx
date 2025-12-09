'use client'

import Link from 'next/link'
import { Listing } from '@/lib/actions/listings'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MapPin, Phone, MessageCircle, User } from 'lucide-react'

interface ListingCardProps {
  listing: Listing
}

export function ListingCard({ listing }: ListingCardProps) {
  const isNeed = listing.type === 'need'

  const formatPhoneForWhatsApp = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '')
    if (!cleaned.startsWith('94')) {
      return `94${cleaned}`
    }
    return cleaned
  }

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation() // Prevent card click
    if (listing.contact_phone) {
      const whatsappNumber = formatPhoneForWhatsApp(listing.contact_phone)
      const message = encodeURIComponent(
        `Hi, I'm interested in your ${listing.type}: ${listing.title}`
      )
      window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank')
    }
  }

  const getDaysAgo = (date: string) => {
    const days = Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24))
    if (days === 0) return 'Today'
    if (days === 1) return '1 day ago'
    return `${days} days ago`
  }

  return (
    <Card className="relative p-4 hover:shadow-md transition-shadow bg-white group">
      <div className="flex gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isNeed ? 'bg-orange-100' : 'bg-blue-100'
            }`}>
            <User className={`w-6 h-6 ${isNeed ? 'text-orange-600' : 'text-blue-600'}`} />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Badges and Meta */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className="bg-yellow-400 text-black hover:bg-yellow-500 font-semibold text-xs px-2 py-0.5">
                {isNeed ? 'HELPER' : 'VOLUNTEER'}
              </Badge>
              {listing.contact_phone && (
                <Badge className="bg-green-100 text-green-700 hover:bg-green-200 font-medium text-xs px-2 py-0.5">
                  ✓ VOLUNTEER / FREE
                </Badge>
              )}
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-xs font-medium text-gray-900">
                {listing.profiles?.full_name || 'LIGHTUP LANKA'}
              </div>
              <div className="text-xs text-gray-500">
                {getDaysAgo(listing.created_at)}
              </div>
            </div>
          </div>

          {/* Title with Stretched Link */}
          <h3 className="font-bold text-base mb-1 group-hover:text-blue-600 transition-colors line-clamp-1">
            <Link href={`/listings/${listing.id}`} className="before:absolute before:inset-0 outline-none rounded-lg">
              <span className="absolute inset-0" aria-hidden="true" />
              {listing.title}
            </Link>
          </h3>

          {/* Description */}
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
            {listing.description}
          </p>

          {/* Location and Actions */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            {/* Location */}
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
              <span className="line-clamp-1">{listing.location}</span>
            </div>

            {/* Action Buttons - These act as z-index layers above the stretched link */}
            <div className="flex items-center gap-2 relative z-10">
              {listing.contact_phone && (
                <>
                  {/* WhatsApp Button */}
                  <Button
                    onClick={handleWhatsAppClick}
                    size="sm"
                    className="bg-green-500 hover:bg-green-600 text-white h-9 w-9 p-0 rounded-full"
                    title="Contact via WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </Button>

                  {/* Call Now Button */}
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="border-gray-300 hover:bg-gray-100 h-9 px-4 font-semibold text-xs"
                  >
                    <a href={`tel:${listing.contact_phone}`}>
                      <Phone className="w-3 h-3 mr-1.5" />
                      CALL NOW
                    </a>
                  </Button>
                </>
              )}

              {/* View Details - Removed secondary link since whole card is clickable, or make it z-10 if desired */}
              {!listing.contact_phone && (
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="h-9 px-4"
                >
                  <Link href={`/listings/${listing.id}`}>
                    View Details
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
