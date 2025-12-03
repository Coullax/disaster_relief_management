'use client'

import { createListing } from '@/lib/actions/create-listing'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useState, useEffect } from 'react'
import { MapPin, RefreshCw, X, List } from 'lucide-react'
import dynamic from 'next/dynamic'

// Dynamically import LocationPicker to avoid SSR issues with Leaflet
const LocationPicker = dynamic(() => import('@/components/ui/location-picker'), {
  ssr: false,
  loading: () => <div className="h-[300px] w-full bg-muted animate-pulse rounded-md flex items-center justify-center text-muted-foreground">Loading Map...</div>
})

export default function CreateListingPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [autoLocation, setAutoLocation] = useState<string>('')
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)
  const [locationError, setLocationError] = useState<string>('')
  const [useAutoLocation, setUseAutoLocation] = useState(true)
  const [description, setDescription] = useState('')
  const [mapCoordinates, setMapCoordinates] = useState<{ lat: number; lng: number } | null>(null)

  // We don't need textareaRef here as we access it by ID in handleBulletPoints
  // const textareaRef = useState<HTMLTextAreaElement | null>(null)[0]

  const handleBulletPoints = () => {
    const textarea = document.getElementById('description') as HTMLTextAreaElement
    if (!textarea) return

    const cursorPos = textarea.selectionStart
    const textBeforeCursor = description.substring(0, cursorPos)
    const textAfterCursor = description.substring(cursorPos)

    // Find the start of the current line
    const lastNewlineBeforeCursor = textBeforeCursor.lastIndexOf('\n')
    const currentLineStart = lastNewlineBeforeCursor + 1
    const currentLine = textBeforeCursor.substring(currentLineStart)

    // Check if current line already has a bullet
    const trimmedLine = currentLine.trim()
    if (trimmedLine.startsWith('•')) {
      // If already a bullet, just add a new line with bullet
      const newText = description.substring(0, cursorPos) + '\n• ' + textAfterCursor
      setDescription(newText)

      // Move cursor after the new bullet
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = cursorPos + 3
        textarea.focus()
      }, 0)
    } else if (trimmedLine.length > 0) {
      // Convert current line to bullet point
      const textBeforeLine = textBeforeCursor.substring(0, currentLineStart)
      const newText = textBeforeLine + '• ' + trimmedLine + '\n• ' + textAfterCursor
      setDescription(newText)

      // Move cursor to the new line after the bullet
      const newCursorPos = textBeforeLine.length + trimmedLine.length + 5
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = newCursorPos
        textarea.focus()
      }, 0)
    } else {
      // Empty line, just add bullet
      const newText = description.substring(0, cursorPos) + '• ' + textAfterCursor
      setDescription(newText)

      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = cursorPos + 2
        textarea.focus()
      }, 0)
    }
  }

  const reverseGeocode = async (latitude: number, longitude: number) => {
    try {
      // Reverse geocoding using Nominatim API
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

      // Extract location information
      const address = data.address
      console.log("address:", address)
      const locationParts = []

      // Include all available address components
      if (address.house_number) {
        locationParts.push(address.house_number)
      }
      if (address.road) {
        locationParts.push(address.road)
      }
      if (address.suburb || address.neighbourhood) {
        locationParts.push(address.suburb || address.neighbourhood)
      }
      if (address.city || address.town || address.village) {
        locationParts.push(address.city || address.town || address.village)
      }
      if (address.state_district) {
        locationParts.push(address.state_district)
      }
      if (address.state) {
        locationParts.push(address.state)
      }
      if (address.postcode) {
        locationParts.push(address.postcode)
      }

      const locationString = locationParts.length > 0
        ? locationParts.join(', ')
        : data.display_name.split(',').slice(0, 3).join(',')

      return locationString
    } catch (error) {
      console.error('Geocoding error:', error)
      return `Lat: ${latitude.toFixed(6)}, Lon: ${longitude.toFixed(6)}`
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

        // Update map coordinates
        setMapCoordinates({ lat: latitude, lng: longitude })

        const locationString = await reverseGeocode(latitude, longitude)

        setAutoLocation(locationString)
        setIsLoadingLocation(false)
        setUseAutoLocation(true)
      },
      (error) => {
        let errorMessage = 'Unable to retrieve your location.'
        // Check if error code exists
        if (error && error.code) {
          if (error.code === 1) { // PERMISSION_DENIED
            errorMessage = 'Location permission denied.'
          } else if (error.code === 2) { // POSITION_UNAVAILABLE
            errorMessage = 'Location information is unavailable.'
          } else if (error.code === 3) { // TIMEOUT
            errorMessage = 'The request to get user location timed out.'
          }
        }

        setLocationError(`${errorMessage} Please enter manually or select on map.`)
        setIsLoadingLocation(false)

        // Only log as error if it's not a permission denial
        if (error?.code !== 1) {
          console.warn('Geolocation issue:', error.message || 'Unknown error', error)
        }
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 0 }
    )
  }

  const handleMapLocationSelect = async (pos: { lat: number; lng: number }) => {
    setMapCoordinates(pos)
    setIsLoadingLocation(true)
    const locationString = await reverseGeocode(pos.lat, pos.lng)
    setAutoLocation(locationString)
    setIsLoadingLocation(false)
    setUseAutoLocation(true)
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchLocation()
  }, [])

  const handleCancelAutoLocation = () => {
    setAutoLocation('')
    setUseAutoLocation(false)
    setLocationError('')
    setMapCoordinates(null)
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-center font-bold">Create a New Ticket</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            action={async (formData) => {
              setIsSubmitting(true)
              // If we have map coordinates, append them to the form data or ensure they are part of the location string
              // For now, we rely on the location string in the input
              await createListing(formData)
              setIsSubmitting(false)
            }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" placeholder="e.g., Need food for 5 families" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="full_name">Your Full Name</Label>
              <Input
                id="full_name"
                name="full_name"
                placeholder="e.g., John Doe"
                required
                className="font-medium"
              />
              <p className="text-xs text-muted-foreground">
                This will be displayed as the poster of this listing
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select name="type" defaultValue="need" required>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="need">Request Help</SelectItem>
                    <SelectItem value="offer">Offer Help</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select name="category" defaultValue="business" required>
                  <SelectTrigger className="w-full">
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

            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <div className="relative">
                <Textarea
                  id="description"
                  name="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the situation in detail..."
                  className="min-h-[100px] pr-12"
                  required
                />
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={handleBulletPoints}
                  className="absolute right-2 top-2 h-8 px-2"
                  title="Convert to bullet points"
                  disabled={!description.trim()}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>

            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location (City/District)</Label>

              <div className="mb-4">
                <LocationPicker
                  onLocationSelect={handleMapLocationSelect}
                  initialLocation={mapCoordinates || undefined}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Click on the map to pinpoint your exact location.
                </p>
              </div>

              {useAutoLocation && autoLocation && (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md mb-2">
                  <MapPin className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-700 flex-1">
                    <span className="font-bold">Location Found: </span>
                    {autoLocation}
                  </span>
                  <div className="flex gap-1">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={fetchLocation}
                      disabled={isLoadingLocation}
                      className="h-7 px-2 cursor-pointer"
                      title="Update location"
                    >
                      <RefreshCw className={`h-3 w-3 ${isLoadingLocation ? 'animate-spin' : ''}`} />
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={handleCancelAutoLocation}
                      className="h-7 px-2 cursor-pointer"
                      title="Enter location manually"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}

              {isLoadingLocation && !autoLocation && (
                <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-md mb-2">
                  <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
                  <span className="text-sm text-blue-700">Fetching your location...</span>
                </div>
              )}

              {locationError && (
                <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md mb-2">
                  <span className="text-sm text-yellow-700">{locationError}</span>
                </div>
              )}

              {(!useAutoLocation || !autoLocation) && (
                <Input
                  id="location"
                  name="location"
                  placeholder="e.g., Colombo 03"
                  required
                />
              )}

              {/* Hidden input to submit auto-detected location */}
              {useAutoLocation && autoLocation && (
                <input
                  type="hidden"
                  id="location"
                  name="location"
                  value={autoLocation}
                />
              )}

              {/* Hidden inputs for coordinates if backend supports it later */}
              {mapCoordinates && (
                <>
                  <input type="hidden" name="latitude" value={mapCoordinates.lat} />
                  <input type="hidden" name="longitude" value={mapCoordinates.lng} />
                </>
              )}
            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">District</Label>
                <Select name="type" defaultValue="colombo" required>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select district" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    <div className="px-2 py-2 sticky top-0 bg-background border-b w-full z-50">
                      <Input
                        placeholder="Search district..."
                        className="h-9"
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
                    <SelectItem value="kurunegala" data-district-item>Kurunegala District</SelectItem>
                    <SelectItem value="kandy" data-district-item>Kandy District</SelectItem>
                    <SelectItem value="kegalle" data-district-item>Kegalle District</SelectItem>
                    <SelectItem value="kilinochchi" data-district-item>Kilinochchi District</SelectItem>
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

              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" name="city" placeholder="e.g., Colombo, Kandy, Galle" />
              </div>

              {/* <div className="space-y-2">
                <Label htmlFor="priority">Priority Level</Label>
                <Select name="priority" defaultValue="low" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>

                  </SelectContent>
                </Select>
              </div> */}
            </div>

            <div className="space-y-2">
              <Label htmlFor="google_map_link">Google map Link</Label>
              <Input id="google_map_link" name="google_map_link" type="url" placeholder="https://maps.google.com/..." />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact_email">Contact Email</Label>
                <Input id="contact_email" name="contact_email" type="email" placeholder="sample@gmail.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_phone">Contact Phone</Label>
                <Input id="contact_phone" name="contact_phone" type="tel" placeholder="e.g., +94123456789" />
              </div>
            </div>


            <div className="space-y-2">
              <Label htmlFor="contact_phone">whatsapp Contact Number</Label>
              <Input id="whatsapp_contact" name="whatsapp_contact" type="tel" placeholder="e.g., +94123456789" />
            </div>



            {/* <div className="space-y-2">
              <Label htmlFor="media">Photos (Optional)</Label>
              <Input id="media" name="media" type="file" multiple accept="image/*" />
            </div> */}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create a Ticket'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
