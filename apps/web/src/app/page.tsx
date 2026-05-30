import {
  Accessibility,
  Clock,
  MapPin,
  Shield,
  Sparkles,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { BookingForm } from '@/components/booking/booking-form';
import { HeroPreview } from '@/components/landing/hero-preview';
import { TrustStrip } from '@/components/landing/trust-strip';
import { PageShell } from '@/components/layout/page-shell';
import { BRAND } from '@/lib/brand';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const benefits = [
  {
    icon: Clock,
    title: 'Book in under a minute',
    description: 'Enter pickup and drop-off, choose when you need the car, and we handle the rest.',
    accent: 'border-l-sky-500',
  },
  {
    icon: Accessibility,
    title: 'Accessibility built in',
    description: 'Wheelchair access, assistance dogs, step-free pickups, and more — just tap your needs.',
    accent: 'border-l-amber-500',
  },
  {
    icon: Shield,
    title: 'Licensed & verified',
    description: 'Every journey is dispatched by a UK licensed PHV operator with compliance checks.',
    accent: 'border-l-emerald-500',
  },
  {
    icon: MapPin,
    title: 'UK-wide journeys',
    description: 'Airport runs, hospital visits, nights out — reliable private hire when you need it.',
    accent: 'border-l-primary',
  },
] as const;

const steps = [
  { step: '1', title: 'Tell us where', body: 'Pickup, drop-off, and when you need to travel.' },
  { step: '2', title: 'We confirm', body: 'Your operator confirms fare and assigns a licensed driver.' },
  { step: '3', title: 'Ride with confidence', body: 'Track status updates and travel with a vetted PHV vehicle.' },
] as const;

export default function HomePage() {
  return (
    <PageShell>
      <section className="relative overflow-hidden text-primary-foreground">
        <div className="absolute inset-0 -z-10">
          <Image
            src="/bg.png"
            alt=""
            fill
            priority
            className="object-cover object-[75%_center] sm:object-center"
            sizes="100vw"
          />
          <div className="hero-overlay absolute inset-0" aria-hidden />
        </div>
        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-2 lg:items-center lg:gap-12">
          <div className="animate-fade-in-up">
            <Badge variant="accent" className="mb-6 border-amber-400/30 bg-amber-400/20 text-amber-100">
              <Sparkles className="mr-1 h-3 w-3" aria-hidden />
              {BRAND.name} — {BRAND.tagline}
            </Badge>
            <h1 className="max-w-xl text-balance text-4xl font-bold sm:text-5xl lg:text-6xl">
              Your taxi, booked in seconds
            </h1>
            <p className="mt-6 max-w-lg text-lg text-primary-foreground/85">
              Licensed private hire for Wolverhampton and beyond. No app download — book online and
              we&apos;ll send a driver to you.
            </p>
            <div className="mt-8 flex flex-wrap gap-3 lg:hidden">
              <Button variant="accent" size="lg" asChild>
                <Link href="#book">Get a taxi now</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="border-white/30 bg-white/10 text-white backdrop-blur hover:bg-white/20"
              >
                <Link href="/book">Full booking form</Link>
              </Button>
            </div>
          </div>
          <HeroPreview />
        </div>
      </section>

      <TrustStrip />

      <section id="book" className="section-muted scroll-mt-20 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">Book your taxi now</h2>
            <p className="mt-3 text-muted-foreground">
              Fill in your journey details below. We&apos;ll confirm your booking and assign a licensed
              driver.
            </p>
          </div>
          <Card className="glass-card mx-auto max-w-2xl border-0 shadow-xl shadow-slate-900/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <MapPin className="h-5 w-5 text-primary" aria-hidden />
                Journey request
              </CardTitle>
              <CardDescription>All fields marked required must be completed</CardDescription>
            </CardHeader>
            <CardContent>
              <BookingForm compact />
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold">Why book with {BRAND.name}?</h2>
            <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
              Simple, accessible, and backed by a regulated private hire operator.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {benefits.map(({ icon: Icon, title, description, accent }, i) => (
              <Card
                key={title}
                className={`glass-card animate-fade-in-up border-0 border-l-4 ${accent} transition-transform hover:-translate-y-0.5`}
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <CardHeader>
                  <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" aria-hidden />
                  </div>
                  <CardTitle className="text-lg">{title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">{description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="section-muted py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="mb-10 text-center text-3xl font-bold">How it works</h2>
          <div className="grid gap-8 md:grid-cols-3">
            {steps.map(({ step, title, body }) => (
              <div key={step} className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                  {step}
                </div>
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="text-2xl font-bold sm:text-3xl">Need help with your booking?</h2>
          <p className="mt-3 text-muted-foreground">
            Create a free account to view trip history, or sign in if you&apos;ve booked with us before.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/login">Create account</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/account">My trips</Link>
            </Button>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
