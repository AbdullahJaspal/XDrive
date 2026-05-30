'use client';

import { Calendar, ChevronRight, History, MapPin, Radio } from 'lucide-react';
import { DriverJobsSkeleton } from '@/components/skeletons';
import { ListCardsSkeleton } from '@/components/skeletons/primitives';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

import { ConnectionBadge } from '@/components/driver/connection-badge';
import { RealtimeBanner } from '@/components/driver/realtime-banner';
import { DriverShell } from '@/components/layout/driver-shell';
import { PageContainer } from '@/components/layout/page-container';
import { useDriverRealtime } from '@/lib/driver/use-driver-realtime';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BOOKING_STATUS_LABELS } from '@/lib/driver/labels';
import { getAccessToken } from '@/lib/auth/session-client';
import { apiRequest } from '@/lib/api/client';
import type { BookingSummary } from '@uk-phv/shared-types';

type JobScope = 'active' | 'upcoming' | 'history';

interface BookingsListResponse {
  items: BookingSummary[];
  total: number;
}

const TABS: { scope: JobScope; label: string; icon: typeof MapPin }[] = [
  { scope: 'active', label: 'Active', icon: Radio },
  { scope: 'upcoming', label: 'Upcoming', icon: Calendar },
  { scope: 'history', label: 'History', icon: History },
];

function formatScheduled(iso: string | null): string {
  if (!iso) return 'ASAP';
  return new Date(iso).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function DriverJobsPage() {
  const [scope, setScope] = useState<JobScope>('active');
  const [items, setItems] = useState<BookingSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (tab: JobScope, silent = false) => {
    const token = getAccessToken();
    if (!token) return;
    if (!silent) setLoading(true);
    try {
      const data = await apiRequest<BookingsListResponse>(
        `/drivers/me/bookings?scope=${tab}&pageSize=30`,
        { token },
      );
      setItems(data.items);
      setTotal(data.total);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  const { live, lastMessage, clearLastMessage } = useDriverRealtime(() => {
    void load(scope, true);
  });

  useEffect(() => {
    void load(scope);
  }, [scope, load]);

  if (loading && items.length === 0) {
    return (
      <DriverShell>
        <DriverJobsSkeleton />
      </DriverShell>
    );
  }

  return (
    <DriverShell>
      <PageContainer className="space-y-6 py-8 sm:py-10">
        <div>
          <div className="mb-2">
            <ConnectionBadge live={live} />
          </div>
          <p className="label-caps text-luxury">Assignments</p>
          <h1 className="mt-2 text-3xl font-bold">Your jobs</h1>
          <p className="mt-1 text-muted-foreground">
            {total} {scope === 'history' ? 'past' : scope} job{total === 1 ? '' : 's'}
          </p>
        </div>

        {lastMessage ? (
          <RealtimeBanner message={lastMessage} onDismiss={clearLastMessage} />
        ) : null}

        <div className="flex flex-wrap gap-2" role="tablist">
          {TABS.map(({ scope: tabScope, label, icon: Icon }) => (
            <Button
              key={tabScope}
              variant={scope === tabScope ? 'default' : 'outline'}
              size="sm"
              onClick={() => setScope(tabScope)}
              role="tab"
              aria-selected={scope === tabScope}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Button>
          ))}
        </div>

        {loading ? (
          <ListCardsSkeleton count={4} />
        ) : items.length === 0 ? (
          <Card className="surface-elevated border-0">
            <CardContent className="flex flex-col items-center gap-4 py-14 text-center">
              <MapPin className="h-10 w-10 text-muted-foreground/40" />
              <p className="text-muted-foreground">No {scope} jobs right now.</p>
              <Button variant="outline" asChild>
                <Link href="/driver">Back to home</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <ul className="space-y-3">
            {items.map((job) => (
              <li key={job.id}>
                <Link href={`/driver/jobs/${job.id}`}>
                  <Card className="surface-elevated border-0 transition-colors hover:border-primary/20">
                    <CardHeader className="flex flex-row items-start justify-between gap-3 pb-2">
                      <div>
                        <CardTitle className="text-base font-mono">{job.reference}</CardTitle>
                        <CardDescription>{formatScheduled(job.scheduledAt)}</CardDescription>
                      </div>
                      <Badge variant="secondary">
                        {BOOKING_STATUS_LABELS[job.status] ?? job.status}
                      </Badge>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between gap-4 pt-0">
                      <div className="min-w-0 text-sm">
                        <p className="truncate font-medium">{job.pickup.address}</p>
                        <p className="truncate text-muted-foreground">→ {job.dropoff.address}</p>
                        <p className="mt-1 text-muted-foreground">{job.passengerName}</p>
                      </div>
                      <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
                    </CardContent>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </PageContainer>
    </DriverShell>
  );
}
