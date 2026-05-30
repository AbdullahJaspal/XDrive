'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { BrandLogo } from '@/components/layout/brand-logo';
import { Button } from '@/components/ui/button';
import { isStaffRole } from '@/lib/auth/roles';
import { clearTokens, fetchProfile, type UserProfile } from '@/lib/auth/session-client';
import { cn } from '@/lib/utils';

export function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null | undefined>(undefined);

  useEffect(() => {
    void fetchProfile().then((p) => {
      if (!p || !isStaffRole(p.role)) {
        router.replace('/staff/login');
        return;
      }
      setProfile(p);
    });
  }, [router]);

  if (profile === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading operator workspace…</p>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border/60 bg-card/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <BrandLogo markOnly onDark />
          <span className="hidden text-sm font-medium text-muted-foreground sm:inline">
            Operator workspace
          </span>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/dashboard">Dashboard</Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                clearTokens();
                router.push('/staff/login');
              }}
            >
              Sign out
            </Button>
          </div>
        </div>
      </header>
      <main className={cn('flex-1')}>{children}</main>
    </div>
  );
}
