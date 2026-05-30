'use client';

import { ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function HeroBookingStrip() {
  const router = useRouter();
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (pickup.trim()) params.set('pickup', pickup.trim());
    if (dropoff.trim()) params.set('dropoff', dropoff.trim());
    const qs = params.toString();
    router.push(qs ? `/book?${qs}` : '/book');
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="animate-hero-in-delay-2 mt-10 flex flex-col gap-3 sm:flex-row sm:items-stretch"
    >
      <div className="flex flex-1 flex-col gap-1 sm:min-w-0">
        <label htmlFor="hero-pickup" className="label-caps text-white/50">
          Pickup
        </label>
        <Input
          id="hero-pickup"
          value={pickup}
          onChange={(e) => {
            setPickup(e.target.value);
          }}
          placeholder="Address or postcode"
          className="h-12 border-white/15 bg-white/10 text-white placeholder:text-white/40 focus-visible:border-luxury/60 focus-visible:ring-luxury/30"
        />
      </div>
      <div className="hidden items-center self-end pb-3 text-white/30 sm:flex" aria-hidden>
        <ArrowRight className="h-5 w-5" />
      </div>
      <div className="flex flex-1 flex-col gap-1 sm:min-w-0">
        <label htmlFor="hero-dropoff" className="label-caps text-white/50">
          Drop-off
        </label>
        <Input
          id="hero-dropoff"
          value={dropoff}
          onChange={(e) => {
            setDropoff(e.target.value);
          }}
          placeholder="Destination"
          className="h-12 border-white/15 bg-white/10 text-white placeholder:text-white/40 focus-visible:border-luxury/60 focus-visible:ring-luxury/30"
        />
      </div>
      <Button
        type="submit"
        variant="accent"
        size="lg"
        className="h-12 shrink-0 sm:self-end sm:px-10"
      >
        Book
        <ArrowRight className="h-4 w-4" />
      </Button>
    </form>
  );
}
