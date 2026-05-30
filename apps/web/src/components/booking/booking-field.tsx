'use client';

import { cloneElement, isValidElement, type ReactElement, type ReactNode } from 'react';

import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface BookingFieldProps {
  id: string;
  label: ReactNode;
  labelClassName?: string;
  className?: string;
  error?: string;
  hint?: string;
  children: ReactElement<{ id?: string; 'aria-invalid'?: boolean; 'aria-describedby'?: string }>;
}

export function BookingField({
  id,
  label,
  labelClassName,
  className,
  error,
  hint,
  children,
}: BookingFieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  const control = isValidElement(children)
    ? cloneElement(children, {
        id,
        'aria-invalid': error ? true : undefined,
        'aria-describedby': describedBy,
      })
    : children;

  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor={id} className={labelClassName}>
        {label}
      </Label>
      <div
        data-invalid={error ? true : undefined}
        className={cn(
          error &&
            '[&_input]:border-destructive [&_input]:focus-visible:ring-destructive/40 [&_textarea]:border-destructive [&_textarea]:focus-visible:ring-destructive/40',
        )}
      >
        {control}
      </div>
      {hint && !error ? (
        <p id={hintId} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
