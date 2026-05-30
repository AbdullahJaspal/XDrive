export {
  BOOKING_STATUS_LABELS,
  DRIVER_STATUS_LABELS,
} from '@/lib/driver/labels';

export const COMPLAINT_STATUS_LABELS: Record<string, string> = {
  OPEN: 'Open',
  UNDER_INVESTIGATION: 'Under investigation',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
};

export const LICENCE_STATUS_LABELS: Record<string, string> = {
  VALID: 'Valid',
  EXPIRING_SOON: 'Expiring soon',
  EXPIRED: 'Expired',
  REVOKED: 'Revoked',
  PENDING_REVIEW: 'Pending review',
};

export const VEHICLE_STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  MAINTENANCE: 'Maintenance',
  DECOMMISSIONED: 'Decommissioned',
};
