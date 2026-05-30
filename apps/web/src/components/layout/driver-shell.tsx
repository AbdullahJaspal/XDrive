'use client';

import { Car, Clock, Home, ListChecks, LogOut, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { DutyStatusPill } from '@/components/driver/duty-status-pill';
import { AppNavDrawer } from '@/components/layout/app-nav-drawer';
import { DriverShellHeaderSkeleton } from '@/components/skeletons/driver-shell-header-skeleton';
import { pageContainerClass } from '@/components/layout/page-container';
import { BrandLogo } from '@/components/layout/brand-logo';
import { Button } from '@/components/ui/button';
import { SheetClose } from '@/components/ui/sheet';
import { isDriverRole } from '@/lib/auth/roles';
import { clearTokens, fetchProfile, type UserProfile } from '@/lib/auth/session-client';
import { cn } from '@/lib/utils';

const nav = [
  { href: '/driver', label: 'Home', icon: Home, exact: true },
  { href: '/driver/jobs', label: 'Jobs', icon: ListChecks, exact: false },
  { href: '/driver/history', label: 'History', icon: Clock, exact: false },
  { href: '/driver/profile', label: 'Profile', icon: User, exact: false },
] as const;

export function DriverShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [profile, setProfile] = useState<UserProfile | null | undefined>(undefined);

  useEffect(() => {
    void fetchProfile().then((p) => {
      if (!p || !isDriverRole(p.role)) {
        router.replace('/driver/login');
        return;
      }
      setProfile(p);
    });
  }, [router]);

  if (profile === undefined) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <DriverShellHeaderSkeleton />
        <main className="flex-1">{children}</main>
      </div>
    );
  }

  if (!profile) return null;

  const currentPage = nav.find(({ href, exact }) =>
    exact ? pathname === href : pathname.startsWith(href),
  )?.label;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border/60 bg-card/80 backdrop-blur-md">
        <div className={cn('flex h-14 items-center justify-between gap-3', pageContainerClass)}>
          <div className="flex min-w-0 items-center gap-3">
            <AppNavDrawer
              title="Driver app"
              description={`${profile.firstName} ${profile.lastName}`}
              items={[...nav]}
              pathname={pathname}
              triggerLabel="Open driver menu"
              headerExtra={<DutyStatusPill />}
              footer={
                <>
                  <SheetClose asChild>
                    <Link
                      href="/"
                      className="rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
                    >
                      Passenger site
                    </Link>
                  </SheetClose>
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2"
                    onClick={() => {
                      clearTokens();
                      router.push('/driver/login');
                    }}
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </Button>
                </>
              }
            />
            <BrandLogo markOnly />
            <span className="truncate text-sm font-medium text-muted-foreground">
              {currentPage ?? 'Driver'}
            </span>
          </div>
          <div className="hidden shrink-0 sm:block">
            <DutyStatusPill />
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border/60 bg-card/50 py-3 sm:hidden">
        <div
          className={cn(
            'flex items-center justify-center text-xs text-muted-foreground',
            pageContainerClass,
          )}
        >
          <span className="flex items-center gap-1.5">
            <Car className="h-3.5 w-3.5 text-luxury" aria-hidden />
            {profile.email}
          </span>
        </div>
      </footer>
    </div>
  );
}
