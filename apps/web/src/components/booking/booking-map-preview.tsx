'use client';

import { APIProvider, Map, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { useEffect, useMemo, useState } from 'react';

import { DEFAULT_COORDS } from '@/lib/booking/defaults';
import { cn } from '@/lib/utils';

const MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
const ROUTE_COLOR = '#C9A962';

type LatLng = google.maps.LatLngLiteral;

interface BookingMapPreviewProps {
  pickupAddress: string;
  pickupPostcode: string;
  dropoffAddress: string;
  dropoffPostcode: string;
  className?: string;
}

function formatUkAddress(address: string, postcode: string): string | null {
  const parts = [address.trim(), postcode.trim().toUpperCase()].filter(Boolean);
  if (parts.length === 0) return null;
  return `${parts.join(', ')}, UK`;
}

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebounced(value);
    }, delayMs);
    return () => {
      window.clearTimeout(timer);
    };
  }, [value, delayMs]);

  return debounced;
}

function geocodeAddress(geocoder: google.maps.Geocoder, address: string): Promise<LatLng | null> {
  return geocoder
    .geocode({ address, region: 'GB' })
    .then((response) => {
      const location = response.results[0]?.geometry.location;
      if (!location) return null;
      return { lat: location.lat(), lng: location.lng() };
    })
    .catch(() => null);
}

function BookingMapMarkers({
  pickupQuery,
  dropoffQuery,
}: {
  pickupQuery: string | null;
  dropoffQuery: string | null;
}) {
  const map = useMap();
  const routesLibrary = useMapsLibrary('routes');
  const [pickupPos, setPickupPos] = useState<LatLng | null>(null);
  const [dropoffPos, setDropoffPos] = useState<LatLng | null>(null);

  useEffect(() => {
    if (!pickupQuery) {
      setPickupPos(null);
      return;
    }

    let cancelled = false;
    const geocoder = new google.maps.Geocoder();

    void geocodeAddress(geocoder, pickupQuery).then((position) => {
      if (!cancelled) setPickupPos(position);
    });

    return () => {
      cancelled = true;
    };
  }, [pickupQuery]);

  useEffect(() => {
    if (!dropoffQuery) {
      setDropoffPos(null);
      return;
    }

    let cancelled = false;
    const geocoder = new google.maps.Geocoder();

    void geocodeAddress(geocoder, dropoffQuery).then((position) => {
      if (!cancelled) setDropoffPos(position);
    });

    return () => {
      cancelled = true;
    };
  }, [dropoffQuery]);

  useEffect(() => {
    if (!map) return;

    // google.maps.Marker is deprecated; AdvancedMarkerElement needs separate map setup.
    /* eslint-disable @typescript-eslint/no-deprecated */
    const markers: google.maps.Marker[] = [];

    if (pickupPos) {
      markers.push(
        new google.maps.Marker({
          position: pickupPos,
          map,
          title: 'Pickup',
          label: { text: 'A', color: 'white' },
        }),
      );
    }

    if (dropoffPos) {
      markers.push(
        new google.maps.Marker({
          position: dropoffPos,
          map,
          title: 'Drop-off',
          label: { text: 'B', color: 'white' },
        }),
      );
    }
    /* eslint-enable @typescript-eslint/no-deprecated */

    return () => {
      markers.forEach((marker) => {
        marker.setMap(null);
      });
    };
  }, [map, pickupPos, dropoffPos]);

  useEffect(() => {
    if (!map || !routesLibrary || !pickupPos || !dropoffPos) return;

    const service = new routesLibrary.DirectionsService();
    const renderer = new routesLibrary.DirectionsRenderer({
      map,
      suppressMarkers: true,
      polylineOptions: {
        strokeColor: ROUTE_COLOR,
        strokeWeight: 4,
      },
    });

    let cancelled = false;

    void service.route(
      {
        origin: pickupPos,
        destination: dropoffPos,
        travelMode: google.maps.TravelMode.DRIVING,
        region: 'GB',
      },
      (result, status) => {
        if (cancelled) return;
        if (status === 'OK' && result) {
          renderer.setDirections(result);
        } else {
          renderer.setMap(null);
        }
      },
    );

    return () => {
      cancelled = true;
      renderer.setMap(null);
    };
  }, [map, routesLibrary, pickupPos, dropoffPos]);

  useEffect(() => {
    if (!map) return;

    if (pickupPos && dropoffPos) {
      const bounds = new google.maps.LatLngBounds();
      bounds.extend(pickupPos);
      bounds.extend(dropoffPos);
      map.fitBounds(bounds, 48);
      return;
    }

    if (pickupPos) {
      map.setCenter(pickupPos);
      map.setZoom(14);
      return;
    }

    if (dropoffPos) {
      map.setCenter(dropoffPos);
      map.setZoom(14);
      return;
    }

    map.setCenter(DEFAULT_COORDS);
    map.setZoom(12);
  }, [map, pickupPos, dropoffPos]);

  return null;
}

export function BookingMapPreview({
  pickupAddress,
  pickupPostcode,
  dropoffAddress,
  dropoffPostcode,
  className,
}: BookingMapPreviewProps) {
  const pickupQuery = useMemo(
    () => formatUkAddress(pickupAddress, pickupPostcode),
    [pickupAddress, pickupPostcode],
  );
  const dropoffQuery = useMemo(
    () => formatUkAddress(dropoffAddress, dropoffPostcode),
    [dropoffAddress, dropoffPostcode],
  );

  const debouncedPickup = useDebouncedValue(pickupQuery, 600);
  const debouncedDropoff = useDebouncedValue(dropoffQuery, 600);

  if (!MAPS_API_KEY) {
    return (
      <div
        className={cn(
          'surface-elevated bg-muted/30 flex aspect-[2/1] items-center justify-center rounded-sm',
          className,
        )}
      >
        <p className="text-muted-foreground px-4 text-center text-sm">
          Map preview unavailable — set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in apps/web/.env
        </p>
      </div>
    );
  }

  return (
    <div className={cn('surface-elevated overflow-hidden rounded-sm', className)}>
      <APIProvider apiKey={MAPS_API_KEY} libraries={['routes']}>
        <div className="aspect-[2/1] w-full">
          <Map
            defaultCenter={DEFAULT_COORDS}
            defaultZoom={12}
            gestureHandling="cooperative"
            disableDefaultUI
            zoomControl
            reuseMaps
            style={{ width: '100%', height: '100%' }}
          >
            <BookingMapMarkers pickupQuery={debouncedPickup} dropoffQuery={debouncedDropoff} />
          </Map>
        </div>
      </APIProvider>
    </div>
  );
}
