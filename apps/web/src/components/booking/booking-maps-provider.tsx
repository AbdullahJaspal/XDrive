'use client';

import { APIProvider } from '@vis.gl/react-google-maps';

import { GOOGLE_MAPS_ENABLED } from '@/lib/booking/uk-address';

const MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

interface BookingMapsProviderProps {
  children: React.ReactNode;
}

export function BookingMapsProvider({ children }: BookingMapsProviderProps) {
  if (!GOOGLE_MAPS_ENABLED || !MAPS_API_KEY) {
    return children;
  }

  return (
    <APIProvider apiKey={MAPS_API_KEY} libraries={['places', 'routes']}>
      {children}
    </APIProvider>
  );
}
