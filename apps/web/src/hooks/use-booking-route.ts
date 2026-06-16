'use client';

import { useMapsLibrary } from '@vis.gl/react-google-maps';
import { useEffect, useState } from 'react';

export interface BookingRoute {
  distanceMetres: number;
  durationSeconds: number;
}

interface UseBookingRouteResult {
  route: BookingRoute | null;
  loading: boolean;
  error: boolean;
}

export function useBookingRoute(
  pickup: { lat: number; lng: number } | null,
  dropoff: { lat: number; lng: number } | null,
): UseBookingRouteResult {
  const routesLibrary = useMapsLibrary('routes');
  const [route, setRoute] = useState<BookingRoute | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!routesLibrary || !pickup || !dropoff) {
      setRoute(null);
      setLoading(false);
      setError(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(false);

    const service = new routesLibrary.DirectionsService();

    void service.route(
      {
        origin: pickup,
        destination: dropoff,
        travelMode: google.maps.TravelMode.DRIVING,
        region: 'GB',
      },
      (result, status) => {
        if (cancelled) return;

        setLoading(false);

        if (status === 'OK' && result?.routes[0]?.legs[0]) {
          const leg = result.routes[0].legs[0];
          setRoute({
            distanceMetres: leg.distance?.value ?? 0,
            durationSeconds: leg.duration?.value ?? 0,
          });
          return;
        }

        setError(true);
        setRoute(null);
      },
    );

    return () => {
      cancelled = true;
    };
  }, [routesLibrary, pickup?.lat, pickup?.lng, dropoff?.lat, dropoff?.lng]);

  return { route, loading, error };
}
