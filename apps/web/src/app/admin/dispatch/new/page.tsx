'use client';

import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { AdminShell } from '@/components/layout/admin-shell';
import { PageContainer } from '@/components/layout/page-container';
import { UkAddressField } from '@/components/booking/uk-address-field';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { getAccessToken } from '@/lib/auth/session-client';
import { apiRequest } from '@/lib/api/client';
import { readFormString } from '@/lib/form-data';
import type { BookingSummary } from '@uk-phv/shared-types';
import type { UkLocation } from '@/lib/booking/uk-address';

export default function AdminNewBookingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pickupAddress, setPickupAddress] = useState('');
  const [pickupPostcode, setPickupPostcode] = useState('');
  const [pickupLat, setPickupLat] = useState<number | null>(null);
  const [pickupLng, setPickupLng] = useState<number | null>(null);
  const [dropoffAddress, setDropoffAddress] = useState('');
  const [dropoffPostcode, setDropoffPostcode] = useState('');
  const [dropoffLat, setDropoffLat] = useState<number | null>(null);
  const [dropoffLng, setDropoffLng] = useState<number | null>(null);

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    const token = getAccessToken();
    if (!token) return;

    const form = new FormData(e.currentTarget);
    const passengerName = readFormString(form, 'passengerName');
    const passengerPhone = readFormString(form, 'passengerPhone');
    const notes = readFormString(form, 'notes');

    if (
      !pickupAddress.trim() ||
      !pickupPostcode.trim() ||
      !dropoffAddress.trim() ||
      !dropoffPostcode.trim()
    ) {
      setError('Please provide pickup and dropoff addresses.');
      return;
    }

    setLoading(true);
    setError(null);

    void apiRequest<BookingSummary>('/bookings', {
      method: 'POST',
      token,
      body: JSON.stringify({
        source: 'PHONE',
        passengerName,
        passengerPhone,
        notes: notes || undefined,
        pickup: {
          address: pickupAddress,
          postcode: pickupPostcode,
          lat: pickupLat ?? 52.48,
          lng: pickupLng ?? -1.9,
        },
        dropoff: {
          address: dropoffAddress,
          postcode: dropoffPostcode,
          lat: dropoffLat ?? 52.45,
          lng: dropoffLng ?? -1.73,
        },
        accessibilityRequirements: [],
      }),
    })
      .then((booking) => {
        router.push(`/admin/dispatch/${booking.id}`);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Could not create booking');
      })
      .finally(() => {
        setLoading(false);
      });
  }

  return (
    <AdminShell>
      <PageContainer className="mx-auto max-w-xl space-y-6 py-8 sm:py-10">
        <Button variant="ghost" size="sm" asChild className="-ml-2 w-fit">
          <Link href="/admin/dispatch">
            <ArrowLeft className="h-4 w-4" />
            Dispatch board
          </Link>
        </Button>

        <div>
          <Badge variant="secondary" className="mb-2">
            Phone booking
          </Badge>
          <h1 className="text-3xl font-bold">New booking</h1>
          <p className="text-muted-foreground mt-1">
            Create a job for dispatch using selected UK addresses and coordinates
          </p>
        </div>

        <Card className="surface-elevated border-0">
          <CardHeader>
            <CardTitle>Trip & passenger</CardTitle>
            <CardDescription>
              Booking starts as requested — confirm then assign on the next screen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="passengerName">Passenger name</Label>
                <Input id="passengerName" name="passengerName" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="passengerPhone">Phone</Label>
                <Input
                  id="passengerPhone"
                  name="passengerPhone"
                  type="tel"
                  required
                  placeholder="07700900123"
                />
              </div>
              <UkAddressField
                id="pickup"
                label="Pickup address"
                address={pickupAddress}
                postcode={pickupPostcode}
                lat={pickupLat}
                lng={pickupLng}
                onAddressChange={setPickupAddress}
                onPostcodeChange={setPickupPostcode}
                onLocationSelect={(location: UkLocation) => {
                  setPickupAddress(location.address);
                  setPickupPostcode(location.postcode);
                  setPickupLat(location.lat);
                  setPickupLng(location.lng);
                }}
                onClearCoordinates={() => {
                  setPickupLat(null);
                  setPickupLng(null);
                }}
                clearAddressError={() => {
                  /* no field-level errors */
                }}
                clearPostcodeError={() => {
                  /* no field-level errors */
                }}
                postcodeHint="Auto-filled from selected address"
              />
              <UkAddressField
                id="dropoff"
                label="Dropoff address"
                address={dropoffAddress}
                postcode={dropoffPostcode}
                lat={dropoffLat}
                lng={dropoffLng}
                onAddressChange={setDropoffAddress}
                onPostcodeChange={setDropoffPostcode}
                onLocationSelect={(location: UkLocation) => {
                  setDropoffAddress(location.address);
                  setDropoffPostcode(location.postcode);
                  setDropoffLat(location.lat);
                  setDropoffLng(location.lng);
                }}
                onClearCoordinates={() => {
                  setDropoffLat(null);
                  setDropoffLng(null);
                }}
                clearAddressError={() => {
                  /* no field-level errors */
                }}
                clearPostcodeError={() => {
                  /* no field-level errors */
                }}
                postcodeHint="Auto-filled from selected address"
              />
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" name="notes" rows={2} />
              </div>
              {error ? (
                <p className="text-destructive text-sm" role="alert">
                  {error}
                </p>
              ) : null}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating…
                  </>
                ) : (
                  'Create booking'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </PageContainer>
    </AdminShell>
  );
}
