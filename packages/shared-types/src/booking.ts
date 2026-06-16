export enum BookingStatus {
  DRAFT = 'DRAFT',
  REQUESTED = 'REQUESTED',
  CONFIRMED = 'CONFIRMED',
  DISPATCHED = 'DISPATCHED',
  DRIVER_EN_ROUTE = 'DRIVER_EN_ROUTE',
  ARRIVED = 'ARRIVED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
}

export enum BookingSource {
  WEB = 'WEB',
  MOBILE = 'MOBILE',
  PHONE = 'PHONE',
  OPERATOR = 'OPERATOR',
  API = 'API',
}

export enum AccessibilityRequirement {
  WHEELCHAIR_ACCESSIBLE = 'WHEELCHAIR_ACCESSIBLE',
  ASSISTANCE_DOG = 'ASSISTANCE_DOG',
  HEARING_LOOP = 'HEARING_LOOP',
  STEP_FREE = 'STEP_FREE',
  LARGE_PRINT_RECEIPT = 'LARGE_PRINT_RECEIPT',
  OTHER = 'OTHER',
}

export interface GeoPoint {
  lat: number;
  lng: number;
  address: string;
  postcode: string;
  what3words?: string;
}

export interface BookingSummary {
  id: string;
  reference: string;
  status: BookingStatus;
  source: BookingSource;
  pickup: GeoPoint;
  dropoff: GeoPoint;
  scheduledAt: string | null;
  passengerName: string;
  passengerPhone: string;
  accessibilityRequirements: AccessibilityRequirement[];
  driverId: string | null;
  vehicleId: string | null;
  fareEstimatePence: number | null;
  createdAt: string;
}

export interface BookingStatusHistoryEntry {
  id: string;
  fromStatus: BookingStatus | null;
  toStatus: BookingStatus;
  reason: string | null;
  createdAt: string;
}

export interface BookingDetail extends BookingSummary {
  passengerEmail: string | null;
  notes: string | null;
  distanceMetres: number | null;
  durationSeconds: number | null;
  statusHistory: BookingStatusHistoryEntry[];
}

/** Guest-facing booking details (no internal IDs). */
export interface PublicBookingView {
  reference: string;
  status: BookingStatus;
  operatorName: string;
  passengerName: string;
  passengerEmail: string;
  pickup: GeoPoint;
  dropoff: GeoPoint;
  scheduledAt: string | null;
  fareEstimatePence: number | null;
  accessibilityRequirements: AccessibilityRequirement[];
  notes: string | null;
  createdAt: string;
}

export interface PublicBookingCreated extends BookingSummary {
  guestViewToken: string;
}
