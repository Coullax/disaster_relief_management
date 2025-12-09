'use client'

import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  MapPin,
  Calendar,
  Mail,
  Phone,
  User,
  ArrowLeft,
  MessageCircle,
  Package,
  Eye,
  Clock,
  ImageIcon,
  Play
} from 'lucide-react'
import Image from 'next/image'

interface ListingDetailClientProps {
  listing: any
}

export function ListingDetailClient({ listing }: ListingDetailClientProps) {
  const router = useRouter()
  const isNeed = listing.type === 'need'

  const formatPhoneForWhatsApp = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '')
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto py-6 px-4 max-w-4xl">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4 -ml-2"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Listings
        </Button>

        {/* Main Card */}
        <Card className={`border-l-4 shadow-lg ${isNeed ? 'border-l-red-500' : 'border-l-green-500'
          }`}>
          <CardHeader className="pb-4">
            {/* Type and Category Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Badge
                className={`font-semibold ${isNeed
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-green-500 hover:bg-green-600'
                  }`}
              >
                {isNeed ? '🆘 NEED HELP' : '🤝 OFFERING HELP'}
              </Badge>
              <Badge variant="outline" className="capitalize">
                <Package className="w-3 h-3 mr-1" />
                {listing.category}
              </Badge>
              <Badge variant="secondary">
                <Eye className="w-3 h-3 mr-1" />
                {listing.view_count || 0} views
              </Badge>
            </div>

            {/* Title */}
            <CardTitle className="text-2xl md:text-3xl font-bold leading-tight">
              {listing.title}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Quick Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-sm bg-muted/50 rounded-lg p-3">
                <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="font-medium">{listing.location}</span>
              </div>
              <div className="flex items-center gap-2 text-sm bg-muted/50 rounded-lg p-3">
                <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="font-medium">
                  {new Date(listing.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
            </div>

            <Separator />

            {/* Description Section */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                📋 Description
              </h3>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {listing.description}
              </p>
            </div>

            <Separator />

            {/* Media Gallery */}
            {listing.media_urls && listing.media_urls.length > 0 && (
              <>
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <ImageIcon className="w-5 h-5" />
                    Media Gallery
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {listing.media_urls.map((url: string, index: number) => {
                      // Simple check for video extensions
                      const isVideo = url.match(/\.(mp4|webm|ogg|mov)$/i)

                      return (
                        <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-muted group border">
                          {isVideo ? (
                            <video
                              src={url}
                              controls
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="relative w-full h-full">
                              <Image
                                src={url}
                                alt={`Listing media ${index + 1}`}
                                fill
                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                                sizes="(max-width: 768px) 50vw, 33vw"
                              />
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
                <Separator />
              </>
            )}

            <Separator />

            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                📞 Contact Information
              </h3>
              <div className="space-y-3">
                {listing.contact_phone && (
                  <div className="flex items-center gap-3 bg-green-50 dark:bg-green-950/20 rounded-lg p-3 border border-green-200 dark:border-green-800">
                    <Phone className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground mb-1">Phone</p>
                      <a
                        href={`tel:${listing.contact_phone}`}
                        className="font-semibold text-green-700 dark:text-green-400 hover:underline break-all"
                      >
                        {listing.contact_phone}
                      </a>
                    </div>
                  </div>
                )}

                {listing.contact_email && (
                  <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                    <Mail className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground mb-1">Email</p>
                      <a
                        href={`mailto:${listing.contact_email}`}
                        className="font-semibold text-blue-700 dark:text-blue-400 hover:underline break-all"
                      >
                        {listing.contact_email}
                      </a>
                    </div>
                  </div>
                )}

                {!listing.contact_email && !listing.contact_phone && (
                  <p className="text-sm text-muted-foreground text-center py-4 bg-muted/50 rounded-lg">
                    No direct contact information provided
                  </p>
                )}
              </div>
            </div>

            <Separator />

            {/* Posted By Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                👤 Posted By
              </h3>
              <div className="flex items-center gap-4 bg-muted/50 rounded-lg p-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-base">
                    {listing.profiles?.full_name || 'Anonymous User'}
                  </p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Member since {new Date(listing.created_at).getFullYear()}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row gap-3">
              {listing.contact_phone && (
                <Button
                  onClick={handleWhatsAppClick}
                  size="lg"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Contact via WhatsApp
                </Button>
              )}

              {listing.contact_email && (
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="flex-1 font-semibold"
                >
                  <a href={`mailto:${listing.contact_email}`}>
                    <Mail className="w-5 h-5 mr-2" />
                    Send Email
                  </a>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Additional Info Card */}
        <Card className="mt-4">
          <CardContent className="p-4">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Eye className="w-4 h-4" />
              <span>
                This listing has been viewed <strong>{listing.view_count || 0}</strong> times
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
