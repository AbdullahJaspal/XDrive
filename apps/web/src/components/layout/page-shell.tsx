import { PublicFooter, PublicHeader } from '@/components/layout/public-header';
import { cn } from '@/lib/utils';

interface PageShellProps {
  children: React.ReactNode;
  className?: string;
  /** Use transparent header over dark hero (homepage) */
  heroHeader?: boolean;
}

export function PageShell({ children, className, heroHeader }: PageShellProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader hero={heroHeader} />
      <div className={cn('flex-1 pt-[4.5rem] sm:pt-20', className)}>
        {children}
      </div>
      <PublicFooter />
    </div>
  );
}
