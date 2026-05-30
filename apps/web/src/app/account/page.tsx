'use client';

import { Calendar, Loader2, MapPin, Plus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { PageShell } from '@/components/layout/page-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { isStaffRole } from '@/lib/auth/roles';
import { clearTokens, fetchProfile, getAccessToken } from '@/lib/auth/session-client';
import { apiRequest } from '@/lib/api/client';
import type { BookingSummary } from '@uk-phv/shared-types';

interface BookingsListResponse {
  items: BookingSummary[];
  total: number;
}

const STATUS_LABELS: Record<string, string> = {
  REQUESTED: 'Requested',
  CONFIRMED: 'Confirmed',
  DISPATCHED: 'Dispatched',
  DRIVER_EN_ROUTE: 'Driver en route',
  ARRIVED: 'Arrived',
  IN_PROGRESS: 'In progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  NO_SHOW: 'No show',
};

export default function AccountPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<BookingSummary[]>([]);
  const [name, setName] = useState('');

  const load = useCallback(async () => {
    const profile = await fetchProfile();
    if (!profile) {
      router.replace('/login');
      return;
    }
    if (isStaffRole(profile.role)) {
      router.replace('/admin/dashboard');
      return;
    }
    setName(`${profile.firstName} ${profile.lastName}`);
    const token = getAccessToken();
    if (!token) return;
    const data = await apiRequest<BookingsListResponse>('/me/bookings?page=1&pageSize=20', {
      token,
    });
    setBookings(data.items);
    setLoading(false);
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <PageShell>
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading your trips…</p>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="label-caps text-luxury">Your account</p>
            <h1 className="font-display text-4xl font-medium">Welcome, {name.split(' ')[0]}</h1>
            <p className="mt-1 text-muted-foreground">Your trips and booking history</p>
          </div>
          <div className="flex gap-2">
            <Button variant="accent" asChild>
              <Link href="/book">
                <Plus className="h-4 w-4" />
                New booking
              </Link>
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                clearTokens();
                router.push('/');
              }}
            >
              Sign out
            </Button>
          </div>
        </div>

        {bookings.length === 0 ? (
          <Card className="surface-elevated border-0 text-center">
            <CardContent className="py-12">
              <MapPin className="mx-auto h-12 w-12 text-muted-foreground/40" />
              <p className="mt-4 font-medium">No trips yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Book your first journey — guest bookings appear here when you&apos;re signed in with
                the same email.
              </p>
              <Button className="mt-6" variant="accent" asChild>
                <Link href="/book">Book a taxi</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <ul className="space-y-4">
            {bookings.map((b) => (
              <li key={b.id}>
                <Card className="surface-elevated border-0">
                  <CardHeader className="pb-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <CardTitle className="font-mono text-base">{b.reference}</CardTitle>
                      <Badge variant="secondary">{STATUS_LABELS[b.status] ?? b.status}</Badge>
                    </div>
                    <CardDescription className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(b.createdAt).toLocaleString('en-GB')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p>
                      <span className="font-medium text-muted-foreground">From: </span>
                      {b.pickup.address}, {b.pickup.postcode}
                    </p>
                    <p>
                      <span className="font-medium text-muted-foreground">To: </span>
                      {b.dropoff.address}, {b.dropoff.postcode}
                    </p>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </div>
    </PageShell>
  );
}
