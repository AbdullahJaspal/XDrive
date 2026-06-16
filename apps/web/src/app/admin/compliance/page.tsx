'use client';

import { RefreshCw, Shield } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { AdminShell } from '@/components/layout/admin-shell';
import { PageContainer } from '@/components/layout/page-container';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { LICENCE_STATUS_LABELS } from '@/lib/admin/labels';
import { getAccessToken } from '@/lib/auth/session-client';
import { apiRequest } from '@/lib/api/client';

type ComplianceFilter = 'all' | 'attention';

interface ComplianceDoc {
  id: string;
  licenceType: string;
  licenceNumber: string;
  issuingAuthority: string;
  expiryDate: string;
  status: string;
  driver: {
    user: { firstName: string; lastName: string; email: string };
  } | null;
  vehicle: { registration: string; make: string; model: string } | null;
}

function statusVariant(status: string): 'success' | 'warning' | 'outline' {
  if (status === 'VALID') return 'success';
  if (status === 'EXPIRING_SOON') return 'warning';
  return 'outline';
}

export default function AdminCompliancePage() {
  const searchParams = useSearchParams();
  const [filter, setFilter] = useState<ComplianceFilter>('attention');
  const [docs, setDocs] = useState<ComplianceDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [q, setQ] = useState('');
  const [sortBy, setSortBy] = useState<'expiryDate' | 'status'>('expiryDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const load = useCallback(
    async (current: ComplianceFilter, silent = false) => {
      const token = getAccessToken();
      if (!token) return;
      if (!silent) setLoading(true);
      else setRefreshing(true);
      try {
        const query = new URLSearchParams();
        const statusFromQuery = searchParams.get('status');
        if (statusFromQuery) {
          query.set('status', statusFromQuery);
        } else if (current === 'attention') {
          query.set('status', 'EXPIRING_SOON,EXPIRED,PENDING_REVIEW');
        }
        if (q.trim()) query.set('q', q.trim());
        query.set('sortBy', sortBy);
        query.set('sortOrder', sortOrder);
        const data = await apiRequest<ComplianceDoc[]>(
          `/compliance/documents?${query.toString()}`,
          { token },
        );
        setDocs(data);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [q, searchParams, sortBy, sortOrder],
  );

  useEffect(() => {
    void load(filter);
  }, [filter, load, q, sortBy, sortOrder]);

  const grouped = {
    expired: docs.filter((doc) => doc.status === 'EXPIRED'),
    expiring: docs.filter((doc) => doc.status === 'EXPIRING_SOON'),
    pending: docs.filter((doc) => doc.status === 'PENDING_REVIEW'),
    valid: docs.filter((doc) => doc.status === 'VALID'),
  };

  return (
    <AdminShell>
      <PageContainer className="space-y-6 py-8 sm:py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Badge variant="secondary" className="mb-2">
              Compliance
            </Badge>
            <h1 className="text-3xl font-bold">Licences & documents</h1>
            <p className="text-muted-foreground mt-1">
              PHV driver and vehicle licences — dispatch is blocked when expired
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => void load(filter, true)}
            disabled={refreshing || loading}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <div className="flex gap-2">
          <Button
            variant={filter === 'attention' ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setFilter('attention');
            }}
          >
            Needs attention
          </Button>
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setFilter('all');
            }}
          >
            All documents
          </Button>
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          <Input
            placeholder="Search licence, authority, email, registration"
            value={q}
            onChange={(event) => {
              setQ(event.target.value);
            }}
          />
          <select
            className="border-border bg-background h-10 rounded-md border px-3 text-sm"
            value={sortBy}
            onChange={(event) => {
              setSortBy(event.target.value as typeof sortBy);
            }}
          >
            <option value="expiryDate">Sort by expiry</option>
            <option value="status">Sort by status</option>
          </select>
          <select
            className="border-border bg-background h-10 rounded-md border px-3 text-sm"
            value={sortOrder}
            onChange={(event) => {
              setSortOrder(event.target.value as typeof sortOrder);
            }}
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>

        {loading ? (
          <p className="text-muted-foreground">Loading documents…</p>
        ) : docs.length === 0 ? (
          <div className="border-border flex flex-col items-center gap-3 rounded-xl border border-dashed px-6 py-12 text-center">
            <Shield className="text-muted-foreground h-10 w-10" />
            <p className="text-muted-foreground">
              {filter === 'attention'
                ? 'No licences need attention right now.'
                : 'No compliance documents on file.'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {(['expired', 'expiring', 'pending', 'valid'] as const).map((section) => {
              const sectionItems = grouped[section];
              if (sectionItems.length === 0) return null;
              return (
                <section key={section} className="space-y-3">
                  <h2 className="text-muted-foreground text-sm font-semibold uppercase tracking-wide">
                    {section} ({sectionItems.length})
                  </h2>
                  <ul className="space-y-3">
                    {sectionItems.map((doc) => (
                      <li key={doc.id}>
                        <Card className="surface-elevated border-0">
                          <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <p className="font-medium">
                                {doc.licenceType === 'PHV_DRIVER' ? 'Driver PHV' : 'Vehicle PHV'} —{' '}
                                {doc.licenceNumber}
                              </p>
                              <p className="text-muted-foreground text-sm">
                                {doc.issuingAuthority}
                              </p>
                              {doc.driver ? (
                                <p className="mt-1 text-sm">
                                  {doc.driver.user.firstName} {doc.driver.user.lastName} (
                                  {doc.driver.user.email})
                                </p>
                              ) : null}
                              {doc.vehicle ? (
                                <p className="mt-1 text-sm">
                                  {doc.vehicle.registration} — {doc.vehicle.make}{' '}
                                  {doc.vehicle.model}
                                </p>
                              ) : null}
                              <p className="text-muted-foreground mt-1 text-xs">
                                Expires {new Date(doc.expiryDate).toLocaleDateString('en-GB')}
                              </p>
                              <div className="mt-2 flex flex-wrap gap-2">
                                <Button asChild size="sm" variant="outline">
                                  <Link href="/admin/fleet">Open fleet</Link>
                                </Button>
                                <Button asChild size="sm" variant="outline">
                                  <Link href="/admin/dispatch">Open dispatch</Link>
                                </Button>
                              </div>
                            </div>
                            <Badge variant={statusVariant(doc.status)}>
                              {LICENCE_STATUS_LABELS[doc.status] ?? doc.status}
                            </Badge>
                          </CardContent>
                        </Card>
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })}
          </div>
        )}
      </PageContainer>
    </AdminShell>
  );
}
