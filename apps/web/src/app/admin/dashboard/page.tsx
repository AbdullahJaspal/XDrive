'use client';

import {
  AlertTriangle,
  Car,
  ClipboardList,
  Loader2,
  Radio,
  RefreshCw,
  UserCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

import { StatCard } from '@/components/dashboard/stat-card';
import { AdminShell } from '@/components/layout/admin-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { clearTokens, getAccessToken } from '@/lib/auth/session-client';
import { apiRequest } from '@/lib/api/client';
import { isPusherEnabled, subscribeOperatorChannel } from '@/lib/realtime/pusher-client';

interface DashboardStats {
  activeBookings: number;
  activeDrivers: number;
  expiringLicences: number;
  openComplaints: number;
  generatedAt: string;
}

const POLL_MS = 30_000;

const quickActions = [
  { href: '#', label: 'Dispatch board', description: 'Coming soon' },
  { href: '#', label: 'Fleet', description: 'Drivers & vehicles' },
  { href: '#', label: 'Compliance', description: 'Licences & documents' },
] as const;

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastEvent, setLastEvent] = useState<string | null>(null);
  const [live, setLive] = useState(false);

  const loadStats = useCallback(async (silent = false) => {
    const token = getAccessToken();
    if (!token) {
      setError('Sign in required to view the operator dashboard.');
      setLoading(false);
      return;
    }

    if (!silent) setRefreshing(true);

    try {
      const data = await apiRequest<DashboardStats>('/admin/dashboard', { token });
      setStats(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadStats();

    const token = getAccessToken();
    if (!token) return;

    let unsubscribePusher: (() => void) | undefined;
    setLive(isPusherEnabled());

    void apiRequest<{ operatorId: string | null }>('/users/me', { token }).then((profile) => {
      if (!profile.operatorId || !isPusherEnabled()) return;
      unsubscribePusher = subscribeOperatorChannel(profile.operatorId, token, (event) => {
        setLastEvent(event);
        void loadStats(true);
      });
    });

    const interval = setInterval(() => {
      void loadStats(true);
    }, POLL_MS);

    return () => {
      unsubscribePusher?.();
      clearInterval(interval);
    };
  }, [loadStats]);

  if (loading) {
    return (
      <AdminShell>
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading operator dashboard…</p>
        </div>
      </AdminShell>
    );
  }

  if (error) {
    return (
      <AdminShell>
        <div className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center gap-6 px-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle className="h-7 w-7" />
          </div>
          <p className="text-destructive" role="alert">
            {error}
          </p>
          <Button asChild size="lg">
            <Link href="/staff/login">Operator sign in</Link>
          </Button>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6 sm:py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Badge variant="secondary">Operator dashboard</Badge>
              {live ? (
                <Badge variant="success" className="gap-1">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  </span>
                  Live
                </Badge>
              ) : (
                <Badge variant="outline">Polling every 30s</Badge>
              )}
            </div>
            <h1 className="text-3xl font-bold sm:text-4xl">Operations overview</h1>
            <p className="mt-1 text-muted-foreground">
              Last updated {stats ? new Date(stats.generatedAt).toLocaleString('en-GB') : '—'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => {
                void loadStats();
              }}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                clearTokens();
                window.location.href = '/staff/login';
              }}
            >
              Sign out
            </Button>
          </div>
        </div>

        {lastEvent ? (
          <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-800">
            <Radio className="h-4 w-4 shrink-0" />
            <span>
              Realtime event: <span className="font-mono font-medium">{lastEvent}</span>
            </span>
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Active bookings"
            value={stats?.activeBookings ?? 0}
            icon={ClipboardList}
            variant="info"
            trend="Dispatched & in progress"
          />
          <StatCard
            label="Active drivers"
            value={stats?.activeDrivers ?? 0}
            icon={UserCircle}
            variant="success"
            trend="Available for dispatch"
          />
          <StatCard
            label="Licences expiring"
            value={stats?.expiringLicences ?? 0}
            icon={AlertTriangle}
            variant="warning"
            trend="Review compliance docs"
          />
          <StatCard
            label="Open complaints"
            value={stats?.openComplaints ?? 0}
            icon={Car}
            variant="default"
            trend="Requires attention"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="surface-elevated border-0 lg:col-span-2">
            <CardHeader>
              <CardTitle>Quick actions</CardTitle>
              <CardDescription>Common operator workflows</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-3">
              {quickActions.map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                  className="group rounded-xl border border-border/80 bg-secondary/30 p-4 transition-colors hover:border-primary/30 hover:bg-primary/5"
                >
                  <p className="font-medium group-hover:text-primary">{action.label}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{action.description}</p>
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card className="surface-elevated border-0">
            <CardHeader>
              <CardTitle className="text-lg">Compliance reminder</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-relaxed text-muted-foreground">
              Dispatch is blocked when driver or vehicle PHV licences are missing or expired. Keep
              compliance documents up to date in the fleet module.
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminShell>
  );
}
