export const DRIVER_STATUS_LABELS: Record<string, string> = {
  PENDING_APPROVAL: 'Pending approval',
  ACTIVE: 'Active',
  OFF_DUTY: 'Off duty',
  ON_DUTY: 'On duty',
  ON_TRIP: 'On trip',
  SUSPENDED: 'Suspended',
  DEACTIVATED: 'Deactivated',
};

export const BOOKING_STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Draft',
  REQUESTED: 'Requested',
  CONFIRMED: 'Confirmed',
  DISPATCHED: 'Dispatched',
  DRIVER_EN_ROUTE: 'En route',
  ARRIVED: 'Arrived',
  IN_PROGRESS: 'In progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  NO_SHOW: 'No show',
};

export const ACTIVE_JOB_STATUSES = [
  'DISPATCHED',
  'DRIVER_EN_ROUTE',
  'ARRIVED',
  'IN_PROGRESS',
] as const;
