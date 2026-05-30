import { cn } from '@/lib/utils';

/** Shared max width and horizontal padding for all app pages (matches header/footer). */
export const pageContainerClass = 'mx-auto w-full max-w-6xl px-4 sm:px-6';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function PageContainer({ children, className }: PageContainerProps) {
  return <div className={cn(pageContainerClass, className)}>{children}</div>;
}
