import { pageContainerClass } from '@/components/layout/page-container';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export function DriverShellHeaderSkeleton() {
  return (
    <header className="border-b border-border/60 bg-card/80">
      <div className={cn('flex h-14 items-center justify-between gap-3', pageContainerClass)}>
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="hidden h-6 w-16 rounded-full sm:block" />
      </div>
    </header>
  );
}
