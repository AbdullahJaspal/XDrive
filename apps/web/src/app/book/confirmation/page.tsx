import Link from 'next/link';

import { PageShell } from '@/components/layout/page-shell';
import { Button } from '@/components/ui/button';

interface ConfirmationPageProps {
  searchParams: Promise<{ ref?: string }>;
}

export default async function BookingConfirmationPage({ searchParams }: ConfirmationPageProps) {
  const { ref } = await searchParams;

  return (
    <PageShell>
      <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 py-20 text-center sm:py-28">
        <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-full border border-luxury/40">
          <span className="font-display text-2xl text-luxury">✓</span>
        </div>
        <p className="label-caps text-luxury">Reservation received</p>
        <h1 className="mt-3 font-display text-4xl font-medium">We&apos;ll be in touch shortly</h1>
        <p className="mt-4 text-muted-foreground leading-relaxed">
          Your operator will confirm your fare and assign a licensed driver. You&apos;ll receive updates
          at the number you provided.
        </p>

        {ref ? (
          <div className="mt-12 w-full border border-border bg-card p-8">
            <p className="label-caps">Reference</p>
            <p className="mt-2 font-mono text-3xl font-medium tracking-wider text-foreground">
              {ref}
            </p>
            <p className="mt-3 text-xs text-muted-foreground">Please quote this if you call us</p>
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
      </div>
    </PageShell>
  );
}
