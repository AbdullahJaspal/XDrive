'use client';

import {
  Accessibility,
  Calendar,
  Loader2,
  MapPin,
  Phone,
  User,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DEFAULT_COORDS } from '@/lib/booking/defaults';
import { getAccessToken } from '@/lib/auth/session-client';
import { apiRequest } from '@/lib/api/client';
import type { BookingSummary } from '@uk-phv/shared-types';

const ACCESSIBILITY_OPTIONS = [
  { value: 'WHEELCHAIR_ACCESSIBLE', label: 'Wheelchair accessible vehicle' },
  { value: 'ASSISTANCE_DOG', label: 'Assistance dog' },
  { value: 'STEP_FREE', label: 'Step-free access' },
  { value: 'HEARING_LOOP', label: 'Hearing loop' },
  { value: 'LARGE_PRINT_RECEIPT', label: 'Large print receipt' },
] as const;

interface BookingFormProps {
  compact?: boolean;
  onSuccess?: (booking: BookingSummary) => void;
}

export function BookingForm({ compact = false, onSuccess }: BookingFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [pickupAddress, setPickupAddress] = useState('');
  const [pickupPostcode, setPickupPostcode] = useState('');
  const [dropoffAddress, setDropoffAddress] = useState('');
  const [dropoffPostcode, setDropoffPostcode] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [passengerName, setPassengerName] = useState('');
  const [passengerPhone, setPassengerPhone] = useState('');
  const [passengerEmail, setPassengerEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [accessibility, setAccessibility] = useState<string[]>([]);

  function toggleAccessibility(value: string) {
    setAccessibility((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  }

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    void (async () => {
      try {
        const token = getAccessToken();
        const booking = await apiRequest<BookingSummary>('/public/bookings', {
          method: 'POST',
          token: token ?? undefined,
          body: JSON.stringify({
            pickup: {
              ...DEFAULT_COORDS,
              address: pickupAddress,
              postcode: pickupPostcode.toUpperCase(),
            },
            dropoff: {
              ...DEFAULT_COORDS,
              address: dropoffAddress,
              postcode: dropoffPostcode.toUpperCase(),
            },
            scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : undefined,
            passengerName,
            passengerPhone,
            passengerEmail: passengerEmail || undefined,
            accessibilityRequirements: accessibility,
            notes: notes || undefined,
            source: 'WEB',
          }),
        });
        onSuccess?.(booking);
        router.push(`/book/confirmation?ref=${encodeURIComponent(booking.reference)}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not submit booking');
      } finally {
        setLoading(false);
      }
    })();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="pickup-address" className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" aria-hidden />
            Pickup address
          </Label>
          <Input
            id="pickup-address"
            required
            value={pickupAddress}
            onChange={(e) => {
              setPickupAddress(e.target.value);
            }}
            placeholder="e.g. 12 High Street"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pickup-postcode">Pickup postcode</Label>
          <Input
            id="pickup-postcode"
            required
            value={pickupPostcode}
            onChange={(e) => {
              setPickupPostcode(e.target.value);
            }}
            placeholder="WV1 1AA"
            className="uppercase"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="scheduled-at" className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" aria-hidden />
            When (optional)
          </Label>
          <Input
            id="scheduled-at"
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => {
              setScheduledAt(e.target.value);
            }}
            min={new Date().toISOString().slice(0, 16)}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="dropoff-address">Drop-off address</Label>
          <Input
            id="dropoff-address"
            required
            value={dropoffAddress}
            onChange={(e) => {
              setDropoffAddress(e.target.value);
            }}
            placeholder="e.g. Birmingham Airport"
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="dropoff-postcode">Drop-off postcode</Label>
          <Input
            id="dropoff-postcode"
            required
            value={dropoffPostcode}
            onChange={(e) => {
              setDropoffPostcode(e.target.value);
            }}
            placeholder="B26 3QJ"
            className="uppercase"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="passenger-name" className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" aria-hidden />
            Your name
          </Label>
          <Input
            id="passenger-name"
            required
            value={passengerName}
            onChange={(e) => {
              setPassengerName(e.target.value);
            }}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="passenger-phone" className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" aria-hidden />
            Mobile number
          </Label>
          <Input
            id="passenger-phone"
            required
            type="tel"
            value={passengerPhone}
            onChange={(e) => {
              setPassengerPhone(e.target.value);
            }}
            placeholder="07XXX XXXXXX"
          />
        </div>
        {!compact ? (
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="passenger-email">Email (optional)</Label>
            <Input
              id="passenger-email"
              type="email"
              value={passengerEmail}
              onChange={(e) => {
                setPassengerEmail(e.target.value);
              }}
              placeholder="for booking updates"
            />
          </div>
        ) : null}
      </div>

      {!compact ? (
        <>
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Accessibility className="h-4 w-4 text-primary" aria-hidden />
              Accessibility
            </Label>
            <div className="flex flex-wrap gap-2">
              {ACCESSIBILITY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    toggleAccessibility(opt.value);
                  }}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                    accessibility.includes(opt.value)
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-background text-muted-foreground hover:border-primary/40'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes for your driver (optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
              }}
              placeholder="Flight number, meet point, luggage…"
            />
          </div>
        </>
      ) : null}

      {error ? (
        <div
          className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          role="alert"
        >
          {error}
        </div>
      ) : null}

      <Button type="submit" variant="accent" size="lg" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Requesting your taxi…
          </>
        ) : (
          'Get a taxi now'
        )}
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        By booking you agree to our terms. Fares are confirmed by your operator before dispatch.
      </p>
    </form>
  );
}
