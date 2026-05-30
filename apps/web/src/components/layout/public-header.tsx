'use client';

import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import { BrandLogo } from '@/components/layout/brand-logo';
import { Button } from '@/components/ui/button';
import { BRAND } from '@/lib/brand';
import { fetchProfile } from '@/lib/auth/session-client';
import { cn } from '@/lib/utils';

interface PublicHeaderProps {
  hero?: boolean;
}

type NavLink =
  | { href: string; label: string }
  | { href: string; label: string; auth: true }
  | { href: string; label: string; auth: false };

const navLinks: NavLink[] = [
  { href: '/book', label: 'Book' },
  { href: '/account', label: 'My trips', auth: true },
  { href: '/login', label: 'Sign in', auth: false },
];

export function PublicHeader({ hero = false }: PublicHeaderProps) {
  const pathname = usePathname();
  const [signedIn, setSignedIn] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    void fetchProfile().then((p) => setSignedIn(!!p));
  }, []);

  useEffect(() => {
    if (!hero) {
      setScrolled(true);
      return;
    }
    const onScroll = () => setScrolled(window.scrollY > 32);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [hero]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const onHero = hero && !scrolled;
  const isHome = pathname === '/';

  const linkClass = cn(
    'text-sm tracking-wide transition-colors duration-300',
    onHero
      ? 'text-white/75 hover:text-white'
      : 'text-muted-foreground hover:text-foreground',
  );

  const visibleLinks = navLinks.filter((item) => {
    if ('auth' in item) {
      if (item.auth === true) return signedIn;
      return !signedIn;
    }
    return true;
  });

  return (
    <>
      <header
        className={cn(
          'fixed top-0 z-50 w-full transition-all duration-500 ease-out',
          onHero
            ? 'border-b border-white/0 bg-transparent'
            : 'border-b border-border/80 bg-card/95 shadow-sm shadow-black/5 backdrop-blur-lg',
        )}
      >
        <div className="mx-auto flex h-[4.5rem] max-w-6xl items-center justify-between gap-6 px-4 sm:h-20 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <BrandLogo responsive onDark={onHero} />
            {onHero ? (
              <Link
                href="/"
                className="hidden font-display text-xl font-medium tracking-tight text-white sm:block"
              >
                {BRAND.name}
              </Link>
            ) : null}
          </div>

          <nav className="hidden items-center gap-8 md:flex" aria-label="Main">
            {visibleLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  linkClass,
                  pathname === item.href && !onHero && 'text-foreground',
                  pathname === item.href && onHero && 'text-luxury',
                )}
              >
                {item.label}
              </Link>
            ))}
            <Button
              variant={onHero ? 'accent' : 'default'}
              size="sm"
              asChild
              className={cn(!onHero && 'min-w-[7rem]')}
            >
              <Link href="/book">Reserve</Link>
            </Button>
          </nav>

          <div className="flex items-center gap-2 md:hidden">
            <Button
              variant={onHero ? 'accent' : 'default'}
              size="sm"
              asChild
              className="h-9 px-4 text-xs"
            >
              <Link href="/book">Reserve</Link>
            </Button>
            <button
              type="button"
              className={cn(
                'inline-flex h-10 w-10 items-center justify-center rounded-sm transition-colors',
                onHero
                  ? 'text-white hover:bg-white/10'
                  : 'text-foreground hover:bg-muted',
              )}
              aria-expanded={mobileOpen}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              onClick={() => setMobileOpen((o) => !o)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {mobileOpen ? (
        <div
          className="fixed inset-0 z-40 bg-primary/40 backdrop-blur-sm md:hidden"
          aria-hidden
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <div
        className={cn(
          'fixed inset-x-0 top-[4.5rem] z-40 border-b border-border bg-card transition-all duration-300 md:hidden sm:top-20',
          mobileOpen ? 'visible opacity-100' : 'invisible opacity-0 pointer-events-none',
        )}
      >
        <nav className="flex flex-col px-4 py-6" aria-label="Mobile">
          {visibleLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'border-b border-border/60 py-4 font-display text-2xl font-medium text-foreground last:border-0',
                pathname === item.href && 'text-luxury',
              )}
            >
              {item.label}
            </Link>
          ))}
          {isHome ? (
            <Link
              href="/#book"
              className="py-4 font-display text-2xl font-medium text-muted-foreground"
              onClick={() => setMobileOpen(false)}
            >
              Quick book
            </Link>
          ) : null}
        </nav>
      </div>
    </>
  );
}

export function PublicFooter() {
  return (
    <footer className="border-t border-border bg-primary text-primary-foreground">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-display text-2xl font-medium">{BRAND.name}</p>
            <p className="mt-2 max-w-xs text-sm text-primary-foreground/60">
              Licensed private hire across the West Midlands. Discreet, punctual, and held to the
              highest operator standards.
            </p>
          </div>
          <div className="flex flex-col gap-3 text-sm sm:items-end">
            <Link
              href="/book"
              className="text-primary-foreground/70 transition-colors hover:text-luxury"
            >
              Book a journey
            </Link>
            <Link
              href="/login"
              className="text-primary-foreground/70 transition-colors hover:text-luxury"
            >
              Passenger sign in
            </Link>
            <Link
              href="/staff/login"
              className="text-primary-foreground/40 transition-colors hover:text-primary-foreground/70"
            >
              Operator login
            </Link>
          </div>
        </div>
        <div className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-primary-foreground/40 sm:text-left">
          © {new Date().getFullYear()} {BRAND.name} · {BRAND.legalFooter}
        </div>
      </div>
    </footer>
  );
}
