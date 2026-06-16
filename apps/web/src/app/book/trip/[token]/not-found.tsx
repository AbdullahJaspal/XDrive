import Link from 'next/link';

import { PageContainer } from '@/components/layout/page-container';
import { PageShell } from '@/components/layout/page-shell';
import { Button } from '@/components/ui/button';

export default function TripNotFoundPage() {
  return (
    <PageShell>
      <PageContainer className="flex min-h-[50vh] flex-col items-center justify-center py-20 text-center">
        <p className="label-caps text-luxury">Booking not found</p>
        <h1 className="font-display mt-3 text-3xl font-medium">This link is invalid or expired</h1>
        <p className="text-muted-foreground mt-4 max-w-md leading-relaxed">
          Please use the link from your confirmation email, or contact us with your booking
          reference.
        </p>
        <Button variant="accent" size="lg" className="mt-8" asChild>
          <Link href="/book">Make a new booking</Link>
        </Button>
      </PageContainer>
    </PageShell>
  );
}
