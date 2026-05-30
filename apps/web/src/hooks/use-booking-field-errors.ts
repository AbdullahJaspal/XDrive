'use client';

import { useCallback, useState } from 'react';

import type { BookingFieldErrors, BookingFormFieldKey } from '@/lib/booking/validation';

export function useBookingFieldErrors() {
  const [fieldErrors, setFieldErrors] = useState<BookingFieldErrors>({});

  const clearFieldError = useCallback((key: BookingFormFieldKey) => {
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const clearFieldErrors = useCallback((keys: BookingFormFieldKey[]) => {
    setFieldErrors((prev) => {
      const hasAny = keys.some((k) => prev[k]);
      if (!hasAny) return prev;
      const next = { ...prev };
      for (const key of keys) {
        delete next[key];
      }
      return next;
    });
  }, []);

  const clearAllFieldErrors = useCallback(() => {
    setFieldErrors({});
  }, []);

  const applyFieldErrors = useCallback((errors: BookingFieldErrors) => {
    setFieldErrors(errors);
  }, []);

  const mergeFieldErrors = useCallback((errors: BookingFieldErrors) => {
    setFieldErrors((prev) => ({ ...prev, ...errors }));
  }, []);

  return {
    fieldErrors,
    clearFieldError,
    clearFieldErrors,
    clearAllFieldErrors,
    applyFieldErrors,
    mergeFieldErrors,
  };
}
