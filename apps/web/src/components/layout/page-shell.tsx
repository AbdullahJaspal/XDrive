import { PublicFooter, PublicHeader } from '@/components/layout/public-header';
import { cn } from '@/lib/utils';

interface PageShellProps {
  children: React.ReactNode;
  className?: string;
}

export function PageShell({ children, className }: PageShellProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <div className={cn('flex-1', className)}>{children}</div>
      <PublicFooter />
    </div>
  );
}
