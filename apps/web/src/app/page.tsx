import { Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { HeroBookingStrip } from '@/components/landing/hero-booking-strip';
import { PageShell } from '@/components/layout/page-shell';
import { Button } from '@/components/ui/button';

const proof = [
  { value: '4.9', label: 'Average rating' },
  { value: '2,400+', label: 'Journeys completed' },
  { value: 'Licensed', label: 'PHV operator' },
] as const;

const timeline = [
  {
    title: 'Reserve',
    body: 'Share pickup, destination, and timing — online, without an app.',
  },
  {
    title: 'Confirm',
    body: 'Your operator confirms fare and assigns a licensed, vetted driver.',
  },
  {
    title: 'Arrive composed',
    body: 'Executive saloons, MPVs, and accessible vehicles when you need them.',
  },
] as const;

export default function HomePage() {
  return (
    <PageShell heroHeader>
      <section className="relative min-h-[92vh] overflow-hidden text-primary-foreground">
        <div className="absolute inset-0 -z-10">
          <Image
            src="/bg.png"
            alt=""
            fill
            priority
            className="hero-image object-cover object-[75%_center] sm:object-center"
            sizes="100vw"
          />
          <div className="hero-overlay absolute inset-0" aria-hidden />
        </div>

        <div className="relative mx-auto flex min-h-[calc(92vh-5rem)] max-w-6xl flex-col justify-center px-4 py-24 sm:px-6">
          <p className="label-caps animate-hero-in text-luxury">Private hire · West Midlands</p>
          <h1 className="animate-hero-in mt-4 max-w-3xl text-balance text-5xl font-medium leading-[1.08] sm:text-6xl lg:text-7xl">
            Your journey,
            <br />
            <span className="text-luxury">handled.</span>
          </h1>
          <p className="animate-hero-in-delay mt-6 max-w-lg text-lg leading-relaxed text-white/70">
            Licensed chauffeur-standard private hire. Punctual, discreet, and held to council
            compliance — from airport transfers to everyday travel.
          </p>

          <HeroBookingStrip />

          <div className="animate-hero-in-delay-2 mt-12 flex flex-wrap items-center gap-8 border-t border-white/10 pt-8">
            {proof.map(({ value, label }) => (
              <div key={label}>
                <p className="flex items-center gap-1.5 font-display text-2xl font-medium text-luxury">
                  {label === 'Average rating' ? (
                    <Star className="h-5 w-5 fill-luxury text-luxury" aria-hidden />
                  ) : null}
                  {value}
                </p>
                <p className="label-caps mt-1 text-white/45">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-card py-20 sm:py-28">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="label-caps text-luxury">The experience</p>
            <h2 className="mt-3 text-4xl font-medium sm:text-5xl">
              More than a ride — a standard of service
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              Every vehicle is dispatched by a UK licensed operator. Drivers are checked, journeys
              are recorded, and accessibility needs are honoured without compromise.
            </p>
            <ul className="mt-8 space-y-3 text-muted-foreground">
              <li className="flex gap-3">
                <span className="mt-1.5 h-px w-6 shrink-0 bg-luxury" aria-hidden />
                Executive saloons &amp; MPVs
              </li>
              <li className="flex gap-3">
                <span className="mt-1.5 h-px w-6 shrink-0 bg-luxury" aria-hidden />
                Wheelchair accessible &amp; step-free options
              </li>
              <li className="flex gap-3">
                <span className="mt-1.5 h-px w-6 shrink-0 bg-luxury" aria-hidden />
                Airport, hospital &amp; corporate travel
              </li>
            </ul>
          </div>
          <blockquote className="surface-elevated border-l-2 border-l-luxury p-8 sm:p-10">
            <p className="font-display text-2xl font-medium leading-snug text-foreground sm:text-3xl">
              &ldquo;On time for my flight, immaculate Mercedes, and the driver knew exactly where to
              meet me.&rdquo;
            </p>
            <footer className="mt-6">
              <p className="text-sm font-medium">Sarah M.</p>
              <p className="label-caps mt-1">Birmingham Airport transfer</p>
            </footer>
          </blockquote>
        </div>
      </section>

      <section className="bg-background py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-14 max-w-xl">
            <p className="label-caps text-luxury">How it works</p>
            <h2 className="mt-3 text-4xl font-medium">Three steps to your car</h2>
          </div>
          <div className="grid gap-px bg-border md:grid-cols-3">
            {timeline.map(({ title, body }, i) => (
              <div key={title} className="bg-card p-8 sm:p-10">
                <span className="font-display text-5xl font-light text-luxury/40">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-4 text-xl font-medium">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Button variant="luxury" size="lg" asChild>
              <Link href="/book">Begin your reservation</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-primary py-16 text-primary-foreground sm:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="font-display text-3xl font-medium sm:text-4xl">Returning guest?</h2>
          <p className="mt-4 text-primary-foreground/60">
            Sign in to view trip history and book faster next time.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button variant="accent" size="lg" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
            <Button
              variant="luxury"
              size="lg"
              asChild
              className="border-white/30 text-white hover:bg-white hover:text-primary"
            >
              <Link href="/account">My trips</Link>
            </Button>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
