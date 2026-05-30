import Image from 'next/image';
import Link from 'next/link';

import { BRAND } from '@/lib/brand';
import { cn } from '@/lib/utils';

interface BrandLogoProps {
  className?: string;
  responsive?: boolean;
  markOnly?: boolean;
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
    onDark ? 'drop-shadow-md' : 'rounded-sm bg-card p-0.5 shadow-sm',
  );

  const fullClass = cn(
    'h-8 w-auto object-contain sm:h-9',
    onDark ? 'brightness-0 invert drop-shadow-md' : 'rounded-sm bg-card px-2 py-0.5 shadow-sm',
  );

  if (markOnly) {
    return (
      <Link
        href="/"
        className={cn('inline-flex shrink-0 transition-opacity hover:opacity-85', className)}
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
      <Link
        href="/"
        className={cn('inline-flex shrink-0 items-center transition-opacity hover:opacity-85', className)}
      >
        <Image
          src="/logo.png"
          alt={BRAND.name}
          width={40}
          height={40}
          className={markClass}
          priority
        />
        {!onDark ? (
          <Image
            src="/logo-full.png"
            alt=""
            width={160}
            height={42}
            className={cn('ml-2 hidden h-8 w-auto object-contain sm:block', fullClass)}
            aria-hidden
          />
        ) : null}
      </Link>
    );
  }

  return (
    <Link
      href="/"
      className={cn('inline-flex shrink-0 transition-opacity hover:opacity-85', className)}
    >
      <Image
        src="/logo-full.png"
        alt={BRAND.name}
        width={200}
        height={52}
        className={fullClass}
        priority
      />
    </Link>
  );
}
