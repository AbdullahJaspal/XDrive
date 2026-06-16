'use client';

import { BookingField } from '@/components/booking/booking-field';
import { UkAddressAutocomplete } from '@/components/booking/uk-address-autocomplete';
import { Input } from '@/components/ui/input';
import { GOOGLE_MAPS_ENABLED, type UkLocation } from '@/lib/booking/uk-address';

interface UkAddressFieldProps {
  id: string;
  label: React.ReactNode;
  labelClassName?: string;
  className?: string;
  address: string;
  postcode: string;
  lat: number | null;
  lng: number | null;
  addressError?: string;
  postcodeError?: string;
  addressPlaceholder?: string;
  postcodePlaceholder?: string;
  postcodeHint?: string;
  onAddressChange: (value: string) => void;
  onPostcodeChange: (value: string) => void;
  onLocationSelect: (location: UkLocation) => void;
  onClearCoordinates: () => void;
  clearAddressError: () => void;
  clearPostcodeError: () => void;
}

export function UkAddressField({
  id,
  label,
  labelClassName,
  className,
  address,
  postcode,
  lat,
  lng,
  addressError,
  postcodeError,
  addressPlaceholder,
  postcodePlaceholder,
  postcodeHint,
  onAddressChange,
  onPostcodeChange,
  onLocationSelect,
  onClearCoordinates,
  clearAddressError,
  clearPostcodeError,
}: UkAddressFieldProps) {
  const hasCoordinates = lat != null && lng != null;

  if (!GOOGLE_MAPS_ENABLED) {
    return (
      <>
        <BookingField
          id={`${id}-address`}
          label={label}
          labelClassName={labelClassName}
          className={className}
          error={addressError}
        >
          <Input
            value={address}
            onChange={(event) => {
              onAddressChange(event.target.value);
              clearAddressError();
            }}
            placeholder={addressPlaceholder}
          />
        </BookingField>
        <BookingField
          id={`${id}-postcode`}
          label={typeof label === 'string' ? label.replace(/address/i, 'postcode') : 'Postcode'}
          labelClassName={labelClassName}
          className={className}
          error={postcodeError}
          hint={postcodeHint}
        >
          <Input
            value={postcode}
            onChange={(event) => {
              onPostcodeChange(event.target.value);
              clearPostcodeError();
            }}
            placeholder={postcodePlaceholder}
            className="uppercase"
            autoComplete="postal-code"
          />
        </BookingField>
      </>
    );
  }

  return (
    <>
      <BookingField
        id={`${id}-address`}
        label={label}
        labelClassName={labelClassName}
        className={className}
        error={addressError}
        hint="Start typing and choose a UK address from the list"
      >
        <UkAddressAutocomplete
          value={address}
          onChange={(value) => {
            onAddressChange(value);
            onClearCoordinates();
            clearAddressError();
            clearPostcodeError();
          }}
          onPlaceSelect={(location) => {
            onLocationSelect(location);
            clearAddressError();
            clearPostcodeError();
          }}
          placeholder={addressPlaceholder ?? 'Search UK address or postcode'}
        />
      </BookingField>
      <BookingField
        id={`${id}-postcode`}
        label={typeof label === 'string' ? label.replace(/address/i, 'postcode') : 'Postcode'}
        labelClassName={labelClassName}
        className={className}
        error={postcodeError}
        hint={hasCoordinates ? postcodeHint : 'Filled automatically when you select an address'}
      >
        <Input
          value={postcode}
          readOnly
          tabIndex={-1}
          placeholder={hasCoordinates ? undefined : 'Select an address above'}
          className="pointer-events-none uppercase"
          aria-readonly="true"
        />
      </BookingField>
    </>
  );
}
