'use client';

import {
  AlertTriangle,
  Car,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Shield,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { AppNavDrawer } from '@/components/layout/app-nav-drawer';
import { pageContainerClass } from '@/components/layout/page-container';
import { AdminShellHeaderSkeleton } from '@/components/skeletons/admin-shell-header-skeleton';
import { BrandLogo } from '@/components/layout/brand-logo';
import { Button } from '@/components/ui/button';
import { SheetClose } from '@/components/ui/sheet';
import { ADMIN_NAV_ITEMS, adminNavForRole, type AdminNavKey } from '@/lib/admin/nav';
import { isOperatorStaffRole } from '@/lib/auth/roles';
import { clearTokens, fetchProfile, type UserProfile } from '@/lib/auth/session-client';
import { cn } from '@/lib/utils';

const NAV_ICONS: Record<AdminNavKey, typeof LayoutDashboard> = {
  dashboard: LayoutDashboard,
  dispatch: ClipboardList,
  fleet: Car,
  compliance: Shield,
  complaints: AlertTriangle,
};

export function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [profile, setProfile] = useState<UserProfile | null | undefined>(undefined);

  useEffect(() => {
    void fetchProfile().then((p) => {
      if (!p || !isOperatorStaffRole(p.role)) {
        router.replace('/staff/login');
        return;
      }
      setProfile(p);
    });
  }, [router]);

  if (profile === undefined) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <AdminShellHeaderSkeleton />
        <main className="flex-1">{children}</main>
      </div>
    );
  }

  if (!profile) return null;

  const allowed = new Set(adminNavForRole(profile.role));
  const navItems = ADMIN_NAV_ITEMS.filter((item) => allowed.has(item.key)).map((item) => ({
    href: item.href,
    label: item.label,
    icon: NAV_ICONS[item.key],
    exact: item.key === 'dashboard',
  }));

  const currentPage = navItems.find(({ href, exact }) =>
    exact ? pathname === href : pathname.startsWith(href),
  )?.label;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border/60 bg-card/80 backdrop-blur-md">
        <div className={cn('flex h-14 items-center justify-between gap-3', pageContainerClass)}>
          <div className="flex min-w-0 items-center gap-3">
            <AppNavDrawer
              title="Operator workspace"
              description={`${profile.firstName} ${profile.lastName} · ${profile.email}`}
              items={navItems}
              pathname={pathname}
              triggerLabel="Open operator menu"
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
                      router.push('/staff/login');
                    }}
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </Button>
                </>
              }
            />
            <BrandLogo markOnly onDark />
            <span className="truncate text-sm font-medium text-muted-foreground">
              {currentPage ?? 'Operator'}
            </span>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
