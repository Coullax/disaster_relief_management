import Link from 'next/link'
import { Listing } from '@/lib/actions/listings'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MapPin, Calendar, ArrowRight } from 'lucide-react'

interface ListingCardProps {
  listing: Listing
}

export function ListingCard({ listing }: ListingCardProps) {
  return (
    <Card className="overflow-hidden flex flex-col h-full hover:shadow-lg transition-shadow duration-300">
      <div className="relative h-48 w-full bg-muted">
        {listing.media_urls && listing.media_urls.length > 0 ? (
          <img
            src={listing.media_urls[0]}
            alt={listing.title}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-muted-foreground bg-secondary">
            No Image
          </div>
        )}
        <Badge
          className="absolute top-2 right-2 capitalize"
          variant={listing.type === 'need' ? 'destructive' : 'default'}
        >
          {listing.type}
        </Badge>
      </div>
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start">
          <Badge variant="outline" className="mb-2 capitalize">
            {listing.category}
          </Badge>
          <span className="text-xs text-muted-foreground flex items-center">
            <Calendar className="w-3 h-3 mr-1" />
            {new Date(listing.created_at).toLocaleDateString()}
          </span>
        </div>
        <h3 className="font-bold text-lg line-clamp-1">{listing.title}</h3>
      </CardHeader>
      <CardContent className="p-4 pt-0 flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
          {listing.description}
        </p>
        <div className="flex items-center text-sm text-muted-foreground">
          <MapPin className="w-4 h-4 mr-1 text-primary" />
          <span className="line-clamp-1">{listing.location}</span>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button asChild className="w-full">
          <Link href={`/listings/${listing.id}`}>
            {listing.type === 'need' ? 'Help Now' : 'View Offer'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
