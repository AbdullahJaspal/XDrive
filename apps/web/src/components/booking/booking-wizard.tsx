'use client';

import { ArrowLeft, ArrowRight, Check, Loader2, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { BookingFareEstimate } from '@/components/booking/booking-fare-estimate';
import { BookingField } from '@/components/booking/booking-field';
import { BookingMapPreview } from '@/components/booking/booking-map-preview';
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
import {
  apiDetailsToFieldErrors,
  type BookingFieldErrors,
  DETAILS_FIELD_KEYS,
  JOURNEY_FIELD_KEYS,
  validateDetailsStep,
  validateFullBooking,
  validateJourneyStep,
} from '@/lib/booking/validation';
import { formatPenceGbp, type FareEstimate } from '@/lib/booking/fare';
import { cn } from '@/lib/utils';
import type { PublicBookingCreated } from '@uk-phv/shared-types';

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
  const { fieldErrors, clearFieldError, clearAllFieldErrors, applyFieldErrors } =
    useBookingFieldErrors();

  const [pickupAddress, setPickupAddress] = useState(initial?.pickup ?? '');
  const [pickupPostcode, setPickupPostcode] = useState('');
  const [pickupLat, setPickupLat] = useState<number | null>(null);
  const [pickupLng, setPickupLng] = useState<number | null>(null);
  const [pickupIsAirport, setPickupIsAirport] = useState(false);
  const [dropoffAddress, setDropoffAddress] = useState(initial?.dropoff ?? '');
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
  const [fareEstimate, setFareEstimate] = useState<FareEstimate | null>(null);

  const progress = ((step + 1) / STEPS.length) * 100;

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
        const booking = await apiRequest<PublicBookingCreated>('/public/bookings', {
          method: 'POST',
          token: token ?? undefined,
          body: JSON.stringify(result.data),
        });
        router.push(`/book/trip/${booking.guestViewToken}`);
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
        <div className="tracking-luxury text-muted-foreground mb-3 flex justify-between text-xs uppercase">
          {STEPS.map((label, i) => (
            <span
              key={label}
              className={cn(i <= step ? 'text-luxury' : '', i === step && 'font-medium')}
            >
              {label}
            </span>
          ))}
        </div>
        <div className="bg-border h-px w-full">
          <div
            className="bg-luxury h-px transition-all duration-500"
            style={{ width: `${String(progress)}%` }}
          />
        </div>
      </div>

      {step === 0 ? (
        <BookingMapsProvider>
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-3xl font-medium">Where are you travelling?</h2>
              <p className="text-muted-foreground mt-2">Pickup and destination details</p>
            </div>
            <div className="space-y-4">
              <UkAddressField
                id="pickup"
                label="Pickup address"
                labelClassName="label-caps"
                address={pickupAddress}
                postcode={pickupPostcode}
                lat={pickupLat}
                lng={pickupLng}
                addressError={fieldErrors.pickupAddress}
                postcodeError={fieldErrors.pickupPostcode}
                addressPlaceholder="Street address or postcode"
                postcodePlaceholder="WV1 1AA"
                postcodeHint="UK postcode format, e.g. WV1 1AA"
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
                  setFareEstimate(null);
                }}
                clearAddressError={() => {
                  clearFieldError('pickupAddress');
                }}
                clearPostcodeError={() => {
                  clearFieldError('pickupPostcode');
                }}
              />
              <div className="text-muted-foreground/50 my-6 flex items-center gap-3">
                <div className="bg-border h-px flex-1" />
                <MapPin className="text-luxury h-4 w-4" />
                <div className="bg-border h-px flex-1" />
              </div>
              <UkAddressField
                id="dropoff"
                label="Drop-off address"
                labelClassName="label-caps"
                address={dropoffAddress}
                postcode={dropoffPostcode}
                lat={dropoffLat}
                lng={dropoffLng}
                addressError={fieldErrors.dropoffAddress}
                postcodeError={fieldErrors.dropoffPostcode}
                addressPlaceholder="Destination or postcode"
                postcodePlaceholder="B26 3QJ"
                postcodeHint="UK postcode format, e.g. B26 3QJ"
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
                  setFareEstimate(null);
                }}
                clearAddressError={() => {
                  clearFieldError('dropoffAddress');
                }}
                clearPostcodeError={() => {
                  clearFieldError('dropoffPostcode');
                }}
              />
            </div>
            <BookingMapPreview
              pickupAddress={pickupAddress}
              pickupPostcode={pickupPostcode}
              pickupLat={pickupLat}
              pickupLng={pickupLng}
              dropoffAddress={dropoffAddress}
              dropoffPostcode={dropoffPostcode}
              dropoffLat={dropoffLat}
              dropoffLng={dropoffLng}
            />
            <BookingFareEstimate
              pickupAddress={pickupAddress}
              pickupIsAirport={pickupIsAirport}
              pickupLat={pickupLat}
              pickupLng={pickupLng}
              dropoffLat={dropoffLat}
              dropoffLng={dropoffLng}
              onFareChange={setFareEstimate}
            />
          </div>
        </BookingMapsProvider>
      ) : null}

      {step === 1 ? (
        <div className="space-y-6">
          <div>
            <h2 className="font-display text-3xl font-medium">When do you need the car?</h2>
            <p className="text-muted-foreground mt-2">Leave blank for as soon as possible</p>
          </div>
          <BookingField
            id="scheduled-at"
            label="Date & time"
            labelClassName="label-caps"
            error={fieldErrors.scheduledAt}
          >
            <DateTimePicker
              value={scheduledAt}
              onChange={(nextValue) => {
                setScheduledAt(nextValue);
                clearFieldError('scheduledAt');
              }}
              min={new Date()}
              className="max-w-sm"
            />
          </BookingField>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="space-y-6">
          <div>
            <h2 className="font-display text-3xl font-medium">Your details</h2>
            <p className="text-muted-foreground mt-2">So we can confirm your reservation</p>
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
              label="Email"
              labelClassName="label-caps"
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
            <p className="text-muted-foreground mt-2">Review before we request your vehicle</p>
          </div>
          <dl className="divide-border border-border divide-y border text-sm">
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
            {fareEstimate ? (
              <div className="grid gap-1 p-4 sm:grid-cols-3">
                <dt className="label-caps">Fare estimate</dt>
                <dd className="font-medium sm:col-span-2">
                  {formatPenceGbp(fareEstimate.totalPence)}
                  {fareEstimate.airportFeePence > 0 ? (
                    <span className="text-muted-foreground block text-xs font-normal">
                      Includes {formatPenceGbp(fareEstimate.airportFeePence)} airport parking fee
                    </span>
                  ) : null}
                </dd>
              </div>
            ) : null}
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
          className="border-destructive/30 bg-destructive/10 text-destructive rounded-sm border px-4 py-3 text-sm"
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
          <Button
            type="button"
            variant="accent"
            size="lg"
            disabled={loading}
            onClick={handleContinue}
          >
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
