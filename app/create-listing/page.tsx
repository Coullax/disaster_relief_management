'use client'

import { createListing } from '@/lib/actions/create-listing'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useState, useEffect } from 'react'
import { MapPin, RefreshCw, X } from 'lucide-react'

export default function CreateListingPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [autoLocation, setAutoLocation] = useState<string>('')
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)
  const [locationError, setLocationError] = useState<string>('')
  const [useAutoLocation, setUseAutoLocation] = useState(true)

  const fetchLocation = () => {
    setIsLoadingLocation(true)
    setLocationError('')
    
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser')
      setIsLoadingLocation(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        const locationString = `Lat: ${latitude.toFixed(6)}, Lon: ${longitude.toFixed(6)}`
        setAutoLocation(locationString)
        setIsLoadingLocation(false)
        setUseAutoLocation(true)
      },
      (error) => {
        setLocationError('Unable to retrieve your location. Please enter manually.')
        setIsLoadingLocation(false)
        console.error('Geolocation error:', error)
      }
    )
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchLocation()
  }, [])

  const handleCancelAutoLocation = () => {
    setAutoLocation('')
    setUseAutoLocation(false)
    setLocationError('')
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Create New Listing</CardTitle>
        </CardHeader>
        <CardContent>
          <form 
            action={async (formData) => {
              setIsSubmitting(true)
              await createListing(formData)
              setIsSubmitting(false)
            }} 
            className="space-y-6"
          >
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" placeholder="e.g., Need food for 5 families" required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select name="type" defaultValue="need" required>
                  <SelectTrigger>
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
                <Select name="category" defaultValue="food" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="food">Food & Water</SelectItem>
                    <SelectItem value="medical">Medical</SelectItem>
                    <SelectItem value="shelter">Shelter</SelectItem>
                    <SelectItem value="transport">Transport</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                name="description" 
                placeholder="Describe the situation in detail..." 
                className="min-h-[100px]"
                required 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location (City/District)</Label>
              
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
                      className="h-7 px-2"
                      title="Update location"
                    >
                      <RefreshCw className={`h-3 w-3 ${isLoadingLocation ? 'animate-spin' : ''}`} />
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={handleCancelAutoLocation}
                      className="h-7 px-2"
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact_email">Contact Email</Label>
                <Input id="contact_email" name="contact_email" type="email" placeholder="Optional" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_phone">Contact Phone</Label>
                <Input id="contact_phone" name="contact_phone" type="tel" placeholder="Optional" />
              </div>
            </div>



            <div className="space-y-2">
              <Label htmlFor="media">Photos (Optional)</Label>
              <Input id="media" name="media" type="file" multiple accept="image/*" />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Listing'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
