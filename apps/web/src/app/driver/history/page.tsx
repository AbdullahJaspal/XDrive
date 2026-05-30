'use client';

import { ChevronRight, TrendingUp } from 'lucide-react';
import { DriverHistorySkeleton } from '@/components/skeletons';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

import { StatCard } from '@/components/dashboard/stat-card';
import { DriverShell } from '@/components/layout/driver-shell';
import { PageContainer } from '@/components/layout/page-container';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BOOKING_STATUS_LABELS } from '@/lib/driver/labels';
import { formatPence } from '@/lib/driver/format';
import { getAccessToken } from '@/lib/auth/session-client';
import { apiRequest } from '@/lib/api/client';
import type { BookingSummary } from '@uk-phv/shared-types';

interface ShiftItem extends BookingSummary {
  completedAt: string | null;
  farePence: number | null;
}

interface ShiftHistoryResponse {
  items: ShiftItem[];
  total: number;
  page: number;
  totalPages: number;
  summary: {
    last30Days: { trips: number; earningsPence: number };
    allTimeCompleted: number;
  };
}

export default function DriverHistoryPage() {
  const [data, setData] = useState<ShiftHistoryResponse | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (p: number) => {
    const token = getAccessToken();
    if (!token) return;
    setLoading(true);
    try {
      const result = await apiRequest<ShiftHistoryResponse>(
        `/drivers/me/shifts?page=${String(p)}&pageSize=15`,
        { token },
      );
      setData(result);
      setPage(p);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(1);
  }, [load]);

  if (loading && !data) {
    return (
      <DriverShell>
        <DriverHistorySkeleton />
      </DriverShell>
    );
  }

  return (
    <DriverShell>
      <PageContainer className="space-y-8 py-8 sm:py-10">
        <div>
          <p className="label-caps text-luxury">Records</p>
          <h1 className="mt-2 text-3xl font-bold">Shift history</h1>
          <p className="mt-1 text-muted-foreground">
            Completed and closed journeys for council retention
          </p>
        </div>

        {data ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <StatCard
              label="Trips (30 days)"
              value={data.summary.last30Days.trips}
              icon={TrendingUp}
              variant="success"
              trend={formatPence(data.summary.last30Days.earningsPence) + ' estimated'}
            />
            <StatCard
              label="All-time completed"
              value={data.summary.allTimeCompleted}
              icon={TrendingUp}
              variant="info"
              trend={`${String(data.total)} records in history`}
            />
          </div>
        ) : null}

        {data?.items.length === 0 ? (
          <Card className="surface-elevated border-0">
            <CardContent className="py-14 text-center text-muted-foreground">
              No completed shifts yet. Finish a job from{' '}
              <Link href="/driver/jobs" className="text-primary underline-offset-4 hover:underline">
                active jobs
              </Link>
              .
            </CardContent>
          </Card>
        ) : null}

        {data && data.items.length > 0 ? (
          <>
            <ul className="space-y-3">
              {data.items.map((shift) => (
                <li key={shift.id}>
                  <Link href={`/driver/jobs/${shift.id}`}>
                    <Card className="surface-elevated border-0 transition-colors hover:border-primary/20">
                      <CardHeader className="flex flex-row items-start justify-between gap-3 pb-2">
                        <div>
                          <CardTitle className="font-mono text-base">{shift.reference}</CardTitle>
                          <CardDescription>
                            {shift.completedAt
                              ? new Date(shift.completedAt).toLocaleString('en-GB')
                              : new Date(shift.createdAt).toLocaleString('en-GB')}
                          </CardDescription>
                        </div>
                        <div className="text-right">
                          <Badge variant="secondary">
                            {BOOKING_STATUS_LABELS[shift.status] ?? shift.status}
                          </Badge>
                          <p className="mt-2 text-sm font-semibold tabular-nums">
                            {formatPence(shift.farePence)}
                          </p>
                        </div>
                      </CardHeader>
                      <CardContent className="flex items-center justify-between pt-0 text-sm">
                        <div className="min-w-0">
                          <p className="truncate">{shift.pickup.address}</p>
                          <p className="truncate text-muted-foreground">
                            → {shift.dropoff.address}
                          </p>
                        </div>
                        <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
                      </CardContent>
                    </Card>
                  </Link>
                </li>
              ))}
            </ul>

            {data.totalPages > 1 ? (
              <div className="flex items-center justify-between gap-4">
                <Button
                  variant="outline"
                  disabled={page <= 1 || loading}
                  onClick={() => void load(page - 1)}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {page} of {data.totalPages}
                </span>
                <Button
                  variant="outline"
                  disabled={page >= data.totalPages || loading}
                  onClick={() => void load(page + 1)}
                >
                  Next
                </Button>
              </div>
            ) : null}
          </>
        ) : null}
      </PageContainer>
    </DriverShell>
  );
}
