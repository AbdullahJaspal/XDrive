'use client';

import { ArrowLeft, ArrowRight, Check, Loader2, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DEFAULT_COORDS } from '@/lib/booking/defaults';
import { getAccessToken } from '@/lib/auth/session-client';
import { apiRequest } from '@/lib/api/client';
import { cn } from '@/lib/utils';
import type { BookingSummary } from '@uk-phv/shared-types';

const STEPS = ['Journey', 'Schedule', 'Details', 'Confirm'] as const;

const ACCESSIBILITY_OPTIONS = [
  { value: 'WHEELCHAIR_ACCESSIBLE', label: 'Wheelchair accessible' },
  { value: 'ASSISTANCE_DOG', label: 'Assistance dog' },
  { value: 'STEP_FREE', label: 'Step-free access' },
  { value: 'HEARING_LOOP', label: 'Hearing loop' },
] as const;

export interface BookingWizardInitial {
  pickup?: string;
  dropoff?: string;
}

interface BookingWizardProps {
  initial?: BookingWizardInitial;
}

export function BookingWizard({ initial }: BookingWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [pickupAddress, setPickupAddress] = useState(initial?.pickup ?? '');
  const [pickupPostcode, setPickupPostcode] = useState('');
  const [dropoffAddress, setDropoffAddress] = useState(initial?.dropoff ?? '');
  const [dropoffPostcode, setDropoffPostcode] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [passengerName, setPassengerName] = useState('');
  const [passengerPhone, setPassengerPhone] = useState('');
  const [passengerEmail, setPassengerEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [accessibility, setAccessibility] = useState<string[]>([]);

  const progress = ((step + 1) / STEPS.length) * 100;

  const canNext = useMemo(() => {
    if (step === 0) {
      return pickupAddress.trim() && pickupPostcode.trim() && dropoffAddress.trim() && dropoffPostcode.trim();
    }
    if (step === 2) {
      return passengerName.trim() && passengerPhone.trim();
    }
    return true;
  }, [step, pickupAddress, pickupPostcode, dropoffAddress, dropoffPostcode, passengerName, passengerPhone]);

  function toggleAccessibility(value: string) {
    setAccessibility((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  }

  function submit() {
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
        router.push(`/book/confirmation?ref=${encodeURIComponent(booking.reference)}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not submit booking');
      } finally {
        setLoading(false);
      }
    })();
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="mb-3 flex justify-between text-xs uppercase tracking-luxury text-muted-foreground">
          {STEPS.map((label, i) => (
            <span
              key={label}
              className={cn(i <= step ? 'text-luxury' : '', i === step && 'font-medium')}
            >
              {label}
            </span>
          ))}
        </div>
        <div className="h-px w-full bg-border">
          <div
            className="h-px bg-luxury transition-all duration-500"
            style={{ width: `${String(progress)}%` }}
          />
        </div>
      </div>

      {step === 0 ? (
        <div className="space-y-6">
          <div>
            <h2 className="font-display text-3xl font-medium">Where are you travelling?</h2>
            <p className="mt-2 text-muted-foreground">Pickup and destination details</p>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pickup-address" className="label-caps">
                Pickup address
              </Label>
              <Input
                id="pickup-address"
                value={pickupAddress}
                onChange={(e) => {
                  setPickupAddress(e.target.value);
                }}
                placeholder="Street address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pickup-postcode" className="label-caps">
                Pickup postcode
              </Label>
              <Input
                id="pickup-postcode"
                value={pickupPostcode}
                onChange={(e) => {
                  setPickupPostcode(e.target.value);
                }}
                placeholder="WV1 1AA"
                className="uppercase"
              />
            </div>
            <div className="my-6 flex items-center gap-3 text-muted-foreground/50">
              <div className="h-px flex-1 bg-border" />
              <MapPin className="h-4 w-4 text-luxury" />
              <div className="h-px flex-1 bg-border" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dropoff-address" className="label-caps">
                Drop-off address
              </Label>
              <Input
                id="dropoff-address"
                value={dropoffAddress}
                onChange={(e) => {
                  setDropoffAddress(e.target.value);
                }}
                placeholder="Destination"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dropoff-postcode" className="label-caps">
                Drop-off postcode
              </Label>
              <Input
                id="dropoff-postcode"
                value={dropoffPostcode}
                onChange={(e) => {
                  setDropoffPostcode(e.target.value);
                }}
                placeholder="B26 3QJ"
                className="uppercase"
              />
            </div>
          </div>
          <div className="surface-elevated flex aspect-[2/1] items-center justify-center rounded-sm bg-muted/30">
            <p className="text-sm text-muted-foreground">Map preview — coming soon</p>
          </div>
        </div>
      ) : null}

      {step === 1 ? (
        <div className="space-y-6">
          <div>
            <h2 className="font-display text-3xl font-medium">When do you need the car?</h2>
            <p className="mt-2 text-muted-foreground">Leave blank for as soon as possible</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="scheduled-at" className="label-caps">
              Date &amp; time
            </Label>
            <Input
              id="scheduled-at"
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => {
                setScheduledAt(e.target.value);
              }}
              min={new Date().toISOString().slice(0, 16)}
              className="max-w-sm"
            />
          </div>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="space-y-6">
          <div>
            <h2 className="font-display text-3xl font-medium">Your details</h2>
            <p className="mt-2 text-muted-foreground">So we can confirm your reservation</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="passenger-name" className="label-caps">
                Full name
              </Label>
              <Input
                id="passenger-name"
                value={passengerName}
                onChange={(e) => {
                  setPassengerName(e.target.value);
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="passenger-phone" className="label-caps">
                Mobile
              </Label>
              <Input
                id="passenger-phone"
                type="tel"
                value={passengerPhone}
                onChange={(e) => {
                  setPassengerPhone(e.target.value);
                }}
                placeholder="07XXX XXXXXX"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="passenger-email" className="label-caps">
                Email (optional)
              </Label>
              <Input
                id="passenger-email"
                type="email"
                value={passengerEmail}
                onChange={(e) => {
                  setPassengerEmail(e.target.value);
                }}
              />
            </div>
          </div>
          <div className="space-y-3">
            <Label className="label-caps">Accessibility</Label>
            <div className="flex flex-wrap gap-2">
              {ACCESSIBILITY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    toggleAccessibility(opt.value);
                  }}
                  className={cn(
                    'rounded-sm border px-3 py-2 text-xs transition-colors',
                    accessibility.includes(opt.value)
                      ? 'border-luxury bg-luxury/10 text-foreground'
                      : 'border-border text-muted-foreground hover:border-luxury/40',
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes" className="label-caps">
              Notes (optional)
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
              }}
              placeholder="Flight number, meet point, luggage…"
            />
          </div>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="space-y-6">
          <div>
            <h2 className="font-display text-3xl font-medium">Confirm your journey</h2>
            <p className="mt-2 text-muted-foreground">Review before we request your vehicle</p>
          </div>
          <dl className="divide-y divide-border border border-border text-sm">
            <div className="grid gap-1 p-4 sm:grid-cols-3">
              <dt className="label-caps">Pickup</dt>
              <dd className="sm:col-span-2">
                {pickupAddress}, {pickupPostcode.toUpperCase()}
              </dd>
            </div>
            <div className="grid gap-1 p-4 sm:grid-cols-3">
              <dt className="label-caps">Drop-off</dt>
              <dd className="sm:col-span-2">
                {dropoffAddress}, {dropoffPostcode.toUpperCase()}
              </dd>
            </div>
            <div className="grid gap-1 p-4 sm:grid-cols-3">
              <dt className="label-caps">When</dt>
              <dd className="sm:col-span-2">
                {scheduledAt
                  ? new Date(scheduledAt).toLocaleString('en-GB')
                  : 'As soon as possible'}
              </dd>
            </div>
            <div className="grid gap-1 p-4 sm:grid-cols-3">
              <dt className="label-caps">Passenger</dt>
              <dd className="sm:col-span-2">
                {passengerName} · {passengerPhone}
              </dd>
            </div>
          </dl>
        </div>
      ) : null}

      {error ? (
        <div
          className="rounded-sm border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          role="alert"
        >
          {error}
        </div>
      ) : null}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            setStep((s) => Math.max(0, s - 1));
          }}
          disabled={step === 0 || loading}
          className={cn(step === 0 && 'invisible')}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        {step < STEPS.length - 1 ? (
          <Button
            type="button"
            variant="accent"
            size="lg"
            disabled={!canNext}
            onClick={() => {
              setStep((s) => s + 1);
            }}
          >
            Continue
            <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            type="button"
            variant="accent"
            size="lg"
            disabled={loading}
            onClick={submit}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Requesting…
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                Confirm reservation
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
