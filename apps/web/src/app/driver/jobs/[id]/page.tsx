'use client';

import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  MapPin,
  Navigation,
  Phone,
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { dispatchDriverDutyChanged } from '@/components/driver/duty-status-pill';
import { DriverJobDetailSkeleton } from '@/components/skeletons';
import { ConnectionBadge } from '@/components/driver/connection-badge';
import { RealtimeBanner } from '@/components/driver/realtime-banner';
import { DriverShell } from '@/components/layout/driver-shell';
import { PageContainer } from '@/components/layout/page-container';
import { useDriverRealtime } from '@/lib/driver/use-driver-realtime';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BOOKING_STATUS_LABELS } from '@/lib/driver/labels';
import { getNextDriverAction } from '@/lib/driver/status-actions';
import { getAccessToken } from '@/lib/auth/session-client';
import { apiRequest } from '@/lib/api/client';
import type { BookingStatus, BookingSummary } from '@uk-phv/shared-types';

interface DriverBookingDetail extends BookingSummary {
  notes: string | null;
  passengerEmail: string | null;
  vehicle: {
    registration: string;
    make: string;
    model: string;
    colour: string;
  } | null;
  dispatchedAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
}

function mapsUrl(address: string, postcode: string): string {
  const q = encodeURIComponent(`${address}, ${postcode}`);
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

export default function DriverJobDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [job, setJob] = useState<DriverBookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (silent = false) => {
    const token = getAccessToken();
    if (!token || !params.id) return;
    if (!silent) setLoading(true);
    try {
      const data = await apiRequest<DriverBookingDetail>(`/drivers/me/bookings/${params.id}`, {
        token,
      });
      setJob(data);
      setError(null);
    } catch (err) {
      if (!silent) setError(err instanceof Error ? err.message : 'Job not found');
    } finally {
      if (!silent) setLoading(false);
    }
  }, [params.id]);

  const { live, lastMessage, clearLastMessage } = useDriverRealtime(() => {
    void load(true);
  });

  useEffect(() => {
    void load();
  }, [load]);

  async function advanceStatus() {
    if (!job) return;
    const action = getNextDriverAction(job.status as BookingStatus);
    if (!action) return;

    const token = getAccessToken();
    if (!token) return;

    setUpdating(true);
    setError(null);
    try {
      const updated = await apiRequest<BookingSummary>(
        `/drivers/me/bookings/${job.id}/status`,
        {
          method: 'PATCH',
          token,
          body: JSON.stringify({ status: action.status }),
        },
      );
      setJob((prev) => (prev ? { ...prev, ...updated, status: updated.status } : prev));
      dispatchDriverDutyChanged();
      if (action.status === 'COMPLETED') {
        router.push('/driver/jobs?tab=history');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Status update failed');
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return (
      <DriverShell>
        <DriverJobDetailSkeleton />
      </DriverShell>
    );
  }

  if (!job) {
    return (
      <DriverShell>
        <PageContainer className="py-16 text-center">
          <p className="text-destructive">{error ?? 'Job not found'}</p>
          <Button className="mt-6" variant="outline" asChild>
            <Link href="/driver/jobs">Back to jobs</Link>
          </Button>
        </PageContainer>
      </DriverShell>
    );
  }

  const nextAction = getNextDriverAction(job.status as BookingStatus);
  const isTerminal = ['COMPLETED', 'CANCELLED', 'NO_SHOW'].includes(job.status);

  return (
    <DriverShell>
      <PageContainer className="space-y-6 py-8">
        <Button variant="ghost" size="sm" asChild className="-ml-2">
          <Link href="/driver/jobs">
            <ArrowLeft className="h-4 w-4" />
            All jobs
          </Link>
        </Button>

        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="mb-2">
              <ConnectionBadge live={live} />
            </div>
            <p className="label-caps text-luxury">Job reference</p>
            <h1 className="font-mono text-2xl font-bold">{job.reference}</h1>
          </div>
          <Badge variant="secondary" className="text-sm">
            {BOOKING_STATUS_LABELS[job.status] ?? job.status}
          </Badge>
        </div>

        {lastMessage ? (
          <RealtimeBanner message={lastMessage} onDismiss={clearLastMessage} />
        ) : null}

        {error ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        <Card className="surface-elevated border-0">
          <CardHeader>
            <CardTitle className="text-lg">Journey</CardTitle>
            <CardDescription>
              {job.scheduledAt
                ? new Date(job.scheduledAt).toLocaleString('en-GB')
                : 'As soon as possible'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <JourneyStop
              label="Pickup"
              address={job.pickup.address}
              postcode={job.pickup.postcode}
            />
            <div className="ml-4 h-6 border-l border-dashed border-border" aria-hidden />
            <JourneyStop
              label="Drop-off"
              address={job.dropoff.address}
              postcode={job.dropoff.postcode}
            />
          </CardContent>
        </Card>

        <Card className="surface-elevated border-0">
          <CardHeader>
            <CardTitle className="text-lg">Passenger</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="text-lg font-medium">{job.passengerName}</p>
            <a
              href={`tel:${job.passengerPhone}`}
              className="inline-flex items-center gap-2 font-medium text-primary hover:underline"
            >
              <Phone className="h-4 w-4" />
              {job.passengerPhone}
            </a>
            {job.passengerEmail ? (
              <p className="text-muted-foreground">{job.passengerEmail}</p>
            ) : null}
            {job.accessibilityRequirements.length > 0 ? (
              <div className="flex flex-wrap gap-2 pt-2">
                {job.accessibilityRequirements.map((req) => (
                  <Badge key={req} variant="outline">
                    {req.replace(/_/g, ' ').toLowerCase()}
                  </Badge>
                ))}
              </div>
            ) : null}
            {job.notes ? (
              <div className="rounded-lg bg-secondary/40 p-3 text-muted-foreground">
                <p className="label-caps mb-1 text-foreground">Operator notes</p>
                {job.notes}
              </div>
            ) : null}
          </CardContent>
        </Card>

        {job.vehicle ? (
          <Card className="surface-elevated border-0">
            <CardContent className="flex items-center justify-between py-4 text-sm">
              <span className="text-muted-foreground">Vehicle for this job</span>
              <span className="font-mono font-semibold">
                {job.vehicle.colour} {job.vehicle.make} {job.vehicle.model} ·{' '}
                {job.vehicle.registration}
              </span>
            </CardContent>
          </Card>
        ) : null}

        {!isTerminal && nextAction ? (
          <div className="sticky bottom-4 space-y-3">
            <Button
              size="lg"
              variant="luxury"
              className="w-full"
              disabled={updating}
              onClick={() => void advanceStatus()}
            >
              {updating ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Navigation className="h-5 w-5" />
                  {nextAction.label}
                </>
              )}
            </Button>
            <p className="text-center text-xs text-muted-foreground">{nextAction.description}</p>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 py-4 text-emerald-900">
            <CheckCircle2 className="h-5 w-5" />
            <span className="font-medium">Journey closed</span>
          </div>
        )}
      </PageContainer>
    </DriverShell>
  );
}

function JourneyStop({
  label,
  address,
  postcode,
}: {
  label: string;
  address: string;
  postcode: string;
}) {
  return (
    <div className="flex gap-3">
      <MapPin className="mt-1 h-5 w-5 shrink-0 text-luxury" aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="label-caps">{label}</p>
        <p className="font-medium">{address}</p>
        <p className="text-sm text-muted-foreground">{postcode}</p>
        <Button variant="link" size="sm" className="h-auto px-0 text-luxury" asChild>
          <a href={mapsUrl(address, postcode)} target="_blank" rel="noopener noreferrer">
            Open in Maps
          </a>
        </Button>
      </div>
    </div>
  );
}
