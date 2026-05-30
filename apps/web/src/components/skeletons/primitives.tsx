import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export function PageHeaderSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-3', className)}>
      <Skeleton className="h-3 w-28" />
      <Skeleton className="h-10 w-full max-w-md" />
      <Skeleton className="h-4 w-full max-w-sm" />
    </div>
  );
}

export function StatCardsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div
      className={cn(
        'grid gap-4',
        count === 3 && 'sm:grid-cols-3',
        count === 4 && 'sm:grid-cols-2 lg:grid-cols-4',
        count === 2 && 'sm:grid-cols-2',
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="surface-elevated rounded-xl p-6">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="mt-4 h-10 w-16" />
          <Skeleton className="mt-3 h-3 w-32" />
        </div>
      ))}
    </div>
  );
}

export function CardBlockSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="surface-elevated space-y-4 rounded-xl p-6 sm:p-8">
      <Skeleton className="h-6 w-40" />
      <Skeleton className="h-4 w-full max-w-lg" />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            'h-4 w-full',
            i === 1 && 'max-w-[88%]',
            i === 2 && 'max-w-[72%]',
          )}
        />
      ))}
    </div>
  );
}

export function ListCardsSkeleton({ count = 3 }: { count?: number }) {
  return (
    <ul className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <li key={i} className="surface-elevated rounded-xl p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-3 w-28" />
            </div>
            <Skeleton className="h-6 w-20 shrink-0 rounded-full" />
          </div>
          <Skeleton className="mt-4 h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-4/5" />
        </li>
      ))}
    </ul>
  );
}

export function FormCardSkeleton() {
  return (
    <div className="surface-elevated space-y-5 rounded-xl p-6 sm:p-8">
      <Skeleton className="h-6 w-32" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-full" />
      </div>
      <Skeleton className="h-11 w-full rounded-lg" />
    </div>
  );
}

export function ShellHeaderSkeleton() {
  return (
    <header className="border-b border-border/60 bg-card/80">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Skeleton className="h-8 w-8 rounded-md" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-20 rounded-lg" />
          <Skeleton className="h-9 w-20 rounded-lg" />
        </div>
      </div>
    </header>
  );
}
