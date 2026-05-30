import { CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

import { PageShell } from '@/components/layout/page-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ConfirmationPageProps {
  searchParams: Promise<{ ref?: string }>;
}

export default async function BookingConfirmationPage({ searchParams }: ConfirmationPageProps) {
  const { ref } = await searchParams;

  return (
    <PageShell>
      <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-16 text-center sm:py-24">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircle2 className="h-9 w-9" aria-hidden />
        </div>
        <h1 className="text-3xl font-bold">Booking requested</h1>
        <p className="mt-3 text-muted-foreground">
          Thank you — your operator will confirm your fare and assign a licensed driver shortly.
        </p>

        <Card className="glass-card mt-10 w-full border-0 text-left">
          <CardHeader>
            <CardTitle className="text-lg">Your reference</CardTitle>
            <CardDescription>Keep this for phone enquiries</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="font-mono text-2xl font-bold tracking-wide text-primary">
              {ref ?? '—'}
            </p>
          </CardContent>
        </Card>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Button variant="accent" size="lg" asChild>
            <Link href="/">Book another trip</Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/account">View my trips</Link>
          </Button>
        </div>
      </div>
    </PageShell>
  );
}
