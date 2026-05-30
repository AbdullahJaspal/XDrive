import { pageContainerClass } from '@/components/layout/page-container';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export function AdminShellHeaderSkeleton() {
  return (
    <header className="border-b border-border/60 bg-card/80">
      <div className={cn('flex h-14 items-center gap-3', pageContainerClass)}>
        <Skeleton className="h-9 w-9 rounded-md" />
        <Skeleton className="h-8 w-8 rounded-md" />
        <Skeleton className="h-4 w-28" />
      </div>
    </header>
  );
}
