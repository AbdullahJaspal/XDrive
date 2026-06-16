'use client';

import { useMapsLibrary } from '@vis.gl/react-google-maps';
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

import { Input, type InputProps } from '@/components/ui/input';
import { parseGooglePlace, type UkLocation } from '@/lib/booking/uk-address';

export interface UkAddressAutocompleteProps extends Omit<InputProps, 'onChange' | 'value'> {
  value: string;
  onChange: (value: string) => void;
  onPlaceSelect: (location: UkLocation) => void;
}

export const UkAddressAutocomplete = forwardRef<HTMLInputElement, UkAddressAutocompleteProps>(
  function UkAddressAutocomplete(
    { value, onChange, onPlaceSelect, placeholder = 'Search UK address or postcode', ...props },
    forwardedRef,
  ) {
    const inputRef = useRef<HTMLInputElement>(null);
    const places = useMapsLibrary('places');
    const onChangeRef = useRef(onChange);
    const onPlaceSelectRef = useRef(onPlaceSelect);
    const selectingPlaceRef = useRef(false);

    useImperativeHandle(forwardedRef, () => {
      if (!inputRef.current) {
        throw new Error('Address input is not mounted');
      }
      return inputRef.current;
    });

    useEffect(() => {
      onChangeRef.current = onChange;
      onPlaceSelectRef.current = onPlaceSelect;
    }, [onChange, onPlaceSelect]);

    useEffect(() => {
      if (!places || !inputRef.current) return;

      const autocomplete = new places.Autocomplete(inputRef.current, {
        componentRestrictions: { country: 'gb' },
        fields: ['address_components', 'formatted_address', 'geometry', 'name', 'types'],
      });

      const listener = autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        const location = parseGooglePlace(place);
        if (!location) return;

        selectingPlaceRef.current = true;
        onPlaceSelectRef.current(location);
        queueMicrotask(() => {
          selectingPlaceRef.current = false;
        });
      });

      return () => {
        google.maps.event.removeListener(listener);
      };
    }, [places]);

    return (
      <Input
        ref={inputRef}
        value={value}
        onChange={(event) => {
          if (selectingPlaceRef.current) return;
          onChange(event.target.value);
        }}
        placeholder={placeholder}
        autoComplete="off"
        {...props}
      />
    );
  },
);
