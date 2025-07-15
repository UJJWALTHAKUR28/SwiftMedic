import React, { useEffect, useState, useRef } from 'react';
import { GoogleMap, Marker, DirectionsRenderer } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '100%',
};

export default function DriverLiveRouteMap({ pickup, destination }) {
  const [driverLocation, setDriverLocation] = useState(null);
  const [directions, setDirections] = useState(null);
  const watchIdRef = useRef(null);
  const [destinationLatLng, setDestinationLatLng] = useState(null);

  // Geocode destination address to lat/lng if needed
  useEffect(() => {
    if (!destination) return;
    if (typeof destination === 'object' && destination.lat && destination.lng) {
      setDestinationLatLng(destination);
      return;
    }
    // Geocode string address
    const geocode = async () => {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: destination }, (results, status) => {
        if (status === 'OK' && results[0]) {
          setDestinationLatLng({
            lat: results[0].geometry.location.lat(),
            lng: results[0].geometry.location.lng(),
          });
        }
      });
    };
    if (window.google && window.google.maps) {
      geocode();
    }
  }, [destination]);

  // Watch driver's location
  useEffect(() => {
    if (!navigator.geolocation) return;
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setDriverLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      (err) => {
        console.error('Geolocation error:', err);
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
    );
    return () => {
      if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, []);

  // Get directions from driver to destination
  useEffect(() => {
    if (!driverLocation || !destinationLatLng) return;
    const directionsService = new window.google.maps.DirectionsService();
    directionsService.route(
      {
        origin: driverLocation,
        destination: destinationLatLng,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === 'OK') {
          setDirections(result);
        } else {
          setDirections(null);
        }
      }
    );
  }, [driverLocation, destinationLatLng]);

  if (!driverLocation || !destinationLatLng) {
    return <div className="w-full h-full flex items-center justify-center">Loading map...</div>;
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={driverLocation}
      zoom={15}
    >
      <Marker position={driverLocation} label="You" />
      <Marker position={destinationLatLng} label="Dest" />
      {directions && <DirectionsRenderer directions={directions} />}
    </GoogleMap>
  );
} 