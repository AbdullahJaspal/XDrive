'use client';

import { Accessibility, Calendar, Loader2, MapPin, Phone, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { BookingFareEstimate } from '@/components/booking/booking-fare-estimate';
import { BookingField } from '@/components/booking/booking-field';
import { BookingMapsProvider } from '@/components/booking/booking-maps-provider';
import { UkAddressField } from '@/components/booking/uk-address-field';
import { Button } from '@/components/ui/button';
import { DateTimePicker } from '@/components/ui/datetime-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useBookingFieldErrors } from '@/hooks/use-booking-field-errors';
import { ApiClientError, apiRequest } from '@/lib/api/client';
import { getAccessToken } from '@/lib/auth/session-client';
import type { BookingFormFields } from '@/lib/booking/payload';
import type { CreateBookingInput } from '@uk-phv/validation';
import { apiDetailsToFieldErrors, validateFullBooking } from '@/lib/booking/validation';
import type { PublicBookingCreated } from '@uk-phv/shared-types';

const ACCESSIBILITY_OPTIONS = [
  { value: 'WHEELCHAIR_ACCESSIBLE', label: 'Wheelchair accessible vehicle' },
  { value: 'ASSISTANCE_DOG', label: 'Assistance dog' },
  { value: 'STEP_FREE', label: 'Step-free access' },
  { value: 'HEARING_LOOP', label: 'Hearing loop' },
  { value: 'LARGE_PRINT_RECEIPT', label: 'Large print receipt' },
] as const;

interface BookingFormProps {
  compact?: boolean;
  onSuccess?: (booking: PublicBookingCreated) => void;
}

export function BookingForm({ compact = false, onSuccess }: BookingFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const { fieldErrors, clearFieldError, clearAllFieldErrors, applyFieldErrors } =
    useBookingFieldErrors();

  const [pickupAddress, setPickupAddress] = useState('');
  const [pickupPostcode, setPickupPostcode] = useState('');
  const [pickupLat, setPickupLat] = useState<number | null>(null);
  const [pickupLng, setPickupLng] = useState<number | null>(null);
  const [pickupIsAirport, setPickupIsAirport] = useState(false);
  const [dropoffAddress, setDropoffAddress] = useState('');
  const [dropoffPostcode, setDropoffPostcode] = useState('');
  const [dropoffLat, setDropoffLat] = useState<number | null>(null);
  const [dropoffLng, setDropoffLng] = useState<number | null>(null);
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
      pickupLat,
      pickupLng,
      dropoffAddress,
      dropoffPostcode,
      dropoffLat,
      dropoffLng,
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
      const firstInvalid = document.querySelector<HTMLElement>(
        '[data-invalid="true"] input, [data-invalid="true"] textarea',
      );
      firstInvalid?.focus();
      return;
    }

    clearAllFieldErrors();
    setLoading(true);

    void (async () => {
      try {
        const token = getAccessToken();
        const booking = await apiRequest<PublicBookingCreated>('/public/bookings', {
          method: 'POST',
          token: token ?? undefined,
          body: JSON.stringify(result.data),
        });
        onSuccess?.(booking);
        router.push(`/book/trip/${booking.guestViewToken}`);
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
      <BookingMapsProvider>
        <div className="grid gap-4 sm:grid-cols-2">
          <UkAddressField
            id="pickup"
            className="sm:col-span-2"
            label={
              <span className="flex items-center gap-2">
                <MapPin className="text-primary h-4 w-4" aria-hidden />
                Pickup address
              </span>
            }
            address={pickupAddress}
            postcode={pickupPostcode}
            lat={pickupLat}
            lng={pickupLng}
            addressError={fieldErrors.pickupAddress}
            postcodeError={fieldErrors.pickupPostcode}
            addressPlaceholder="e.g. 12 High Street or WV1 1AA"
            postcodePlaceholder="WV1 1AA"
            postcodeHint="UK postcode, e.g. WV1 1AA"
            onAddressChange={setPickupAddress}
            onPostcodeChange={setPickupPostcode}
            onLocationSelect={(location) => {
              setPickupAddress(location.address);
              setPickupPostcode(location.postcode);
              setPickupLat(location.lat);
              setPickupLng(location.lng);
              setPickupIsAirport(location.isAirport);
            }}
            onClearCoordinates={() => {
              setPickupLat(null);
              setPickupLng(null);
              setPickupPostcode('');
              setPickupIsAirport(false);
            }}
            clearAddressError={() => {
              clearFieldError('pickupAddress');
            }}
            clearPostcodeError={() => {
              clearFieldError('pickupPostcode');
            }}
          />
          <BookingField
            id="scheduled-at"
            label={
              <span className="flex items-center gap-2">
                <Calendar className="text-muted-foreground h-4 w-4" aria-hidden />
                When (optional)
              </span>
            }
            error={fieldErrors.scheduledAt}
          >
            <DateTimePicker
              value={scheduledAt}
              onChange={(nextValue) => {
                setScheduledAt(nextValue);
                clearFieldError('scheduledAt');
              }}
              min={new Date()}
            />
          </BookingField>
          <UkAddressField
            id="dropoff"
            className="sm:col-span-2"
            label="Drop-off address"
            address={dropoffAddress}
            postcode={dropoffPostcode}
            lat={dropoffLat}
            lng={dropoffLng}
            addressError={fieldErrors.dropoffAddress}
            postcodeError={fieldErrors.dropoffPostcode}
            addressPlaceholder="e.g. Birmingham Airport or B26 3QJ"
            postcodePlaceholder="B26 3QJ"
            postcodeHint="UK postcode, e.g. B26 3QJ"
            onAddressChange={setDropoffAddress}
            onPostcodeChange={setDropoffPostcode}
            onLocationSelect={(location) => {
              setDropoffAddress(location.address);
              setDropoffPostcode(location.postcode);
              setDropoffLat(location.lat);
              setDropoffLng(location.lng);
            }}
            onClearCoordinates={() => {
              setDropoffLat(null);
              setDropoffLng(null);
              setDropoffPostcode('');
            }}
            clearAddressError={() => {
              clearFieldError('dropoffAddress');
            }}
            clearPostcodeError={() => {
              clearFieldError('dropoffPostcode');
            }}
          />
        </div>
        <BookingFareEstimate
          className="sm:col-span-2"
          pickupAddress={pickupAddress}
          pickupIsAirport={pickupIsAirport}
          pickupLat={pickupLat}
          pickupLng={pickupLng}
          dropoffLat={dropoffLat}
          dropoffLng={dropoffLng}
        />
      </BookingMapsProvider>

      <div className="grid gap-4 sm:grid-cols-2">
        <BookingField
          id="passenger-name"
          label={
            <span className="flex items-center gap-2">
              <User className="text-muted-foreground h-4 w-4" aria-hidden />
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
              <Phone className="text-muted-foreground h-4 w-4" aria-hidden />
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
        <BookingField
          id="passenger-email"
          className={compact ? undefined : 'sm:col-span-2'}
          label="Email"
          error={fieldErrors.passengerEmail}
        >
          <Input
            type="email"
            required
            autoComplete="email"
            value={passengerEmail}
            onChange={(e) => {
              setPassengerEmail(e.target.value);
              clearFieldError('passengerEmail');
            }}
            placeholder="for confirmation and updates"
          />
        </BookingField>
      </div>

      {!compact ? (
        <>
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Accessibility className="text-primary h-4 w-4" aria-hidden />
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
          <BookingField
            id="notes"
            label="Notes for your driver (optional)"
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
        </>
      ) : null}

      {formError ? (
        <div
          className="border-destructive/30 bg-destructive/10 text-destructive rounded-lg border px-3 py-2 text-sm"
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
      <p className="text-muted-foreground text-center text-xs">
        By booking you agree to our terms. Fares are confirmed by your operator before dispatch.
      </p>
    </form>
  );
}
