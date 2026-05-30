export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  OPERATOR_ADMIN = 'OPERATOR_ADMIN',
  DISPATCHER = 'DISPATCHER',
  COMPLIANCE_OFFICER = 'COMPLIANCE_OFFICER',
  CUSTOMER = 'CUSTOMER',
  DRIVER = 'DRIVER',
}

export enum Permission {
  // Bookings
  BOOKING_CREATE = 'booking:create',
  BOOKING_READ = 'booking:read',
  BOOKING_UPDATE = 'booking:update',
  BOOKING_CANCEL = 'booking:cancel',
  BOOKING_DISPATCH = 'booking:dispatch',
  // Drivers & vehicles
  DRIVER_MANAGE = 'driver:manage',
  VEHICLE_MANAGE = 'vehicle:manage',
  // Compliance
  COMPLIANCE_READ = 'compliance:read',
  COMPLIANCE_MANAGE = 'compliance:manage',
  AUDIT_READ = 'audit:read',
  // Complaints & safeguarding
  COMPLAINT_MANAGE = 'complaint:manage',
  SAFEGUARDING_MANAGE = 'safeguarding:manage',
  // Admin
  USER_MANAGE = 'user:manage',
  PAYMENT_MANAGE = 'payment:manage',
  REPORT_EXPORT = 'report:export',
}

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.SUPER_ADMIN]: Object.values(Permission),
  [UserRole.OPERATOR_ADMIN]: [
    Permission.BOOKING_CREATE,
    Permission.BOOKING_READ,
    Permission.BOOKING_UPDATE,
    Permission.BOOKING_CANCEL,
    Permission.BOOKING_DISPATCH,
    Permission.DRIVER_MANAGE,
    Permission.VEHICLE_MANAGE,
    Permission.COMPLIANCE_READ,
    Permission.COMPLIANCE_MANAGE,
    Permission.AUDIT_READ,
    Permission.COMPLAINT_MANAGE,
    Permission.SAFEGUARDING_MANAGE,
    Permission.USER_MANAGE,
    Permission.PAYMENT_MANAGE,
    Permission.REPORT_EXPORT,
  ],
  [UserRole.DISPATCHER]: [
    Permission.BOOKING_CREATE,
    Permission.BOOKING_READ,
    Permission.BOOKING_UPDATE,
    Permission.BOOKING_DISPATCH,
    Permission.DRIVER_MANAGE,
    Permission.VEHICLE_MANAGE,
    Permission.COMPLIANCE_READ,
    Permission.AUDIT_READ,
  ],
  [UserRole.COMPLIANCE_OFFICER]: [
    Permission.BOOKING_READ,
    Permission.COMPLIANCE_READ,
    Permission.COMPLIANCE_MANAGE,
    Permission.AUDIT_READ,
    Permission.COMPLAINT_MANAGE,
    Permission.SAFEGUARDING_MANAGE,
    Permission.REPORT_EXPORT,
  ],
  [UserRole.CUSTOMER]: [Permission.BOOKING_CREATE, Permission.BOOKING_READ, Permission.BOOKING_CANCEL],
  [UserRole.DRIVER]: [Permission.BOOKING_READ, Permission.BOOKING_UPDATE],
};

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  permissions: Permission[];
  iat?: number;
  exp?: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}
