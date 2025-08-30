import { useState, useEffect } from 'react';
import { MapPin, Navigation } from 'lucide-react';

const SimpleMap = () => {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLoading(false);
        },
        () => {
          setLocation({ lat: 40.7128, lng: -74.0060 });
          setLoading(false);
        }
      );
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <div className="w-full h-full bg-muted rounded-lg flex items-center justify-center relative">
      {loading ? (
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Getting location...</p>
        </div>
      ) : (
        <div className="text-center">
          <MapPin className="h-12 w-12 mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground mb-2">Interactive Map</p>
          <p className="text-sm text-muted-foreground">Map functionality will be available here</p>
          {location && (
            <div className="mt-4 p-3 bg-background rounded border">
              <div className="flex items-center gap-2 justify-center">
                <Navigation className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Current Location</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SimpleMap;