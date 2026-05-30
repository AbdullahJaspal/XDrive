import type { BookingStatus } from '@prisma/client';

export interface DriverStatusAction {
  status: BookingStatus;
  label: string;
  description: string;
}

const ACTIONS: Partial<Record<BookingStatus, DriverStatusAction>> = {
  DISPATCHED: {
    status: 'DRIVER_EN_ROUTE',
    label: 'Start navigation',
    description: 'Mark yourself en route to pickup',
  },
  DRIVER_EN_ROUTE: {
    status: 'ARRIVED',
    label: 'Arrived at pickup',
    description: 'Confirm you are at the pickup point',
  },
  ARRIVED: {
    status: 'IN_PROGRESS',
    label: 'Passenger on board',
    description: 'Begin the journey',
  },
  IN_PROGRESS: {
    status: 'COMPLETED',
    label: 'Complete journey',
    description: 'Mark trip finished',
  },
};

export function getNextDriverAction(
  status: BookingStatus,
): DriverStatusAction | null {
  return ACTIONS[status] ?? null;
}
