import { PageContainer } from '@/components/layout/page-container';
import { Skeleton } from '@/components/ui/skeleton';
import { ShellHeaderSkeleton } from '@/components/skeletons/primitives';

export function AppShellSkeleton({ children }: { children?: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <ShellHeaderSkeleton />
      <main className="flex-1">
        {children ?? (
          <PageContainer className="flex min-h-[50vh] items-center justify-center py-12">
            <Skeleton className="h-4 w-48" />
          </PageContainer>
        )}
      </main>
    </div>
  );
}
