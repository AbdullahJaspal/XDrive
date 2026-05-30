'use client';

import { Loader2, RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { AdminShell } from '@/components/layout/admin-shell';
import { PageContainer } from '@/components/layout/page-container';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { COMPLAINT_STATUS_LABELS } from '@/lib/admin/labels';
import { getAccessToken } from '@/lib/auth/session-client';
import { apiRequest } from '@/lib/api/client';

interface ComplaintRow {
  id: string;
  reference: string;
  status: string;
  category: string;
  description: string;
  resolution: string | null;
  createdAt: string;
  bookingId: string | null;
}

function statusVariant(status: string): 'warning' | 'success' | 'secondary' {
  if (status === 'OPEN' || status === 'UNDER_INVESTIGATION') return 'warning';
  if (status === 'RESOLVED') return 'success';
  return 'secondary';
}

export default function AdminComplaintsPage() {
  const [complaints, setComplaints] = useState<ComplaintRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [resolution, setResolution] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async (silent = false) => {
    const token = getAccessToken();
    if (!token) return;
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const data = await apiRequest<ComplaintRow[]>('/complaints', { token });
      setComplaints(data);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function handleResolve(id: string) {
    const token = getAccessToken();
    if (!token || !resolution.trim()) return;
    setSubmitting(true);
    void apiRequest(`/complaints/${id}/resolve`, {
      method: 'PATCH',
      token,
      body: JSON.stringify({ resolution: resolution.trim() }),
    })
      .then(() => {
        setResolvingId(null);
        setResolution('');
        void load(true);
      })
      .finally(() => setSubmitting(false));
  }

  const openCount = complaints.filter(
    (c) => c.status === 'OPEN' || c.status === 'UNDER_INVESTIGATION',
  ).length;

  return (
    <AdminShell>
      <PageContainer className="space-y-6 py-8 sm:py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Badge variant="secondary" className="mb-2">
              Complaints
            </Badge>
            <h1 className="text-3xl font-bold">Complaints</h1>
            <p className="mt-1 text-muted-foreground">
              {openCount} open — passenger and operator complaint records
            </p>
          </div>
          <Button variant="outline" onClick={() => void load(true)} disabled={refreshing || loading}>
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {loading ? (
          <p className="text-muted-foreground">Loading complaints…</p>
        ) : complaints.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border px-6 py-12 text-center text-muted-foreground">
            No complaints recorded.
          </p>
        ) : (
          <ul className="space-y-4">
            {complaints.map((c) => (
              <li key={c.id}>
                <Card className="surface-elevated border-0">
                  <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 pb-2">
                    <div>
                      <CardTitle className="font-mono text-base">{c.reference}</CardTitle>
                      <p className="text-sm text-muted-foreground">{c.category}</p>
                    </div>
                    <Badge variant={statusVariant(c.status)}>
                      {COMPLAINT_STATUS_LABELS[c.status] ?? c.status}
                    </Badge>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <p className="leading-relaxed">{c.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(c.createdAt).toLocaleString('en-GB')}
                      {c.bookingId ? ` · Booking linked` : ''}
                    </p>
                    {c.resolution ? (
                      <p className="rounded-lg bg-secondary/50 px-3 py-2 text-muted-foreground">
                        <span className="font-medium text-foreground">Resolution: </span>
                        {c.resolution}
                      </p>
                    ) : null}
                    {c.status !== 'RESOLVED' && c.status !== 'CLOSED' ? (
                      resolvingId === c.id ? (
                        <div className="space-y-3 border-t border-border pt-3">
                          <div className="space-y-2">
                            <Label htmlFor={`resolution-${c.id}`}>Resolution notes</Label>
                            <Textarea
                              id={`resolution-${c.id}`}
                              value={resolution}
                              onChange={(e) => setResolution(e.target.value)}
                              rows={3}
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              disabled={submitting || !resolution.trim()}
                              onClick={() => handleResolve(c.id)}
                            >
                              {submitting ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                'Mark resolved'
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setResolvingId(null);
                                setResolution('');
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => setResolvingId(c.id)}>
                          Resolve complaint
                        </Button>
                      )
                    ) : null}
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </PageContainer>
    </AdminShell>
  );
}
