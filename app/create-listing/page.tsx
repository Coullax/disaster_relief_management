'use client'

import { createListing } from '@/lib/actions/create-listing'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { useState, useEffect } from 'react'
import { MapPin } from 'lucide-react'
import dynamic from 'next/dynamic'

// Dynamically import LocationPicker to avoid SSR issues with Leaflet
const LocationPicker = dynamic(() => import('@/components/ui/location-picker'), {
  ssr: false,
  loading: () => <div className="h-[300px] w-full bg-muted animate-pulse rounded-md flex items-center justify-center text-muted-foreground">Loading Map...</div>
})

export default function CreateListingPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedType, setSelectedType] = useState('need')
  const [autoLocation, setAutoLocation] = useState<string>('')
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)
  const [locationError, setLocationError] = useState<string>('')
  const [useAutoLocation, setUseAutoLocation] = useState(true)
  const [description, setDescription] = useState('')
  const [mapCoordinates, setMapCoordinates] = useState<{ lat: number; lng: number } | null>(null)
  const [city, setCity] = useState('')
  const [district, setDistrict] = useState('')
  const [title, setTitle] = useState('')

  const reverseGeocode = async (latitude: number, longitude: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'en'
          }
        }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch location name')
      }

      const data = await response.json()
      const address = data.address
      const locationParts = []
      let detectedCity = ''
      let detectedDistrict = ''

      if (address) {
        if (address.house_number) locationParts.push(address.house_number)
        if (address.road) locationParts.push(address.road)
        if (address.suburb || address.neighbourhood) locationParts.push(address.suburb || address.neighbourhood)
        if (address.city || address.town || address.village) {
          const cityVal = address.city || address.town || address.village
          locationParts.push(cityVal)
          detectedCity = cityVal
        }
        if (address.state_district) {
          locationParts.push(address.state_district)
          detectedDistrict = address.state_district.replace(/ District$/i, '').toLowerCase()
        }
        if (address.state) locationParts.push(address.state)
        if (address.postcode) locationParts.push(address.postcode)
      }

      const locationString = locationParts.length > 0
        ? locationParts.join(', ')
        : (data.display_name ? data.display_name.split(',').slice(0, 3).join(',') : `Lat: ${latitude.toFixed(6)}, Lon: ${longitude.toFixed(6)}`)

      return { locationString, city: detectedCity, district: detectedDistrict }
    } catch (error) {
      console.error('Geocoding error:', error)
      return {
        locationString: `Lat: ${latitude.toFixed(6)}, Lon: ${longitude.toFixed(6)}`,
        city: '',
        district: ''
      }
    }
  }

  const fetchLocation = () => {
    setIsLoadingLocation(true)
    setLocationError('')

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser')
      setIsLoadingLocation(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        setMapCoordinates({ lat: latitude, lng: longitude })
        const { locationString, city, district } = await reverseGeocode(latitude, longitude)
        setAutoLocation(locationString)
        if (city) setCity(city)
        if (district) setDistrict(district)
        setIsLoadingLocation(false)
        setUseAutoLocation(true)
      },
      (error) => {
        let errorMessage = 'Unable to retrieve your location.'
        if (error && error.code) {
          if (error.code === 1) errorMessage = 'Location permission denied.'
          else if (error.code === 2) errorMessage = 'Location information is unavailable.'
          else if (error.code === 3) errorMessage = 'The request to get user location timed out.'
        }
        setLocationError(`${errorMessage} Please enter manually or select on map.`)
        setIsLoadingLocation(false)
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 0 }
    )
  }

  const handleMapLocationSelect = async (pos: { lat: number; lng: number }) => {
    setMapCoordinates(pos)
    setIsLoadingLocation(true)
    const { locationString, city, district } = await reverseGeocode(pos.lat, pos.lng)
    setAutoLocation(locationString)
    if (city) setCity(city)
    if (district) setDistrict(district)
    setIsLoadingLocation(false)
    setUseAutoLocation(true)
  }

  useEffect(() => {
    fetchLocation()
  }, [])

  return (
    <div className="min-h-screen bg-white" style={{ backgroundColor: '#F4FFF8' }}>
      <div className="container mx-auto py-8 px-4 max-w-[640px]">
        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* Title */}
          <h1 className="text-xl font-semibold mb-6">Share Your Request</h1>

          {/* Type Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              type="button"
              onClick={() => setSelectedType('need')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedType === 'need'
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              I need Help
            </button>
            <button
              type="button"
              onClick={() => setSelectedType('offer')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedType === 'offer'
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              I want to Help
            </button>
          </div>

          {/* Form */}
          <form
            action={async (formData) => {
              setIsSubmitting(true)
              formData.set('type', selectedType)
              await createListing(formData)
              setIsSubmitting(false)
            }}
            className="space-y-5"
          >
            {/* Write your request in brief */}
            <div>
              <Label htmlFor="title" className="text-sm font-normal mb-1.5 block">
                Write your request in brief
              </Label>
              <Input
                id="title"
                name="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Need food for 5 families"
                required
                className="text-sm"
              />
            </div>

            {/* Category */}
            <div>
              <Label htmlFor="category" className="text-sm font-normal mb-1.5 block">
                Category
              </Label>
              <Select name="category" defaultValue="business" required>
                <SelectTrigger className="w-full text-sm">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="financial">Financial Assistance</SelectItem>
                  <SelectItem value="legal">Legal Aid</SelectItem>
                  <SelectItem value="shelter">Shelter</SelectItem>
                  <SelectItem value="veterinary">Veterinary Services</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Your Full Name */}
            <div>
              <Label htmlFor="full_name" className="text-sm font-normal mb-1.5 block">
                Your Full Name
              </Label>
              <Input
                id="full_name"
                name="full_name"
                placeholder="e.g., John Doe"
                required
                className="text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                This will be displayed as the poster of this listing
              </p>
            </div>

            {/* Add a detailed description */}
            <div>
              <Label htmlFor="description" className="text-sm font-normal mb-1.5 block">
                Add a detailed description
              </Label>
              <Textarea
                id="description"
                name="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the situation in detail..."
                className="min-h-[80px] text-sm resize-none"
                required
              />
              <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                <span className="inline-block w-4 h-[1px] bg-gray-300"></span>
                <span className="inline-block w-4 h-[1px] bg-gray-300"></span>
                <span className="inline-block w-4 h-[1px] bg-gray-300"></span>
              </p>
            </div>

            {/* Location Section */}
            <div>
              <Label className="text-sm font-normal mb-3 block">
                Location (City/District)
              </Label>

              <div className="mb-4">
                <LocationPicker
                  onLocationSelect={handleMapLocationSelect}
                  initialLocation={mapCoordinates || undefined}
                />
                <p className="text-xs text-blue-600 mt-2 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  Click on the map to select location
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  📍 Location 📍 Geolocation coordinates
                </p>
                <p className="text-xs text-gray-500">
                  Click on the map to pinpoint yours exact location
                </p>
              </div>

              {locationError && (
                <div className="mb-3 p-2 bg-orange-50 border border-orange-200 rounded text-xs text-orange-700">
                  {locationError}
                </div>
              )}

              {(!useAutoLocation || !autoLocation) && (
                <Input
                  id="location"
                  name="location"
                  placeholder="e.g., Colombo 03"
                  required
                  className="text-sm mb-3"
                />
              )}

              {useAutoLocation && autoLocation && (
                <>
                  <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-md text-sm">
                    <p className="font-medium text-green-800 mb-1">Location permission granted! Please enter manually or select on map.</p>
                    <p className="text-green-700">{autoLocation}</p>
                  </div>
                  <input
                    type="hidden"
                    id="location"
                    name="location"
                    value={autoLocation}
                  />
                </>
              )}

              {mapCoordinates && (
                <>
                  <input type="hidden" name="latitude" value={mapCoordinates.lat} />
                  <input type="hidden" name="longitude" value={mapCoordinates.lng} />
                </>
              )}
            </div>

            {/* District and City */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="district" className="text-sm font-normal mb-1.5 block">
                  District
                </Label>
                <Select name="district" value={district} onValueChange={setDistrict} required>
                  <SelectTrigger className="w-full text-sm">
                   <SelectValue placeholder="Select District" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    <div className="px-2 py-2 sticky top-0 bg-background border-b w-full z-50">
                      <Input
                        placeholder="Search district..."
                        className="h-9 text-sm"
                        onKeyDown={(e) => e.stopPropagation()}
                        onChange={(e) => {
                          const searchTerm = e.target.value.toLowerCase();
                          const items = document.querySelectorAll('[data-district-item]');
                          items.forEach((item) => {
                            const text = item.textContent?.toLowerCase() || '';
                            const element = item as HTMLElement;
                            element.style.display = text.includes(searchTerm) ? '' : 'none';
                          });
                        }}
                      />
                    </div>
                    <SelectItem value="ampara" data-district-item>Ampara District</SelectItem>
                    <SelectItem value="anuradhapura" data-district-item>Anuradhapura District</SelectItem>
                    <SelectItem value="badulla" data-district-item>Badulla District</SelectItem>
                    <SelectItem value="batticaloa" data-district-item>Batticaloa District</SelectItem>
                    <SelectItem value="colombo" data-district-item>Colombo District</SelectItem>
                    <SelectItem value="galle" data-district-item>Galle District</SelectItem>
                    <SelectItem value="gampaha" data-district-item>Gampaha District</SelectItem>
                    <SelectItem value="hambantota" data-district-item>Hambantota District</SelectItem>
                    <SelectItem value="jaffna" data-district-item>Jaffna District</SelectItem>
                    <SelectItem value="kalutara" data-district-item>Kalutara District</SelectItem>
                    <SelectItem value="kandy" data-district-item>Kandy District</SelectItem>
                    <SelectItem value="kegalle" data-district-item>Kegalle District</SelectItem>
                    <SelectItem value="kilinochchi" data-district-item>Kilinochchi District</SelectItem>
                    <SelectItem value="kurunegala" data-district-item>Kurunegala District</SelectItem>
                    <SelectItem value="mannar" data-district-item>Mannar District</SelectItem>
                    <SelectItem value="matale" data-district-item>Matale District</SelectItem>
                    <SelectItem value="matara" data-district-item>Matara District</SelectItem>
                    <SelectItem value="monaragala" data-district-item>Monaragala District</SelectItem>
                    <SelectItem value="mullaitivu" data-district-item>Mullaitivu District</SelectItem>
                    <SelectItem value="nuwaraeliya" data-district-item>Nuwara Eliya District</SelectItem>
                    <SelectItem value="polonnaruwa" data-district-item>Polonnaruwa District</SelectItem>
                    <SelectItem value="puttalam" data-district-item>Puttalam District</SelectItem>
                    <SelectItem value="ratnapura" data-district-item>Ratnapura District</SelectItem>
                    <SelectItem value="trincomalee" data-district-item>Trincomalee District</SelectItem>
                    <SelectItem value="vavuniya" data-district-item>Vavuniya District</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="city" className="text-sm font-normal mb-1.5 block">
                  City
                </Label>
                <Input
                  id="city"
                  name="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g., Colombo, Kandy, Galle"
                  className="text-sm"
                />
              </div>
            </div>

            {/* Google map Link */}
            <div>
              <Label htmlFor="google_map_link" className="text-sm font-normal mb-1.5 block">
                Google map Link
              </Label>
              <Input
                id="google_map_link"
                name="google_map_link"
                type="url"
                placeholder="https://maps.google.com/..."
                className="text-sm"
              />
            </div>

            {/* Contact Fields */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="contact_email" className="text-sm font-normal mb-1.5 block">
                  Contact Email
                </Label>
                <Input
                  id="contact_email"
                  name="contact_email"
                  type="email"
                  placeholder="you@example.com"
                  className="text-sm"
                />
              </div>

              <div>
                <Label htmlFor="contact_phone" className="text-sm font-normal mb-1.5 block">
                  Contact Phone
                </Label>
                <Input
                  id="contact_phone"
                  name="contact_phone"
                  type="tel"
                  placeholder="e.g., +94123456789"
                  className="text-sm"
                />
              </div>
            </div>

            {/* WhatsApp Contact Number */}
            <div>
              <Label htmlFor="whatsapp_contact" className="text-sm font-normal mb-1.5 block">
                whatsapp Contact Number
              </Label>
              <Input
                id="whatsapp_contact"
                name="whatsapp_contact"
                type="tel"
                placeholder="e.g., +94123456789"
                className="text-sm"
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-6 text-base rounded-md"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Share Your Request'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
