import { useEffect, useRef, useState } from 'react';

const SimpleMap = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get user location first
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setLocation(userPos);
          initMap(userPos);
        },
        () => {
          // Use default location if geolocation fails
          const defaultPos = { lat: 40.7128, lng: -74.0060 };
          setLocation(defaultPos);
          initMap(defaultPos);
        }
      );
    }
  }, []);

  const initMap = (center: { lat: number; lng: number }) => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyAzjs-zFMmK8AFRXJsoBwef8ZL3UMRnChI`;
    script.onload = () => {
      if (mapRef.current && window.google) {
        const map = new window.google.maps.Map(mapRef.current, {
          center,
          zoom: 15,
        });

        new window.google.maps.Marker({
          position: center,
          map,
          title: 'Your Location',
        });

        setLoading(false);

        // Watch for location changes
        if (navigator.geolocation) {
          navigator.geolocation.watchPosition((position) => {
            const newPos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            setLocation(newPos);
            map.setCenter(newPos);
          });
        }
      }
    };
    document.head.appendChild(script);
  };

  return (
    <div className="w-full h-full relative">
      {loading && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p>Loading map...</p>
          </div>
        </div>
      )}
      <div ref={mapRef} className="w-full h-full rounded-lg" />
      {location && (
        <div className="absolute top-4 left-4 bg-white p-2 rounded shadow-lg text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            Live Location
          </div>
          <div className="text-xs text-gray-600 mt-1">
            {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleMap;