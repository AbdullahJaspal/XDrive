import { Car, MapPin, Shield } from 'lucide-react';

import { Badge } from '@/components/ui/badge';

export function HeroPreview() {
  return (
    <div
      className="glass-card hidden w-full max-w-sm animate-fade-in-up-delay-2 rounded-2xl border-white/20 p-5 shadow-2xl shadow-slate-900/25 lg:block"
      aria-hidden
    >
      <div className="mb-4 flex items-center justify-between">
        <Badge variant="success" className="gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          Driver on the way
        </Badge>
        <span className="text-xs text-muted-foreground">PHV-20260530-A1B</span>
      </div>
      <div className="space-y-4">
        <div className="flex gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <MapPin className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Pickup</p>
            <p className="text-sm font-semibold">12 High Street, WV1</p>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
            <Car className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Silver Mercedes · 4 min</p>
            <p className="text-sm font-semibold">Licensed PHV · Wolverhampton</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
          <Shield className="h-4 w-4 shrink-0" />
          Driver licence verified before dispatch
        </div>
      </div>
    </div>
  );
}
