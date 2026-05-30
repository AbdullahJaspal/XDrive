'use client';

import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { AdminShell } from '@/components/layout/admin-shell';
import { PageContainer } from '@/components/layout/page-container';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { getAccessToken } from '@/lib/auth/session-client';
import { apiRequest } from '@/lib/api/client';
import type { BookingSummary } from '@uk-phv/shared-types';

export default function AdminNewBookingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    const token = getAccessToken();
    if (!token) return;

    const form = new FormData(e.currentTarget);
    const pickupAddress = String(form.get('pickupAddress') ?? '').trim();
    const pickupPostcode = String(form.get('pickupPostcode') ?? '').trim();
    const dropoffAddress = String(form.get('dropoffAddress') ?? '').trim();
    const dropoffPostcode = String(form.get('dropoffPostcode') ?? '').trim();
    const passengerName = String(form.get('passengerName') ?? '').trim();
    const passengerPhone = String(form.get('passengerPhone') ?? '').trim();
    const notes = String(form.get('notes') ?? '').trim();

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
          lat: 52.48,
          lng: -1.9,
        },
        dropoff: {
          address: dropoffAddress,
          postcode: dropoffPostcode,
          lat: 52.45,
          lng: -1.73,
        },
        accessibilityRequirements: [],
      }),
    })
      .then((booking) => {
        router.push(`/admin/dispatch/${booking.id}`);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Could not create booking');
      })
      .finally(() => setLoading(false));
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
          <p className="mt-1 text-muted-foreground">Create a job for dispatch (coordinates use dev defaults)</p>
        </div>

        <Card className="surface-elevated border-0">
          <CardHeader>
            <CardTitle>Trip & passenger</CardTitle>
            <CardDescription>Booking starts as requested — confirm then assign on the next screen</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="passengerName">Passenger name</Label>
                <Input id="passengerName" name="passengerName" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="passengerPhone">Phone</Label>
                <Input id="passengerPhone" name="passengerPhone" type="tel" required placeholder="07700900123" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pickupAddress">Pickup address</Label>
                <Input id="pickupAddress" name="pickupAddress" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pickupPostcode">Pickup postcode</Label>
                <Input id="pickupPostcode" name="pickupPostcode" required placeholder="B1 1AA" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dropoffAddress">Dropoff address</Label>
                <Input id="dropoffAddress" name="dropoffAddress" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dropoffPostcode">Dropoff postcode</Label>
                <Input id="dropoffPostcode" name="dropoffPostcode" required placeholder="B26 3QJ" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" name="notes" rows={2} />
              </div>
              {error ? (
                <p className="text-sm text-destructive" role="alert">
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
