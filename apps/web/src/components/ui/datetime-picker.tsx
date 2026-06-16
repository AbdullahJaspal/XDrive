'use client';

import { isBefore, startOfDay } from 'date-fns';
import { CalendarIcon, Clock } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  formatDatetimeDisplay,
  isSameCalendarDay,
  MINUTE_OPTIONS,
  parseDatetimeLocalValue,
  roundUpToNextMinutes,
  toDatetimeLocalValue,
} from '@/lib/datetime';
import { cn } from '@/lib/utils';

const selectClassName =
  'flex h-10 w-full rounded-sm border border-input bg-card px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-luxury/50 focus-visible:border-luxury/40 disabled:cursor-not-allowed disabled:opacity-50';

export interface DateTimePickerProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  min?: Date;
  className?: string;
  placeholder?: string;
  'aria-invalid'?: boolean;
  'aria-describedby'?: string;
}

function defaultTimeForDate(date: Date, min: Date): { hours: number; minutes: number } {
  const roundedMin = roundUpToNextMinutes(min, 5);

  if (isSameCalendarDay(date, min)) {
    return { hours: roundedMin.getHours(), minutes: roundedMin.getMinutes() };
  }

  return { hours: 9, minutes: 0 };
}

function buildDateTime(date: Date, hours: number, minutes: number): Date {
  const next = new Date(date);
  next.setHours(hours, minutes, 0, 0);
  return next;
}

export function DateTimePicker({
  id,
  value,
  onChange,
  min = new Date(),
  className,
  placeholder = 'Select date and time',
  'aria-invalid': ariaInvalid,
  'aria-describedby': ariaDescribedBy,
}: DateTimePickerProps) {
  const [open, setOpen] = useState(false);
  const selectedDate = parseDatetimeLocalValue(value);
  const minDay = startOfDay(min);

  const [draftDate, setDraftDate] = useState<Date | undefined>(selectedDate);
  const [draftHours, setDraftHours] = useState(9);
  const [draftMinutes, setDraftMinutes] = useState(0);

  useEffect(() => {
    if (!open) return;

    const baseDate = selectedDate ?? min;
    const { hours, minutes } = selectedDate
      ? { hours: selectedDate.getHours(), minutes: selectedDate.getMinutes() }
      : defaultTimeForDate(baseDate, min);

    setDraftDate(selectedDate ?? baseDate);
    setDraftHours(hours);
    setDraftMinutes(minutes);
  }, [open, selectedDate, min]);

  const draftDateTime = useMemo(() => {
    if (!draftDate) return undefined;
    return buildDateTime(draftDate, draftHours, draftMinutes);
  }, [draftDate, draftHours, draftMinutes]);

  const isDraftInvalid = draftDateTime ? isBefore(draftDateTime, min) : false;

  function applySelection() {
    if (!draftDate || !draftDateTime || isBefore(draftDateTime, min)) return;
    onChange(toDatetimeLocalValue(draftDateTime));
    setOpen(false);
  }

  function handleClear() {
    onChange('');
    setOpen(false);
  }

  function handleToday() {
    const today = new Date();
    const { hours, minutes } = defaultTimeForDate(today, min);
    setDraftDate(today);
    setDraftHours(hours);
    setDraftMinutes(minutes);
  }

  const hourOptions = useMemo(() => {
    return Array.from({ length: 24 }, (_, hour) => {
      if (!draftDate || !isSameCalendarDay(draftDate, min)) return hour;
      const minHour = min.getHours();
      return hour < minHour ? null : hour;
    }).filter((hour): hour is number => hour !== null);
  }, [draftDate, min]);

  const minuteOptions = useMemo(() => {
    return MINUTE_OPTIONS.filter((minute) => {
      if (!draftDate || !isSameCalendarDay(draftDate, min)) return true;
      if (draftHours > min.getHours()) return true;
      if (draftHours < min.getHours()) return false;
      return minute >= roundUpToNextMinutes(min, 5).getMinutes();
    });
  }, [draftDate, draftHours, min]);

  useEffect(() => {
    if (!minuteOptions.includes(draftMinutes)) {
      setDraftMinutes(minuteOptions[0] ?? 0);
    }
  }, [minuteOptions, draftMinutes]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          id={id}
          type="button"
          aria-invalid={ariaInvalid}
          aria-describedby={ariaDescribedBy}
          className={cn(
            'border-input bg-card focus-visible:ring-luxury/50 focus-visible:border-luxury/40 flex h-12 w-full items-center justify-between rounded-sm border px-4 py-2 text-left text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50',
            !value && 'text-muted-foreground/70',
            ariaInvalid && 'border-destructive focus-visible:ring-destructive/40',
            className,
          )}
        >
          <span className="flex items-center gap-2 truncate">
            <CalendarIcon className="text-luxury h-4 w-4 shrink-0" aria-hidden />
            {value ? formatDatetimeDisplay(value) : placeholder}
          </span>
          <Clock className="text-muted-foreground h-4 w-4 shrink-0" aria-hidden />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex flex-col sm:flex-row">
          <Calendar
            mode="single"
            selected={draftDate}
            onSelect={(date) => {
              if (!date) return;
              setDraftDate(date);
              if (!selectedDate || !isSameCalendarDay(date, selectedDate)) {
                const { hours, minutes } = defaultTimeForDate(date, min);
                setDraftHours(hours);
                setDraftMinutes(minutes);
              }
            }}
            disabled={(date) => isBefore(startOfDay(date), minDay)}
            defaultMonth={draftDate ?? min}
          />
          <div className="border-border flex flex-col gap-4 border-t p-4 sm:w-44 sm:border-l sm:border-t-0">
            <div>
              <p className="label-caps mb-2">Time</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label
                    htmlFor={`${id ?? 'datetime'}-hour`}
                    className="text-muted-foreground text-xs"
                  >
                    Hour
                  </label>
                  <select
                    id={`${id ?? 'datetime'}-hour`}
                    className={selectClassName}
                    value={draftHours}
                    onChange={(event) => {
                      setDraftHours(Number(event.target.value));
                    }}
                  >
                    {hourOptions.map((hour) => (
                      <option key={hour} value={hour}>
                        {String(hour).padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label
                    htmlFor={`${id ?? 'datetime'}-minute`}
                    className="text-muted-foreground text-xs"
                  >
                    Min
                  </label>
                  <select
                    id={`${id ?? 'datetime'}-minute`}
                    className={selectClassName}
                    value={draftMinutes}
                    onChange={(event) => {
                      setDraftMinutes(Number(event.target.value));
                    }}
                  >
                    {minuteOptions.map((minute) => (
                      <option key={minute} value={minute}>
                        {String(minute).padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="mt-auto flex flex-col gap-2">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="flex-1"
                  onClick={handleClear}
                >
                  Clear
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="flex-1"
                  onClick={handleToday}
                >
                  Today
                </Button>
              </div>
              <Button
                type="button"
                variant="accent"
                size="sm"
                className="w-full"
                disabled={!draftDate || isDraftInvalid}
                onClick={applySelection}
              >
                Apply
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
