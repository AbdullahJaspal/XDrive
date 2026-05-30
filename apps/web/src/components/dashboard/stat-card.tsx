import type { LucideIcon } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  trend?: string;
  variant?: 'default' | 'warning' | 'success' | 'info';
}

const iconStyles = {
  default: 'bg-primary/10 text-primary',
  warning: 'bg-amber-100 text-amber-700',
  success: 'bg-emerald-100 text-emerald-700',
  info: 'bg-sky-100 text-sky-700',
};

export function StatCard({ label, value, icon: Icon, trend, variant = 'default' }: StatCardProps) {
  return (
    <Card className="surface-elevated overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="text-4xl font-bold tracking-tight tabular-nums">{value}</p>
            {trend ? <p className="text-xs text-muted-foreground">{trend}</p> : null}
          </div>
          <div
            className={cn(
              'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl',
              iconStyles[variant],
            )}
          >
            <Icon className="h-6 w-6" aria-hidden />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
