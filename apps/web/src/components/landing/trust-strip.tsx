import { Clock, FileCheck, Shield, Users } from 'lucide-react';

const items = [
  { icon: Shield, label: 'Licensed PHV operator' },
  { icon: FileCheck, label: 'Council-ready records' },
  { icon: Clock, label: '15-month booking retention' },
  { icon: Users, label: 'Safeguarding trained' },
] as const;

export function TrustStrip() {
  return (
    <div className="border-y border-border/60 bg-card/60 py-6 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-8 gap-y-4 px-4 sm:px-6">
        {items.map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center gap-2 text-sm text-muted-foreground">
            <Icon className="h-4 w-4 shrink-0 text-primary" aria-hidden />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
