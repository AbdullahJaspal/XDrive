'use client';

import { Plus, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

import { BookingSummaryCard } from '@/components/admin/booking-summary-card';
import { AdminShell } from '@/components/layout/admin-shell';
import { PageContainer } from '@/components/layout/page-container';
import { AdminDashboardSkeleton } from '@/components/skeletons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getAccessToken } from '@/lib/auth/session-client';
import { apiRequest } from '@/lib/api/client';
import type { BookingSummary, PaginatedData } from '@uk-phv/shared-types';

type DispatchTab = 'queue' | 'active' | 'all';

const TAB_QUERY: Record<DispatchTab, string> = {
  queue: 'statuses=REQUESTED,CONFIRMED&pageSize=50',
  active: 'statuses=DISPATCHED,DRIVER_EN_ROUTE,ARRIVED,IN_PROGRESS&pageSize=50',
  all: 'pageSize=50',
};

const TABS: { id: DispatchTab; label: string }[] = [
  { id: 'queue', label: 'Needs dispatch' },
  { id: 'active', label: 'Active' },
  { id: 'all', label: 'All' },
];

export default function AdminDispatchPage() {
  const [tab, setTab] = useState<DispatchTab>('queue');
  const [items, setItems] = useState<BookingSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (currentTab: DispatchTab, silent = false) => {
    const token = getAccessToken();
    if (!token) return;
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const data = await apiRequest<PaginatedData<BookingSummary>>(
        `/bookings?${TAB_QUERY[currentTab]}`,
        { token },
      );
      setItems(data.items);
      setTotal(data.total);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load(tab);
  }, [tab, load]);

  if (loading && items.length === 0) {
    return (
      <AdminShell>
        <AdminDashboardSkeleton />
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <PageContainer className="space-y-6 py-8 sm:py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Badge variant="secondary" className="mb-2">
              Dispatch
            </Badge>
            <h1 className="text-3xl font-bold">Dispatch board</h1>
            <p className="mt-1 text-muted-foreground">
              {total} booking{total === 1 ? '' : 's'} — assign licensed drivers to new jobs
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => void load(tab, true)} disabled={refreshing}>
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button asChild>
              <Link href="/admin/dispatch/new">
                <Plus className="h-4 w-4" />
                Phone booking
              </Link>
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {TABS.map(({ id, label }) => (
            <Button
              key={id}
              variant={tab === id ? 'default' : 'outline'}
              size="sm"
              onClick={() => { setTab(id); }}
            >
              {label}
            </Button>
          ))}
        </div>

        {items.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border px-6 py-12 text-center text-muted-foreground">
            No bookings in this view.
          </p>
        ) : (
          <ul className="space-y-3">
            {items.map((booking) => (
              <li key={booking.id}>
                <BookingSummaryCard booking={booking} href={`/admin/dispatch/${booking.id}`} />
              </li>
            ))}
          </ul>
        )}
      </PageContainer>
    </AdminShell>
  );
}
