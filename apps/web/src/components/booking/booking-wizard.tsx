'use client';

import { ArrowLeft, ArrowRight, Check, Loader2, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { BookingField } from '@/components/booking/booking-field';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useBookingFieldErrors } from '@/hooks/use-booking-field-errors';
import { ApiClientError, apiRequest } from '@/lib/api/client';
import { getAccessToken } from '@/lib/auth/session-client';
import type { BookingFormFields } from '@/lib/booking/payload';
import type { CreateBookingInput } from '@uk-phv/validation';
import {
  apiDetailsToFieldErrors,
  type BookingFieldErrors,
  DETAILS_FIELD_KEYS,
  JOURNEY_FIELD_KEYS,
  validateDetailsStep,
  validateFullBooking,
  validateJourneyStep,
} from '@/lib/booking/validation';
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

function stepForFieldErrors(errors: BookingFieldErrors): number {
  if (JOURNEY_FIELD_KEYS.some((key) => errors[key])) return 0;
  if (errors.scheduledAt) return 1;
  if (DETAILS_FIELD_KEYS.some((key) => errors[key])) return 2;
  return 3;
}

export function BookingWizard({ initial }: BookingWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const {
    fieldErrors,
    clearFieldError,
    clearAllFieldErrors,
    applyFieldErrors,
  } = useBookingFieldErrors();

  const [pickupAddress, setPickupAddress] = useState(initial?.pickup ?? '');
  const [pickupPostcode, setPickupPostcode] = useState('');
  const [dropoffAddress, setDropoffAddress] = useState(initial?.dropoff ?? '');
  const [dropoffPostcode, setDropoffPostcode] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [passengerName, setPassengerName] = useState('');
  const [passengerPhone, setPassengerPhone] = useState('');
  const [passengerEmail, setPassengerEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [accessibility, setAccessibility] = useState<
    CreateBookingInput['accessibilityRequirements']
  >([]);

  const progress = ((step + 1) / STEPS.length) * 100;

  const formFields: BookingFormFields = {
    pickupAddress,
    pickupPostcode,
    dropoffAddress,
    dropoffPostcode,
    scheduledAt,
    passengerName,
    passengerPhone,
    passengerEmail,
    notes,
    accessibility,
  };

  function focusFirstInvalidField() {
    requestAnimationFrame(() => {
      const el = document.querySelector<HTMLElement>(
        '[data-invalid="true"] input, [data-invalid="true"] textarea',
      );
      el?.focus();
    });
  }

  function toggleAccessibility(value: CreateBookingInput['accessibilityRequirements'][number]) {
    setAccessibility((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  }

  function handleContinue() {
    setFormError(null);

    if (step === 0) {
      const result = validateJourneyStep(formFields);
      if (!result.ok) {
        applyFieldErrors(result.errors);
        focusFirstInvalidField();
        return;
      }
      clearAllFieldErrors();
    }

    if (step === 2) {
      const result = validateDetailsStep(formFields);
      if (!result.ok) {
        applyFieldErrors(result.errors);
        focusFirstInvalidField();
        return;
      }
      clearAllFieldErrors();
    }

    setStep((s) => s + 1);
  }

  function submit() {
    setFormError(null);
    const result = validateFullBooking(formFields);
    if (!result.ok) {
      applyFieldErrors(result.errors);
      setStep(stepForFieldErrors(result.errors));
      focusFirstInvalidField();
      return;
    }

    clearAllFieldErrors();
    setLoading(true);
    void (async () => {
      try {
        const token = getAccessToken();
        const booking = await apiRequest<BookingSummary>('/public/bookings', {
          method: 'POST',
          token: token ?? undefined,
          body: JSON.stringify(result.data),
        });
        router.push(`/book/confirmation?ref=${encodeURIComponent(booking.reference)}`);
      } catch (err) {
        if (err instanceof ApiClientError && err.details?.length) {
          const errors = apiDetailsToFieldErrors(err.details);
          applyFieldErrors(errors);
          setStep(stepForFieldErrors(errors));
          focusFirstInvalidField();
          return;
        }
        setFormError(err instanceof Error ? err.message : 'Could not submit booking');
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
            <BookingField
              id="pickup-address"
              label="Pickup address"
              labelClassName="label-caps"
              error={fieldErrors.pickupAddress}
            >
              <Input
                value={pickupAddress}
                onChange={(e) => {
                  setPickupAddress(e.target.value);
                  clearFieldError('pickupAddress');
                }}
                placeholder="Street address"
              />
            </BookingField>
            <BookingField
              id="pickup-postcode"
              label="Pickup postcode"
              labelClassName="label-caps"
              error={fieldErrors.pickupPostcode}
              hint="UK postcode format, e.g. WV1 1AA"
            >
              <Input
                value={pickupPostcode}
                onChange={(e) => {
                  setPickupPostcode(e.target.value);
                  clearFieldError('pickupPostcode');
                }}
                placeholder="WV1 1AA"
                className="uppercase"
                autoComplete="postal-code"
              />
            </BookingField>
            <div className="my-6 flex items-center gap-3 text-muted-foreground/50">
              <div className="h-px flex-1 bg-border" />
              <MapPin className="h-4 w-4 text-luxury" />
              <div className="h-px flex-1 bg-border" />
            </div>
            <BookingField
              id="dropoff-address"
              label="Drop-off address"
              labelClassName="label-caps"
              error={fieldErrors.dropoffAddress}
            >
              <Input
                value={dropoffAddress}
                onChange={(e) => {
                  setDropoffAddress(e.target.value);
                  clearFieldError('dropoffAddress');
                }}
                placeholder="Destination"
              />
            </BookingField>
            <BookingField
              id="dropoff-postcode"
              label="Drop-off postcode"
              labelClassName="label-caps"
              error={fieldErrors.dropoffPostcode}
              hint="UK postcode format, e.g. B26 3QJ"
            >
              <Input
                value={dropoffPostcode}
                onChange={(e) => {
                  setDropoffPostcode(e.target.value);
                  clearFieldError('dropoffPostcode');
                }}
                placeholder="B26 3QJ"
                className="uppercase"
                autoComplete="postal-code"
              />
            </BookingField>
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
          <BookingField
            id="scheduled-at"
            label="Date & time"
            labelClassName="label-caps"
            error={fieldErrors.scheduledAt}
          >
            <Input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => {
                setScheduledAt(e.target.value);
                clearFieldError('scheduledAt');
              }}
              min={new Date().toISOString().slice(0, 16)}
              className="max-w-sm"
            />
          </BookingField>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="space-y-6">
          <div>
            <h2 className="font-display text-3xl font-medium">Your details</h2>
            <p className="mt-2 text-muted-foreground">So we can confirm your reservation</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <BookingField
              id="passenger-name"
              label="Full name"
              labelClassName="label-caps"
              className="sm:col-span-2"
              error={fieldErrors.passengerName}
            >
              <Input
                value={passengerName}
                onChange={(e) => {
                  setPassengerName(e.target.value);
                  clearFieldError('passengerName');
                }}
              />
            </BookingField>
            <BookingField
              id="passenger-phone"
              label="Mobile"
              labelClassName="label-caps"
              error={fieldErrors.passengerPhone}
            >
              <Input
                type="tel"
                value={passengerPhone}
                onChange={(e) => {
                  setPassengerPhone(e.target.value);
                  clearFieldError('passengerPhone');
                }}
                placeholder="07XXX XXXXXX"
              />
            </BookingField>
            <BookingField
              id="passenger-email"
              label="Email (optional)"
              labelClassName="label-caps"
              error={fieldErrors.passengerEmail}
            >
              <Input
                type="email"
                value={passengerEmail}
                onChange={(e) => {
                  setPassengerEmail(e.target.value);
                  clearFieldError('passengerEmail');
                }}
              />
            </BookingField>
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
          <BookingField
            id="notes"
            label="Notes (optional)"
            labelClassName="label-caps"
            error={fieldErrors.notes}
          >
            <Textarea
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                clearFieldError('notes');
              }}
              placeholder="Flight number, meet point, luggage…"
            />
          </BookingField>
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

      {formError ? (
        <div
          className="rounded-sm border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          role="alert"
        >
          {formError}
        </div>
      ) : null}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            setFormError(null);
            setStep((s) => Math.max(0, s - 1));
          }}
          disabled={step === 0 || loading}
          className={cn(step === 0 && 'invisible')}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        {step < STEPS.length - 1 ? (
          <Button type="button" variant="accent" size="lg" disabled={loading} onClick={handleContinue}>
            Continue
            <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button type="button" variant="accent" size="lg" disabled={loading} onClick={submit}>
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
