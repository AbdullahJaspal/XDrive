import Link from 'next/link';

import { BookingWizard } from '@/components/booking/booking-wizard';
import { PageShell } from '@/components/layout/page-shell';

interface BookPageProps {
  searchParams: Promise<{ pickup?: string; dropoff?: string }>;
}

export default async function BookPage({ searchParams }: BookPageProps) {
  const { pickup, dropoff } = await searchParams;

  return (
    <PageShell>
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-20">
        <p className="label-caps text-luxury">Reservation</p>
        <h1 className="mt-2 font-display text-4xl font-medium sm:text-5xl">Book your journey</h1>
        <p className="mt-4 text-muted-foreground">
          A few details and we&apos;ll request a licensed vehicle on your behalf.{' '}
          <Link href="/" className="text-foreground underline-offset-4 hover:underline">
            Return home
          </Link>
        </p>

        <div className="surface-elevated mt-10 p-6 sm:p-10">
          <BookingWizard initial={{ pickup, dropoff }} />
        </div>
      </div>
    </PageShell>
  );
}
