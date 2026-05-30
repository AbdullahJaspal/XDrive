import { Badge } from '@/components/ui/badge';
import { BOOKING_STATUS_LABELS } from '@/lib/admin/labels';
import type { BookingStatus } from '@uk-phv/shared-types';
import { cn } from '@/lib/utils';

const VARIANT: Partial<
  Record<BookingStatus, 'default' | 'secondary' | 'success' | 'warning' | 'outline' | 'accent'>
> = {
    REQUESTED: 'warning',
    CONFIRMED: 'accent',
    DISPATCHED: 'default',
    DRIVER_EN_ROUTE: 'default',
    ARRIVED: 'default',
    IN_PROGRESS: 'success',
    COMPLETED: 'secondary',
    CANCELLED: 'outline',
    NO_SHOW: 'outline',
  };

export function BookingStatusBadge({
  status,
  className,
}: {
  status: BookingStatus | string;
  className?: string;
}) {
  const label = BOOKING_STATUS_LABELS[status] ?? status;
  const variant = VARIANT[status as BookingStatus] ?? 'secondary';
  return (
    <Badge variant={variant} className={cn(className)}>
      {label}
    </Badge>
  );
}
