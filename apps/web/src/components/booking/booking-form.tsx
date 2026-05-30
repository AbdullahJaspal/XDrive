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
import { apiDetailsToFieldErrors, validateFullBooking } from '@/lib/booking/validation';
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
  const [formError, setFormError] = useState<string | null>(null);
  const {
    fieldErrors,
    clearFieldError,
    clearAllFieldErrors,
    applyFieldErrors,
  } = useBookingFieldErrors();

  const [pickupAddress, setPickupAddress] = useState('');
  const [pickupPostcode, setPickupPostcode] = useState('');
  const [dropoffAddress, setDropoffAddress] = useState('');
  const [dropoffPostcode, setDropoffPostcode] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [passengerName, setPassengerName] = useState('');
  const [passengerPhone, setPassengerPhone] = useState('');
  const [passengerEmail, setPassengerEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [accessibility, setAccessibility] = useState<
    CreateBookingInput['accessibilityRequirements']
  >([]);

  function toggleAccessibility(value: CreateBookingInput['accessibilityRequirements'][number]) {
    setAccessibility((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  }

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);

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

    const result = validateFullBooking(formFields);
    if (!result.ok) {
      applyFieldErrors(result.errors);
      const firstInvalid = document.querySelector<HTMLElement>('[data-invalid="true"] input, [data-invalid="true"] textarea');
      firstInvalid?.focus();
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
        onSuccess?.(booking);
        router.push(`/book/confirmation?ref=${encodeURIComponent(booking.reference)}`);
      } catch (err) {
        if (err instanceof ApiClientError && err.details?.length) {
          applyFieldErrors(apiDetailsToFieldErrors(err.details));
          const firstInvalid = document.querySelector<HTMLElement>(
            '[data-invalid="true"] input, [data-invalid="true"] textarea',
          );
          firstInvalid?.focus();
          return;
        }
        setFormError(err instanceof Error ? err.message : 'Could not submit booking');
      } finally {
        setLoading(false);
      }
    })();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <BookingField
          id="pickup-address"
          className="sm:col-span-2"
          label={
            <span className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" aria-hidden />
              Pickup address
            </span>
          }
          error={fieldErrors.pickupAddress}
        >
          <Input
            value={pickupAddress}
            onChange={(e) => {
              setPickupAddress(e.target.value);
              clearFieldError('pickupAddress');
            }}
            placeholder="e.g. 12 High Street"
          />
        </BookingField>
        <BookingField
          id="pickup-postcode"
          label="Pickup postcode"
          error={fieldErrors.pickupPostcode}
          hint="UK postcode, e.g. WV1 1AA"
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
        <BookingField
          id="scheduled-at"
          label={
            <span className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" aria-hidden />
              When (optional)
            </span>
          }
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
          />
        </BookingField>
        <BookingField
          id="dropoff-address"
          className="sm:col-span-2"
          label="Drop-off address"
          error={fieldErrors.dropoffAddress}
        >
          <Input
            value={dropoffAddress}
            onChange={(e) => {
              setDropoffAddress(e.target.value);
              clearFieldError('dropoffAddress');
            }}
            placeholder="e.g. Birmingham Airport"
          />
        </BookingField>
        <BookingField
          id="dropoff-postcode"
          className="sm:col-span-2"
          label="Drop-off postcode"
          error={fieldErrors.dropoffPostcode}
          hint="UK postcode, e.g. B26 3QJ"
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

      <div className="grid gap-4 sm:grid-cols-2">
        <BookingField
          id="passenger-name"
          label={
            <span className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" aria-hidden />
              Your name
            </span>
          }
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
          label={
            <span className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" aria-hidden />
              Mobile number
            </span>
          }
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
        {!compact ? (
          <BookingField
            id="passenger-email"
            className="sm:col-span-2"
            label="Email (optional)"
            error={fieldErrors.passengerEmail}
          >
            <Input
              type="email"
              value={passengerEmail}
              onChange={(e) => {
                setPassengerEmail(e.target.value);
                clearFieldError('passengerEmail');
              }}
              placeholder="for booking updates"
            />
          </BookingField>
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
          <BookingField id="notes" label="Notes for your driver (optional)" error={fieldErrors.notes}>
            <Textarea
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                clearFieldError('notes');
              }}
              placeholder="Flight number, meet point, luggage…"
            />
          </BookingField>
        </>
      ) : null}

      {formError ? (
        <div
          className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          role="alert"
        >
          {formError}
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
