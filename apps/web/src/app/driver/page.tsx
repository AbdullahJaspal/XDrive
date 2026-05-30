'use client';

import {
  AlertTriangle,
  Calendar,
  Car,
  ChevronRight,
  ClipboardCheck,
  MapPin,
  Phone,
  RefreshCw,
  Shield,
} from 'lucide-react';
import { DriverHomeSkeleton } from '@/components/skeletons';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

import { ConnectionBadge } from '@/components/driver/connection-badge';
import { DutyToggleCard } from '@/components/driver/duty-toggle-card';
import { RealtimeBanner } from '@/components/driver/realtime-banner';
import type { DriverAvailabilityUi } from '@/lib/driver/availability';
import { StatCard } from '@/components/dashboard/stat-card';
import { DriverShell } from '@/components/layout/driver-shell';
import { PageContainer } from '@/components/layout/page-container';
import { useDriverRealtime } from '@/lib/driver/use-driver-realtime';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BOOKING_STATUS_LABELS, DRIVER_STATUS_LABELS } from '@/lib/driver/labels';
import { getAccessToken } from '@/lib/auth/session-client';
import { apiRequest } from '@/lib/api/client';
import type { BookingSummary } from '@uk-phv/shared-types';

interface DriverMeResponse {
  id: string;
  status: string;
  employeeNumber: string | null;
  operator: {
    tradingName: string | null;
    legalName: string;
    licenceNumber: string;
  };
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
  };
  vehicle: {
    registration: string;
    make: string;
    model: string;
    colour: string;
    isWheelchairAccessible: boolean;
  } | null;
  phvLicence: {
    licenceNumber: string;
    expiryDate: string;
    status: string;
  } | null;
  stats: {
    activeJobs: number;
    todayCompleted: number;
    upcomingCount: number;
  };
  activeJob: BookingSummary | null;
  availability: DriverAvailabilityUi;
}

function formatScheduled(iso: string | null): string {
  if (!iso) return 'As soon as possible';
  return new Date(iso).toLocaleString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function DriverHomePage() {
  const [data, setData] = useState<DriverMeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (silent = false) => {
    const token = getAccessToken();
    if (!token) {
      setError('Sign in required');
      setLoading(false);
      return;
    }
    if (!silent) setRefreshing(true);
    try {
      const me = await apiRequest<DriverMeResponse>('/drivers/me', { token });
      setData(me);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const { live, lastMessage, clearLastMessage } = useDriverRealtime(() => {
    void load(true);
  });

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <DriverShell>
        <DriverHomeSkeleton />
      </DriverShell>
    );
  }

  if (error || !data) {
    return (
      <DriverShell>
        <PageContainer className="flex min-h-[50vh] flex-col items-center justify-center gap-6 text-center">
          <p className="text-destructive" role="alert">
            {error ?? 'Unable to load driver profile'}
          </p>
          <Button asChild>
            <Link href="/driver/login">Sign in again</Link>
          </Button>
        </PageContainer>
      </DriverShell>
    );
  }

  const operatorName = data.operator.tradingName ?? data.operator.legalName;
  const licenceWarning =
    data.phvLicence &&
    (data.phvLicence.status === 'EXPIRING_SOON' || data.phvLicence.status === 'EXPIRED');

  return (
    <DriverShell>
      <PageContainer className="space-y-8 py-8 sm:py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <ConnectionBadge live={live} />
            </div>
            <p className="label-caps text-luxury">Good {getGreeting()}, {data.user.firstName}</p>
            <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Today&apos;s shift</h1>
            <p className="mt-1 text-muted-foreground">
              {operatorName} · {DRIVER_STATUS_LABELS[data.status] ?? data.status}
            </p>
          </div>
          <Button variant="outline" onClick={() => void load(true)} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {lastMessage ? (
          <RealtimeBanner message={lastMessage} onDismiss={clearLastMessage} />
        ) : null}

        <DutyToggleCard
          driverStatus={data.status}
          availability={data.availability}
          onUpdated={() => void load(true)}
        />

        {licenceWarning ? (
          <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-medium">PHV licence attention required</p>
              <p className="mt-1 text-amber-800/90">
                Licence {data.phvLicence?.licenceNumber} — status{' '}
                {data.phvLicence?.status.replace(/_/g, ' ').toLowerCase()}, expires{' '}
                {data.phvLicence?.expiryDate}. Contact your operator before accepting new jobs.
              </p>
            </div>
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            label="Active jobs"
            value={data.stats.activeJobs}
            icon={MapPin}
            variant="info"
            trend="Assigned & in progress"
          />
          <StatCard
            label="Completed today"
            value={data.stats.todayCompleted}
            icon={ClipboardCheck}
            variant="success"
            trend="Since midnight UTC"
          />
          <StatCard
            label="Upcoming"
            value={data.stats.upcomingCount}
            icon={Calendar}
            variant="default"
            trend="Confirmed & scheduled"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="surface-elevated border-0 lg:col-span-2">
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div>
                <CardTitle>Current assignment</CardTitle>
                <CardDescription>
                  {data.activeJob
                    ? `Reference ${data.activeJob.reference}`
                    : 'No active job — check upcoming or wait for dispatch'}
                </CardDescription>
              </div>
              {data.activeJob ? (
                <Badge variant="secondary">
                  {BOOKING_STATUS_LABELS[data.activeJob.status] ?? data.activeJob.status}
                </Badge>
              ) : null}
            </CardHeader>
            <CardContent>
              {data.activeJob ? (
                <div className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl border border-border/80 bg-secondary/20 p-4">
                      <p className="label-caps mb-2">Pickup</p>
                      <p className="font-medium">{data.activeJob.pickup.address}</p>
                      <p className="text-sm text-muted-foreground">{data.activeJob.pickup.postcode}</p>
                    </div>
                    <div className="rounded-xl border border-border/80 bg-secondary/20 p-4">
                      <p className="label-caps mb-2">Drop-off</p>
                      <p className="font-medium">{data.activeJob.dropoff.address}</p>
                      <p className="text-sm text-muted-foreground">
                        {data.activeJob.dropoff.postcode}
                      </p>
                    </div>
                  </div>
                  <dl className="grid gap-3 text-sm sm:grid-cols-2">
                    <div>
                      <dt className="text-muted-foreground">Passenger</dt>
                      <dd className="font-medium">{data.activeJob.passengerName}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Scheduled</dt>
                      <dd className="font-medium">{formatScheduled(data.activeJob.scheduledAt)}</dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-muted-foreground">Contact</dt>
                      <dd>
                        <a
                          href={`tel:${data.activeJob.passengerPhone}`}
                          className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline"
                        >
                          <Phone className="h-4 w-4" />
                          {data.activeJob.passengerPhone}
                        </a>
                      </dd>
                    </div>
                  </dl>
                  <Button asChild className="w-full sm:w-auto">
                    <Link href={`/driver/jobs/${data.activeJob.id}`}>
                      Open job details
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-4 py-10 text-center">
                  <MapPin className="h-12 w-12 text-muted-foreground/40" />
                  <p className="max-w-sm text-muted-foreground">
                    When dispatch assigns you a journey, it will appear here with pickup details and
                    passenger contact.
                  </p>
                  <Button variant="outline" asChild>
                    <Link href="/driver/jobs">View all jobs</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="surface-elevated border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Car className="h-5 w-5 text-luxury" />
                  Your vehicle
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                {data.vehicle ? (
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-muted-foreground">Registration</dt>
                      <dd className="font-mono text-lg font-semibold tracking-wide">
                        {data.vehicle.registration}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Vehicle</dt>
                      <dd>
                        {data.vehicle.colour} {data.vehicle.make} {data.vehicle.model}
                      </dd>
                    </div>
                    {data.vehicle.isWheelchairAccessible ? (
                      <Badge variant="outline">Wheelchair accessible</Badge>
                    ) : null}
                  </dl>
                ) : (
                  <p className="text-muted-foreground">
                    No vehicle assigned. Ask your operator to link a PHV to your profile.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="surface-elevated border-0">
              <CardHeader className="flex flex-row items-start justify-between gap-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Shield className="h-5 w-5 text-luxury" />
                  Compliance
                </CardTitle>
                <Button variant="link" size="sm" className="h-auto px-0 text-luxury" asChild>
                  <Link href="/driver/profile">Manage</Link>
                </Button>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>
                  Operator licence <span className="font-mono text-foreground">{data.operator.licenceNumber}</span>
                </p>
                {data.phvLicence ? (
                  <p>
                    Your PHV driver licence{' '}
                    <span className="font-medium text-foreground">{data.phvLicence.licenceNumber}</span>{' '}
                    — valid until{' '}
                    <span className="text-foreground">{data.phvLicence.expiryDate}</span>
                  </p>
                ) : (
                  <p className="text-amber-800">PHV driver licence not on file.</p>
                )}
                {data.employeeNumber ? (
                  <p>
                    Employee ref{' '}
                    <span className="font-mono text-foreground">{data.employeeNumber}</span>
                  </p>
                ) : null}
              </CardContent>
            </Card>
          </div>
        </div>
      </PageContainer>
    </DriverShell>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
}
