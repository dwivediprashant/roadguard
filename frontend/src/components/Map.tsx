import { useEffect, useRef, useState } from 'react';
import { GOOGLE_MAPS_API_KEY } from '../lib/config';

interface MapProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  height?: string;
  showUserLocation?: boolean;
  liveTracking?: boolean;
  onLocationUpdate?: (location: { lat: number; lng: number }) => void;
}

const Map = ({ 
  center = { lat: 40.7128, lng: -74.0060 }, 
  zoom = 13, 
  height = '400px',
  showUserLocation = true,
  liveTracking = false,
  onLocationUpdate
}: MapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [userMarker, setUserMarker] = useState<google.maps.Marker | null>(null);
  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    const initMap = () => {
      if (!mapRef.current) return;

      const mapInstance = new google.maps.Map(mapRef.current, {
        center,
        zoom,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      });

      setMap(mapInstance);

      if (showUserLocation) {
        getCurrentLocation(mapInstance);
      }
    };

    if (window.google) {
      initMap();
    } else {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.onload = initMap;
      script.onerror = () => console.error('Failed to load Google Maps API');
      document.head.appendChild(script);
    }
  }, [center, zoom, showUserLocation]);

  const updateUserLocation = (position: GeolocationPosition, mapInstance: google.maps.Map) => {
    const pos = {
      lat: position.coords.latitude,
      lng: position.coords.longitude
    };
    
    setUserLocation(pos);
    onLocationUpdate?.(pos);
    
    if (userMarker) {
      userMarker.setPosition(pos);
    } else {
      const marker = new google.maps.Marker({
        position: pos,
        map: mapInstance,
        title: 'Your Location',
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="8" fill="#3B82F6" stroke="#FFFFFF" stroke-width="2"/>
              <circle cx="12" cy="12" r="3" fill="#FFFFFF"/>
            </svg>
          `),
          scaledSize: new google.maps.Size(24, 24)
        }
      });
      setUserMarker(marker);
    }
    
    if (!liveTracking) {
      mapInstance.setCenter(pos);
    }
  };

  const getCurrentLocation = (mapInstance: google.maps.Map) => {
    if (navigator.geolocation) {
      if (liveTracking) {
        watchIdRef.current = navigator.geolocation.watchPosition(
          (position) => updateUserLocation(position, mapInstance),
          (error) => console.log('Error: The Geolocation service failed.', error),
          { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
      } else {
        navigator.geolocation.getCurrentPosition(
          (position) => updateUserLocation(position, mapInstance),
          (error) => console.log('Error: The Geolocation service failed.', error)
        );
      }
    }
  };

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return (
    <div className="relative">
      <div ref={mapRef} style={{ height, width: '100%' }} className="rounded-lg" />
      {liveTracking && userLocation && (
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="font-medium">Live Location</span>
          </div>
          <div className="text-xs text-gray-600 mt-1">
            {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}
          </div>
        </div>
      )}
    </div>
  );
};

export default Map;