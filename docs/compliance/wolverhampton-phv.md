# Wolverhampton PHV Operator Compliance Mapping

This document maps platform capabilities to typical UK local authority PHV operator licence conditions. **Verify against your specific licence schedule and legal counsel.**

## Booking records

| Requirement | Platform capability |
|-------------|---------------------|
| Record of each booking | `bookings` + `booking_status_history` |
| Pick-up/drop-off details | Geo + address fields on booking |
| Date/time | `scheduledAt`, `createdAt`, lifecycle timestamps |
| Driver & vehicle used | `driverId`, `vehicleId`, dispatch logs |
| Retention period | `retentionExpiresAt` from `bookingRetentionYears` |

## Driver & vehicle licensing

| Requirement | Platform capability |
|-------------|---------------------|
| PHV driver licence tracking | `compliance_documents` (PHV_DRIVER) |
| PHV vehicle licence | `compliance_documents` (PHV_VEHICLE) |
| DVLA licence | `compliance_documents` (DVLA_DRIVING) |
| Dispatch only when valid | `DispatchService.validateCompliance()` |

## Complaints

| Requirement | Platform capability |
|-------------|---------------------|
| Complaint log | `complaints` with reference, status, resolution |
| Link to booking | Optional `bookingId` |

## Safeguarding

| Requirement | Platform capability |
|-------------|---------------------|
| Report logging | `safeguarding_reports` |
| Severity classification | `SafeguardingSeverity` enum |
| Audit trail | `audit_logs` on create |

## Accessibility

| Requirement | Platform capability |
|-------------|---------------------|
| Passenger accessibility needs | `accessibilityRequirements[]` on booking |
| Wheelchair vehicles | `vehicles.isWheelchairAccessible` |

## Data security

| Requirement | Platform capability |
|-------------|---------------------|
| Access control | RBAC + operator scoping |
| Audit trail | `audit_logs` |
| Secure storage | TLS, encrypted DB (production), file allowlist |

## Operator details

Stored on `operators` — licence number, legal name, address, contact.
