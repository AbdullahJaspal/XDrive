import { Badge } from '@/components/ui/badge';

interface ConnectionBadgeProps {
  live: boolean;
}

export function ConnectionBadge({ live }: ConnectionBadgeProps) {
  if (live) {
    return (
      <Badge variant="success" className="gap-1">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
        Live
      </Badge>
    );
  }

  return <Badge variant="outline">Updates every 30s</Badge>;
}
