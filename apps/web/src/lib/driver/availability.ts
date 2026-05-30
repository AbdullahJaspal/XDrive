/** Driver statuses that count as on shift (including mid-trip). */
export const ON_SHIFT_STATUSES = ['ON_DUTY', 'ON_TRIP', 'ACTIVE'] as const;

/** Statuses eligible for new dispatch assignments. */
export const DISPATCHABLE_STATUSES = ['ON_DUTY', 'ACTIVE'] as const;

const BLOCKED_ACCOUNT_STATUSES = ['PENDING_APPROVAL', 'SUSPENDED', 'DEACTIVATED'] as const;

export function isOnShift(status: string): boolean {
  return (ON_SHIFT_STATUSES as readonly string[]).includes(status);
}

export function isDispatchable(status: string): boolean {
  return (DISPATCHABLE_STATUSES as readonly string[]).includes(status);
}

export interface DriverAvailabilityUi {
  onDuty: boolean;
  onTrip: boolean;
  canChange: boolean;
  canGoOnDuty: boolean;
  canGoOffDuty: boolean;
  blockedReason: string | null;
}

export function buildAvailabilityUi(
  status: string,
  activeJobCount: number,
): DriverAvailabilityUi {
  const onTrip = status === 'ON_TRIP';
  const onDuty = isOnShift(status);

  if ((BLOCKED_ACCOUNT_STATUSES as readonly string[]).includes(status)) {
    return {
      onDuty: false,
      onTrip: false,
      canChange: false,
      canGoOnDuty: false,
      canGoOffDuty: false,
      blockedReason: 'Your operator account must be approved before you can go on duty.',
    };
  }

  if (onTrip) {
    return {
      onDuty: true,
      onTrip: true,
      canChange: false,
      canGoOnDuty: false,
      canGoOffDuty: false,
      blockedReason: 'Complete your current trip before going off duty.',
    };
  }

  const canGoOnDuty = status === 'OFF_DUTY' || status === 'ACTIVE';
  const canGoOffDuty =
    (status === 'ON_DUTY' || status === 'ACTIVE') && activeJobCount === 0;

  return {
    onDuty,
    onTrip: false,
    canChange: canGoOnDuty || canGoOffDuty,
    canGoOnDuty,
    canGoOffDuty,
    blockedReason: null,
  };
}
