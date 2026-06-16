import Link from 'next/link';

import { PageContainer } from '@/components/layout/page-container';
import { PageShell } from '@/components/layout/page-shell';
import { Button } from '@/components/ui/button';

interface ConfirmationPageProps {
  searchParams: Promise<{ ref?: string }>;
}

export default async function BookingConfirmationPage({ searchParams }: ConfirmationPageProps) {
  const { ref } = await searchParams;

  return (
    <PageShell>
      <PageContainer className="flex min-h-[60vh] flex-col items-center justify-center py-20 text-center sm:py-28">
        <div className="border-luxury/40 mb-8 flex h-14 w-14 items-center justify-center rounded-full border">
          <span className="font-display text-luxury text-2xl">✓</span>
        </div>
        <p className="label-caps text-luxury">Reservation received</p>
        <h1 className="font-display mt-3 text-4xl font-medium">We&apos;ll be in touch shortly</h1>
        <p className="text-muted-foreground mt-4 leading-relaxed">
          Your operator will confirm your fare and assign a licensed driver. A confirmation email
          has been sent with your booking details and receipt link.
        </p>

        {ref ? (
          <div className="border-border bg-card mt-12 w-full border p-8">
            <p className="label-caps">Reference</p>
            <p className="text-foreground mt-2 font-mono text-3xl font-medium tracking-wider">
              {ref}
            </p>
            <p className="text-muted-foreground mt-3 text-xs">Please quote this if you call us</p>
          </div>
        ) : null}

        <div className="mt-12 flex flex-wrap justify-center gap-4">
          <Button variant="accent" size="lg" asChild>
            <Link href="/book">Book another journey</Link>
          </Button>
          <Button variant="luxury" size="lg" asChild>
            <Link href="/account">My trips</Link>
          </Button>
        </div>
      </PageContainer>
    </PageShell>
  );
}
