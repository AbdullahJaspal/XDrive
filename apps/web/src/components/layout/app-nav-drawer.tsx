'use client';

import type { LucideIcon } from 'lucide-react';
import { Menu } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

export interface AppNavDrawerItem {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
}

interface AppNavDrawerProps {
  title: string;
  description?: string;
  items: AppNavDrawerItem[];
  pathname: string;
  triggerLabel?: string;
  headerExtra?: React.ReactNode;
  footer?: React.ReactNode;
}

export function AppNavDrawer({
  title,
  description,
  items,
  pathname,
  triggerLabel = 'Open menu',
  headerExtra,
  footer,
}: AppNavDrawerProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="shrink-0" aria-label={triggerLabel}>
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent aria-describedby={description ? 'nav-drawer-desc' : undefined}>
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          {description ? <SheetDescription id="nav-drawer-desc">{description}</SheetDescription> : null}
          {headerExtra ? <div className="pt-3">{headerExtra}</div> : null}
        </SheetHeader>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4" aria-label={title}>
          {items.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <SheetClose key={href} asChild>
                <Link
                  href={href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    active
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-secondary',
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" aria-hidden />
                  {label}
                </Link>
              </SheetClose>
            );
          })}
        </nav>

        {footer ? <SheetFooter>{footer}</SheetFooter> : null}
      </SheetContent>
    </Sheet>
  );
}
