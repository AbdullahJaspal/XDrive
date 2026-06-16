export const ACCESSIBILITY_LABELS: Record<string, string> = {
  WHEELCHAIR_ACCESSIBLE: 'Wheelchair accessible',
  ASSISTANCE_DOG: 'Assistance dog',
  HEARING_LOOP: 'Hearing loop',
  STEP_FREE: 'Step-free access',
  LARGE_PRINT_RECEIPT: 'Large print receipt',
  OTHER: 'Other requirements',
};

export const BOOKING_STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Draft',
  REQUESTED: 'Request received',
  CONFIRMED: 'Confirmed',
  DISPATCHED: 'Driver assigned',
  DRIVER_EN_ROUTE: 'Driver en route',
  ARRIVED: 'Driver arrived',
  IN_PROGRESS: 'Journey in progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  NO_SHOW: 'No show',
};

export function formatScheduledAt(value: Date | null): string {
  if (!value) return 'As soon as possible';
  return value.toLocaleString('en-GB', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: 'Europe/London',
  });
}

export function formatFare(pence: number | null): string {
  if (pence == null) return 'To be confirmed';
  return `£${(pence / 100).toFixed(2)}`;
}

export function formatAccessibility(requirements: unknown): string {
  if (!Array.isArray(requirements) || requirements.length === 0) return 'None';
  return requirements.map((item) => ACCESSIBILITY_LABELS[String(item)] ?? String(item)).join(', ');
}
