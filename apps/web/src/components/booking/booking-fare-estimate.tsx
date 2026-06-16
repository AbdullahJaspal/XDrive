'use client';

import { Loader2, PoundSterling } from 'lucide-react';
import { useEffect, useMemo } from 'react';

import { useBookingRoute } from '@/hooks/use-booking-route';
import {
  calculateFareEstimate,
  formatDistanceMiles,
  formatPenceGbp,
  isAirportPickup,
  RATE_PENCE_PER_MILE,
  type FareEstimate,
} from '@/lib/booking/fare';
import { cn } from '@/lib/utils';

interface BookingFareEstimateProps {
  pickupLat: number | null;
  pickupLng: number | null;
  pickupAddress: string;
  pickupIsAirport?: boolean;
  dropoffLat: number | null;
  dropoffLng: number | null;
  className?: string;
  onFareChange?: (fare: FareEstimate | null) => void;
}

export function BookingFareEstimate({
  pickupLat,
  pickupLng,
  pickupAddress,
  pickupIsAirport,
  dropoffLat,
  dropoffLng,
  className,
  onFareChange,
}: BookingFareEstimateProps) {
  const pickup = pickupLat != null && pickupLng != null ? { lat: pickupLat, lng: pickupLng } : null;
  const dropoff =
    dropoffLat != null && dropoffLng != null ? { lat: dropoffLat, lng: dropoffLng } : null;

  const { route, loading, error } = useBookingRoute(pickup, dropoff);

  const fare = useMemo(() => {
    if (!route) return null;
    const airport = isAirportPickup(pickupAddress, pickupIsAirport);
    return calculateFareEstimate(route.distanceMetres, airport);
  }, [route, pickupAddress, pickupIsAirport]);

  useEffect(() => {
    onFareChange?.(fare);
  }, [fare, onFareChange]);

  if (!pickup || !dropoff) return null;

  if (loading) {
    return (
      <div
        className={cn(
          'surface-elevated text-muted-foreground flex items-center gap-3 rounded-sm px-4 py-3 text-sm',
          className,
        )}
        role="status"
      >
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        Calculating fare…
      </div>
    );
  }

  if (error || !fare) return null;

  return (
    <div className={cn('surface-elevated rounded-sm px-4 py-4', className)}>
      <div className="mb-3 flex items-center gap-2">
        <PoundSterling className="text-luxury h-4 w-4" aria-hidden />
        <p className="label-caps">Estimated fare</p>
      </div>
      <dl className="space-y-2 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">
            {formatDistanceMiles(fare.distanceMiles)} miles × {formatPenceGbp(RATE_PENCE_PER_MILE)}
          </dt>
          <dd>{formatPenceGbp(fare.mileagePence)}</dd>
        </div>
        {fare.airportFeePence > 0 ? (
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Airport parking fee</dt>
            <dd>{formatPenceGbp(fare.airportFeePence)}</dd>
          </div>
        ) : null}
        <div className="border-border flex justify-between gap-4 border-t pt-2 font-medium">
          <dt>Total estimate</dt>
          <dd className="text-luxury text-base">{formatPenceGbp(fare.totalPence)}</dd>
        </div>
      </dl>
      <p className="text-muted-foreground mt-3 text-xs">
        Based on driving distance. Final fare confirmed by your operator before dispatch.
      </p>
    </div>
  );
}
