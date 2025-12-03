'use client'

import Link from 'next/link'
import { Listing } from '@/lib/actions/listings'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MapPin, Calendar, ArrowRight, MessageCircle, Phone, Package } from 'lucide-react'

interface ListingCardProps {
  listing: Listing
}

export function ListingCard({ listing }: ListingCardProps) {
  // Format phone number for WhatsApp
  const formatPhoneForWhatsApp = (phone: string) => {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '')
    // Add country code if not present (assuming Sri Lanka +94)
    if (!cleaned.startsWith('94')) {
      return `94${cleaned}`
    }
    return cleaned
  }

  const handleWhatsAppClick = () => {
    if (listing.contact_phone) {
      const whatsappNumber = formatPhoneForWhatsApp(listing.contact_phone)
      const message = encodeURIComponent(
        `Hi, I'm interested in your ${listing.type}: ${listing.title}`
      )
      window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank')
    }
  }

  const isNeed = listing.type === 'need'

  return (
    <Card className={`group overflow-hidden flex flex-col h-full hover:shadow-lg transition-all duration-200 border-l-4 ${
      isNeed ? 'border-l-red-500 hover:border-l-red-600' : 'border-l-green-500 hover:border-l-green-600'
    }`}>
      {/* Compact Header with Type Badge */}
      <CardHeader className="p-4 pb-3 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <Badge
            className={`font-semibold text-xs ${
              isNeed 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-green-500 hover:bg-green-600'
            }`}
          >
            {isNeed ? '🆘 NEED HELP' : '🤝 OFFERING'}
          </Badge>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="capitalize text-xs font-medium">
              <Package className="w-3 h-3 mr-1" />
              {listing.category}
            </Badge>
          </div>
        </div>

        {/* Title - Most Important */}
        <h3 className="font-bold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
          {listing.title}
        </h3>
      </CardHeader>

      {/* Content - Essential Info Only */}
      <CardContent className="p-4 pt-0 flex-grow space-y-2.5">
        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
          {listing.description}
        </p>

        {/* Key Details Grid */}
        <div className="space-y-2 pt-1">
          {/* Location */}
          <div className="flex items-center text-sm font-medium bg-muted/50 rounded-md p-2">
            <MapPin className="w-4 h-4 mr-2 text-primary flex-shrink-0" />
            <span className="line-clamp-1">{listing.location}</span>
          </div>

          {/* Contact Phone */}
          {listing.contact_phone && (
            <div className="flex items-center text-sm font-medium bg-muted/30 rounded-md p-2">
              <Phone className="w-4 h-4 mr-2 text-green-600 flex-shrink-0" />
              <span className="line-clamp-1">{listing.contact_phone}</span>
            </div>
          )}

          {/* Date */}
          <div className="flex items-center text-xs text-muted-foreground">
            <Calendar className="w-3 h-3 mr-1.5" />
            Posted: {new Date(listing.created_at).toLocaleDateString()}
          </div>
        </div>
      </CardContent>

      {/* Action Buttons */}
      <CardFooter className="p-4 pt-0 flex gap-2">
        {/* WhatsApp Contact Button */}
        {listing.contact_phone && (
          <Button
            onClick={handleWhatsAppClick}
            variant="outline"
            size="sm"
            className="flex-1 bg-green-50 hover:bg-green-500 hover:text-white border-green-500 text-green-700 font-semibold transition-all duration-200"
          >
            <MessageCircle className="w-4 h-4 mr-1.5" />
            Contact
          </Button>
        )}
        
        {/* View Details Button */}
        <Button 
          asChild 
          size="sm"
          className={`${listing.contact_phone ? 'flex-1' : 'w-full'} font-semibold transition-all duration-200`}
          variant={isNeed ? 'default' : 'secondary'}
        >
          <Link href={`/listings/${listing.id}`}>
            Details
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
