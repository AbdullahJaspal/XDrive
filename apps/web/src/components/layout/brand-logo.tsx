import Image from 'next/image';
import Link from 'next/link';

import { BRAND } from '@/lib/brand';
import { cn } from '@/lib/utils';

interface BrandLogoProps {
  className?: string;
  /** Header: icon + wordmark on sm+; icon only on xs */
  responsive?: boolean;
  /** Icon only — login panels, admin sidebar */
  markOnly?: boolean;
  /** Over hero / dark backgrounds */
  onDark?: boolean;
}

function LogoMark({
  onDark = false,
  size = 'md',
  alt = '',
}: {
  onDark?: boolean;
  size?: 'md' | 'lg';
  alt?: string;
}) {
  const box = size === 'lg' ? 'h-11 w-11' : 'h-10 w-10';
  const img = size === 'lg' ? 'h-9 w-9' : 'h-8 w-8';

  return (
    <span
      className={cn(
        'relative flex shrink-0 items-center justify-center overflow-hidden rounded-lg',
        box,
        onDark
          ? 'bg-white/10 ring-1 ring-white/20 backdrop-blur-sm'
          : 'bg-primary shadow-sm ring-1 ring-primary/20',
      )}
    >
      <Image
        src="/logo.png"
        alt={alt}
        width={36}
        height={36}
        className={cn('object-contain mix-blend-screen', img)}
        priority
      />
    </span>
  );
}

export function BrandLogo({
  className,
  responsive = false,
  markOnly = false,
  onDark = false,
}: BrandLogoProps) {
  if (markOnly) {
    return (
      <Link
        href="/"
        className={cn('inline-flex shrink-0 transition-opacity hover:opacity-85', className)}
      >
        <LogoMark onDark={onDark} size="lg" alt={BRAND.name} />
      </Link>
    );
  }

  if (responsive) {
    return (
      <Link
        href="/"
        className={cn(
          'group inline-flex min-w-0 max-w-[min(100%,14rem)] items-center gap-3 transition-opacity hover:opacity-90',
          className,
        )}
      >
        <LogoMark onDark={onDark} />
        <span className="flex min-w-0 flex-col">
          <span
            className={cn(
              'truncate font-display text-base font-semibold leading-tight tracking-tight sm:text-[1.125rem]',
              onDark ? 'text-white' : 'text-foreground',
            )}
          >
            {BRAND.name}
          </span>
          <span
            className={cn(
              'hidden truncate text-[0.625rem] font-medium uppercase tracking-[0.18em] sm:block',
              onDark ? 'text-luxury' : 'text-muted-foreground',
            )}
          >
            Private hire
          </span>
        </span>
      </Link>
    );
  }

  return (
    <Link
      href="/"
      className={cn(
        'group inline-flex min-w-0 items-center gap-3 transition-opacity hover:opacity-90',
        className,
      )}
    >
      <LogoMark onDark={onDark} />
      <span className="flex min-w-0 flex-col">
        <span
          className={cn(
            'font-display text-[1.125rem] font-semibold leading-tight tracking-tight',
            onDark ? 'text-white' : 'text-foreground',
          )}
        >
          {BRAND.name}
        </span>
        <span
          className={cn(
            'text-[0.625rem] font-medium uppercase tracking-[0.18em]',
            onDark ? 'text-luxury' : 'text-muted-foreground',
          )}
        >
          Private hire
        </span>
      </span>
    </Link>
  );
}
