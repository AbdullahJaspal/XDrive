'use client';

import { Plus, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { BookingSummaryCard } from '@/components/admin/booking-summary-card';
import { AdminShell } from '@/components/layout/admin-shell';
import { PageContainer } from '@/components/layout/page-container';
import { AdminDashboardSkeleton } from '@/components/skeletons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getAccessToken } from '@/lib/auth/session-client';
import { apiRequest } from '@/lib/api/client';
import type { BookingSummary, PaginatedData } from '@uk-phv/shared-types';

type DispatchTab = 'queue' | 'active' | 'all';

const TAB_QUERY: Record<DispatchTab, string> = {
  queue: 'statuses=REQUESTED,CONFIRMED',
  active: 'statuses=DISPATCHED,DRIVER_EN_ROUTE,ARRIVED,IN_PROGRESS',
  all: '',
};

const TABS: { id: DispatchTab; label: string }[] = [
  { id: 'queue', label: 'Needs dispatch' },
  { id: 'active', label: 'Active' },
  { id: 'all', label: 'All' },
];

export default function AdminDispatchPage() {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<DispatchTab>('queue');
  const [items, setItems] = useState<BookingSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [q, setQ] = useState('');
  const [assigned, setAssigned] = useState<'all' | 'assigned' | 'unassigned'>(
    (searchParams.get('assigned') as 'assigned' | 'unassigned' | null) ?? 'all',
  );
  const [sortBy, setSortBy] = useState<'createdAt' | 'scheduledAt'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(
    async (currentTab: DispatchTab, silent = false) => {
      const token = getAccessToken();
      if (!token) return;
      if (!silent) setLoading(true);
      else setRefreshing(true);
      try {
        const params = new URLSearchParams(TAB_QUERY[currentTab]);
        params.set('page', String(page));
        params.set('pageSize', String(pageSize));
        params.set('sortBy', sortBy);
        params.set('sortOrder', sortOrder);
        if (q.trim()) params.set('q', q.trim());
        if (assigned !== 'all') params.set('assigned', assigned);
        const data = await apiRequest<PaginatedData<BookingSummary>>(
          `/bookings?${params.toString()}`,
          { token },
        );
        setItems(data.items);
        setTotal(data.total);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [assigned, page, pageSize, q, sortBy, sortOrder],
  );

  useEffect(() => {
    void load(tab);
  }, [tab, load, page, q, assigned, sortBy, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

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
            <p className="text-muted-foreground mt-1">
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
              onClick={() => {
                setTab(id);
                setPage(1);
              }}
            >
              {label}
            </Button>
          ))}
        </div>

        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <Input
            placeholder="Search ref, passenger, phone, postcode"
            value={q}
            onChange={(event) => {
              setQ(event.target.value);
              setPage(1);
            }}
          />
          <select
            className="border-border bg-background h-10 rounded-md border px-3 text-sm"
            value={assigned}
            onChange={(event) => {
              setAssigned(event.target.value as typeof assigned);
              setPage(1);
            }}
          >
            <option value="all">All assignment</option>
            <option value="assigned">Assigned only</option>
            <option value="unassigned">Unassigned only</option>
          </select>
          <select
            className="border-border bg-background h-10 rounded-md border px-3 text-sm"
            value={sortBy}
            onChange={(event) => {
              setSortBy(event.target.value as typeof sortBy);
            }}
          >
            <option value="createdAt">Sort by created</option>
            <option value="scheduledAt">Sort by scheduled</option>
          </select>
          <select
            className="border-border bg-background h-10 rounded-md border px-3 text-sm"
            value={sortOrder}
            onChange={(event) => {
              setSortOrder(event.target.value as typeof sortOrder);
            }}
          >
            <option value="desc">Newest first</option>
            <option value="asc">Oldest first</option>
          </select>
        </div>

        {items.length === 0 ? (
          <p className="border-border text-muted-foreground rounded-xl border border-dashed px-6 py-12 text-center">
            No bookings in this view.
          </p>
        ) : (
          <>
            <ul className="space-y-3">
              {items.map((booking) => (
                <li key={booking.id}>
                  <BookingSummaryCard booking={booking} href={`/admin/dispatch/${booking.id}`} />
                </li>
              ))}
            </ul>
            <div className="border-border flex items-center justify-between rounded-md border px-3 py-2 text-sm">
              <span className="text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => {
                    setPage((current) => Math.max(1, current - 1));
                  }}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => {
                    setPage((current) => Math.min(totalPages, current + 1));
                  }}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </PageContainer>
    </AdminShell>
  );
}
