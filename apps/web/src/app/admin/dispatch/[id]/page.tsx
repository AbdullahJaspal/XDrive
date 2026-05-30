'use client';

import { ArrowLeft, Loader2, MapPin, Phone, User } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import {
  AssignDriverPanel,
  type DispatchDriverOption,
} from '@/components/admin/assign-driver-panel';
import { BookingStatusBadge } from '@/components/admin/booking-status-badge';
import { AdminShell } from '@/components/layout/admin-shell';
import { PageContainer } from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { getAccessToken } from '@/lib/auth/session-client';
import { apiRequest } from '@/lib/api/client';
import type { BookingSummary } from '@uk-phv/shared-types';

const ASSIGNABLE = new Set(['REQUESTED', 'CONFIRMED']);

export default function AdminDispatchDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const bookingId = params.id;

  const [booking, setBooking] = useState<BookingSummary | null>(null);
  const [drivers, setDrivers] = useState<DispatchDriverOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const token = getAccessToken();
    if (!token) return;
    setLoading(true);
    try {
      const [b, d] = await Promise.all([
        apiRequest<BookingSummary>(`/bookings/${bookingId}`, { token }),
        apiRequest<DispatchDriverOption[]>('/drivers', { token }),
      ]);
      setBooking(b);
      setDrivers(d);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load booking');
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function patchStatus(status: string, reason?: string) {
    const token = getAccessToken();
    if (!token) return;
    setActionLoading(true);
    setError(null);
    try {
      const updated = await apiRequest<BookingSummary>(`/bookings/${bookingId}/status`, {
        method: 'PATCH',
        token,
        body: JSON.stringify({ status, ...(reason ? { reason } : {}) }),
      });
      setBooking(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <AdminShell>
        <PageContainer className="flex min-h-[40vh] items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </PageContainer>
      </AdminShell>
    );
  }

  if (!booking) {
    return (
      <AdminShell>
        <PageContainer className="py-10 text-center">
          <p className="text-destructive">{error ?? 'Booking not found'}</p>
          <Button asChild className="mt-4" variant="outline">
            <Link href="/admin/dispatch">Back to dispatch</Link>
          </Button>
        </PageContainer>
      </AdminShell>
    );
  }

  const canConfirm = booking.status === 'REQUESTED';
  const canAssign = ASSIGNABLE.has(booking.status) && !booking.driverId;
  const canCancel = !['COMPLETED', 'CANCELLED'].includes(booking.status);

  return (
    <AdminShell>
      <PageContainer className="space-y-6 py-8 sm:py-10">
        <Button variant="ghost" size="sm" asChild className="-ml-2 w-fit">
          <Link href="/admin/dispatch">
            <ArrowLeft className="h-4 w-4" />
            Dispatch board
          </Link>
        </Button>

        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-mono text-2xl font-bold">{booking.reference}</h1>
          <BookingStatusBadge status={booking.status} />
        </div>

        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="surface-elevated border-0">
            <CardHeader>
              <CardTitle>Trip details</CardTitle>
              <CardDescription>Passenger and route</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div>
                  <p className="font-medium">{booking.pickup.address}</p>
                  <p className="text-muted-foreground">{booking.pickup.postcode}</p>
                  <p className="mt-2 font-medium">{booking.dropoff.address}</p>
                  <p className="text-muted-foreground">{booking.dropoff.postcode}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                {booking.passengerName}
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a href={`tel:${booking.passengerPhone}`} className="text-primary hover:underline">
                  {booking.passengerPhone}
                </a>
              </div>
              {booking.fareEstimatePence != null ? (
                <p>
                  Estimate:{' '}
                  <span className="font-medium">
                    £{(booking.fareEstimatePence / 100).toFixed(2)}
                  </span>
                </p>
              ) : null}
            </CardContent>
          </Card>

          <div className="space-y-6">
            {canConfirm ? (
              <Card className="surface-elevated border-0">
                <CardHeader>
                  <CardTitle className="text-lg">Confirm booking</CardTitle>
                  <CardDescription>Move from requested to confirmed before dispatch</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    disabled={actionLoading}
                    onClick={() => void patchStatus('CONFIRMED')}
                  >
                    Confirm booking
                  </Button>
                </CardContent>
              </Card>
            ) : null}

            {canAssign ? (
              <Card className="surface-elevated border-0">
                <CardHeader>
                  <CardTitle className="text-lg">Assign driver</CardTitle>
                  <CardDescription>
                    Driver must be on duty with valid PHV licences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AssignDriverPanel
                    bookingId={booking.id}
                    drivers={drivers}
                    onAssigned={() => {
                      void load();
                      router.refresh();
                    }}
                  />
                </CardContent>
              </Card>
            ) : null}

            {booking.driverId ? (
              <Card className="surface-elevated border-0">
                <CardHeader>
                  <CardTitle className="text-lg">Assignment</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  <p>Driver ID: {booking.driverId}</p>
                  <p>Vehicle ID: {booking.vehicleId ?? '—'}</p>
                </CardContent>
              </Card>
            ) : null}

            {canCancel ? (
              <Card className="surface-elevated border-0">
                <CardHeader>
                  <CardTitle className="text-lg">Cancel booking</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="cancel-reason">Reason (optional)</Label>
                    <Textarea
                      id="cancel-reason"
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      rows={2}
                    />
                  </div>
                  <Button
                    variant="outline"
                    disabled={actionLoading}
                    onClick={() => void patchStatus('CANCELLED', cancelReason || undefined)}
                  >
                    Cancel booking
                  </Button>
                </CardContent>
              </Card>
            ) : null}
          </div>
        </div>
      </PageContainer>
    </AdminShell>
  );
}
