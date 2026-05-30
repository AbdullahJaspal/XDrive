export enum DispatchEventType {
  BOOKING_CREATED = 'booking:created',
  BOOKING_UPDATED = 'booking:updated',
  BOOKING_ASSIGNED = 'booking:assigned',
  BOOKING_STATUS_CHANGED = 'booking:status_changed',
  DRIVER_LOCATION = 'driver:location',
  DRIVER_AVAILABILITY = 'driver:availability',
  DISPATCH_ALERT = 'dispatch:alert',
}

export interface DispatchEvent<T = unknown> {
  type: DispatchEventType;
  payload: T;
  operatorId: string;
  timestamp: string;
  correlationId: string;
}

export interface DriverLocationPayload {
  driverId: string;
  lat: number;
  lng: number;
  heading?: number;
  speedKmh?: number;
}
