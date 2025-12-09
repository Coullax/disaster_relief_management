'use client'

import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import MediaGallery from './media-gallery'
import {
  MapPin,
  Calendar,
  Mail,
  Phone,
  ArrowLeft,
  FileText,
  User,
  Share2,
  Package
} from 'lucide-react'

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

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: listing.title,
          text: `Check out this listing: ${listing.title}`,
          url: window.location.href,
        })
      } else {
        await navigator.clipboard.writeText(window.location.href)
        toast.success('Link copied to clipboard!')
      }
    } catch (error) {
      console.error('Error sharing:', error)
    }
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="container mx-auto py-6 px-4 max-w-3xl">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-900 -ml-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="flex gap-2">
            <Badge
              className={`font-semibold px-4 py-1.5 rounded-full ${isNeed
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-green-500 hover:bg-green-600'
                }`}
            >
              {isNeed ? 'Need Help' : 'Offering Help'}
            </Badge>
            <Badge variant="outline" className="capitalize px-4 py-1.5 rounded-full border-gray-300 gap-1.5">
              <Package className="w-3.5 h-3.5" />
              {listing.category}
            </Badge>
          </div>
        </div>

        {/* Title Section */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
            {listing.title}
          </h1>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 text-gray-500 text-sm">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-orange-500" />
              <div>
                <p className="text-xs text-gray-400">Location</p>
                <p className="font-medium text-gray-700">{listing.location}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-orange-500" />
              <div>
                <p className="text-xs text-gray-400">Posted on</p>
                <p className="font-medium text-gray-700">
                  {new Date(listing.created_at).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="ml-auto rounded-full gap-2 hidden sm:flex" onClick={handleShare}>
              <Share2 className="w-3 h-3" />
              Share
            </Button>
          </div>
        </div>

        <Separator className="mb-10" />

        <div className="space-y-12">
          {/* Description Section */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-lg bg-orange-100 p-2.5">
                <FileText className="h-5 w-5 text-orange-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Description</h2>
            </div>
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {listing.description}
              </p>
            </div>
          </section>

          {/* Media Gallery */}
          {listing.media_urls && listing.media_urls.length > 0 && (
            <MediaGallery mediaUrls={listing.media_urls} />
          )}

          {/* Contact Section */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-lg bg-orange-100 p-2.5">
                <Phone className="h-5 w-5 text-orange-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Contact Seller</h2>
            </div>

            <div className="grid gap-4">
              {listing.contact_phone && (
                <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center">
                      <Phone className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-0.5">Phone</p>
                      <p className="font-semibold text-gray-900">{listing.contact_phone}</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => window.location.href = `tel:${listing.contact_phone}`}
                    variant="ghost"
                    className="font-medium text-gray-600 hover:text-orange-600 hover:bg-orange-50"
                  >
                    Call
                  </Button>
                </div>
              )}

              {listing.contact_email && (
                <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                      <Mail className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-0.5">Email</p>
                      <p className="font-semibold text-gray-900">{listing.contact_email}</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => window.location.href = `mailto:${listing.contact_email}`}
                    variant="ghost"
                    className="font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                  >
                    Message
                  </Button>
                </div>
              )}

              {listing.contact_phone && (
                <Button className="w-full bg-[#1e1b4b] hover:bg-[#1e1b4b]/90 text-white h-12 rounded-xl mt-2 font-semibold" onClick={handleWhatsAppClick}>
                  Contact via WhatsApp
                </Button>
              )}
            </div>
          </section>

          <Separator />

          {/* Posted By Section */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-lg bg-gray-100 p-2.5">
                <User className="h-5 w-5 text-gray-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Posted By</h2>
            </div>

            <Card className="shadow-sm border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-lg select-none">
                    {listing.profiles?.full_name ? listing.profiles.full_name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div>
                    <p className="font-bold text-lg text-gray-900">
                      {listing.profiles?.full_name || 'Anonymous User'}
                    </p>
                    <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                      Member since {new Date(listing.created_at).getFullYear()}
                    </p>
                  </div>
                  <Button variant="ghost" className="ml-auto text-sm font-medium">
                    View Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </div>
  )
}
