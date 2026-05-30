export enum LicenceType {
  PHV_DRIVER = 'PHV_DRIVER',
  PHV_VEHICLE = 'PHV_VEHICLE',
  OPERATOR = 'OPERATOR',
  DVLA_DRIVING = 'DVLA_DRIVING',
}

export enum LicenceStatus {
  VALID = 'VALID',
  EXPIRING_SOON = 'EXPIRING_SOON',
  EXPIRED = 'EXPIRED',
  SUSPENDED = 'SUSPENDED',
  REVOKED = 'REVOKED',
}

export enum ComplaintStatus {
  OPEN = 'OPEN',
  UNDER_INVESTIGATION = 'UNDER_INVESTIGATION',
  RESOLVED = 'RESOLVED',
  ESCALATED = 'ESCALATED',
  CLOSED = 'CLOSED',
}

export enum SafeguardingSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum AuditAction {
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  DISPATCH = 'DISPATCH',
  EXPORT = 'EXPORT',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
}

export interface ComplianceDocumentSummary {
  id: string;
  licenceType: LicenceType;
  licenceNumber: string;
  issuingAuthority: string;
  expiryDate: string;
  status: LicenceStatus;
  entityType: 'driver' | 'vehicle' | 'operator';
  entityId: string;
}
