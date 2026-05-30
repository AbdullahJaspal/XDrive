'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { BrandLogo } from '@/components/layout/brand-logo';
import { Button } from '@/components/ui/button';
import { BRAND } from '@/lib/brand';
import { fetchProfile } from '@/lib/auth/session-client';
import { cn } from '@/lib/utils';

export function PublicHeader() {
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    void fetchProfile().then((p) => setSignedIn(!!p));
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-card/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <BrandLogo responsive onDark={false} />

        <nav className="flex items-center gap-1 sm:gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/book">Book a taxi</Link>
          </Button>
          {signedIn ? (
            <Button variant="ghost" size="sm" asChild>
              <Link href="/account">My trips</Link>
            </Button>
          ) : (
            <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
              <Link href="/login">Sign in</Link>
            </Button>
          )}
          <Button variant="accent" size="sm" asChild>
            <Link href="/#book">Get a taxi</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="mt-auto border-t border-border/60 bg-card/50 py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <p className="text-center text-sm text-muted-foreground sm:text-left">
            © {new Date().getFullYear()} {BRAND.name} — {BRAND.legalFooter}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
            <Link href="/book" className="text-muted-foreground hover:text-foreground">
              Book a taxi
            </Link>
            <Link href="/login" className="text-muted-foreground hover:text-foreground">
              Sign in
            </Link>
            <Link
              href="/staff/login"
              className={cn('text-muted-foreground/70 hover:text-muted-foreground')}
            >
              Operator login
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
