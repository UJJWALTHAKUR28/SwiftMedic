"use client"
import React, { useState, useEffect } from 'react'
import { LoadScript, GoogleMap } from '@react-google-maps/api'
import { useRouter } from 'next/navigation'

const containerStyle = {
  width: '100%',
  height: '400px'
}

const LiveTracking = () => {
  const [location, setLocation] = useState({ lat: 0, lng: 0 })
  const [map, setMap] = useState(null)
  const [marker, setMarker] = useState(null)
  const router = useRouter()

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => {
          console.error('Error getting location:', error)
        }
      )
    }
  }, [])

  // Create marker after map is loaded
  useEffect(() => {
    if (map && window.google && location.lat !== 0) {
      // Clean up any existing marker
      if (marker) {
        marker.setMap(null)
      }

      try {
        // Use AdvancedMarkerElement if available, otherwise fallback to Marker
        if (window.google.maps.marker && window.google.maps.marker.AdvancedMarkerElement) {
          const advancedMarker = new window.google.maps.marker.AdvancedMarkerElement({
            map,
            position: location,
            title: 'Your Location'
          })
          setMarker(advancedMarker)
        } else {
          // Fallback to regular Marker
          const basicMarker = new window.google.maps.Marker({
            map,
            position: location,
            title: 'Your Location'
          })
          setMarker(basicMarker)
        }
      } catch (error) {
        console.error('Error creating marker:', error)
      }
    }
  }, [map, location])

  const onMapLoad = (mapInstance) => {
    setMap(mapInstance)
  }

  return (
    <div>
      <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={location}
          zoom={15}
          onLoad={onMapLoad}
        >
          {/* Markers are now handled programmatically in the useEffect */}
        </GoogleMap>
      </LoadScript>
    </div>
  )
}

export default LiveTracking