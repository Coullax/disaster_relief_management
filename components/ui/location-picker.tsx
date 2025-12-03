'use client'

import { useState, useEffect, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Button } from './button'
import { MapPin, Navigation } from 'lucide-react'

// Fix for default marker icon
const icon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
})

interface LocationPickerProps {
    onLocationSelect: (location: { lat: number; lng: number }) => void
    initialLocation?: { lat: number; lng: number }
}

function LocationMarker({
    position,
    setPosition
}: {
    position: { lat: number; lng: number } | null
    setPosition: (pos: { lat: number; lng: number }) => void
}) {
    const map = useMapEvents({
        click(e) {
            setPosition(e.latlng)
            map.flyTo(e.latlng, map.getZoom())
        },
    })

    useEffect(() => {
        if (position) {
            map.flyTo(position, map.getZoom())
        }
    }, [position, map])

    return position === null ? null : (
        <Marker position={position} icon={icon} />
    )
}

function FlyToUserLocation({ onLocationFound }: { onLocationFound: (pos: { lat: number; lng: number }) => void }) {
    const map = useMap()

    const handleLocate = (e: React.MouseEvent) => {
        e.preventDefault() // Prevent form submission if inside a form
        map.locate().on('locationfound', function (e) {
            onLocationFound(e.latlng)
            map.flyTo(e.latlng, map.getZoom())
        })
    }

    return (
        <Button
            variant="secondary"
            size="sm"
            className="absolute top-4 right-4 z-[1000] shadow-md bg-white hover:bg-gray-100 text-black"
            onClick={handleLocate}
            type="button"
        >
            <Navigation className="h-4 w-4 mr-2" />
            Locate Me
        </Button>
    )
}

export default function LocationPicker({ onLocationSelect, initialLocation }: LocationPickerProps) {
    // Default to Sri Lanka center if no initial location
    const defaultCenter = { lat: 7.8731, lng: 80.7718 }
    const [position, setPosition] = useState<{ lat: number; lng: number } | null>(initialLocation || null)

    const handleSetPosition = (pos: { lat: number; lng: number }) => {
        setPosition(pos)
        onLocationSelect(pos)
    }

    return (
        <div className="relative h-[300px] w-full rounded-md overflow-hidden border">
            <MapContainer
                center={initialLocation || defaultCenter}
                zoom={initialLocation ? 13 : 7}
                scrollWheelZoom={false}
                className="h-full w-full"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker position={position} setPosition={handleSetPosition} />
                <FlyToUserLocation onLocationFound={handleSetPosition} />
            </MapContainer>

            {!position && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-[1000] bg-white/90 px-4 py-2 rounded-full shadow-md text-sm font-medium text-gray-700 pointer-events-none">
                    Click on the map to select location
                </div>
            )}
        </div>
    )
}
