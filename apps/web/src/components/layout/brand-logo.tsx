import Image from 'next/image';
import Link from 'next/link';

import { BRAND } from '@/lib/brand';
import { cn } from '@/lib/utils';

interface BrandLogoProps {
  className?: string;
  responsive?: boolean;
  markOnly?: boolean;
  /** Use on dark hero backgrounds (no logo backdrop) */
  onDark?: boolean;
}

export function BrandLogo({
  className,
  responsive = false,
  markOnly = false,
  onDark = false,
}: BrandLogoProps) {
  const markClass = cn(
    'object-contain',
    markOnly ? 'h-10 w-10' : 'h-9 w-9 sm:h-10 sm:w-10',
    !onDark && 'rounded-lg bg-white p-0.5 shadow-sm',
  );

  const fullClass = cn('h-10 w-auto object-contain', !onDark && 'rounded-lg bg-white px-2 py-1 shadow-sm');

  if (markOnly) {
    return (
      <Link
        href="/"
        className={cn('inline-flex shrink-0 transition-opacity hover:opacity-90', className)}
      >
        <Image
          src="/logo.png"
          alt={BRAND.name}
          width={40}
          height={40}
          className={markClass}
          priority
        />
      </Link>
    );
  }

  if (responsive) {
    return (
      <>
        <Link
          href="/"
          className={cn(
            'inline-flex shrink-0 transition-opacity hover:opacity-90 sm:hidden',
            className,
          )}
        >
          <Image
            src="/logo.png"
            alt={BRAND.name}
            width={36}
            height={36}
            className={markClass}
            priority
          />
        </Link>
        <Link
          href="/"
          className={cn(
            'hidden shrink-0 transition-opacity hover:opacity-90 sm:inline-flex',
            className,
          )}
        >
          <Image
            src="/logo-full.png"
            alt={`${BRAND.name} — ${BRAND.tagline}`}
            width={200}
            height={52}
            className={fullClass}
            priority
          />
        </Link>
      </>
    );
  }

  return (
    <Link
      href="/"
      className={cn('inline-flex shrink-0 transition-opacity hover:opacity-90', className)}
    >
      <Image
        src="/logo-full.png"
        alt={`${BRAND.name} — ${BRAND.tagline}`}
        width={200}
        height={52}
        className={fullClass}
        priority
      />
    </Link>
  );
}
