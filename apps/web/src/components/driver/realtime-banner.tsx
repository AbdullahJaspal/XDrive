import { Radio, X } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface RealtimeBannerProps {
  message: string;
  onDismiss: () => void;
}

export function RealtimeBanner({ message, onDismiss }: RealtimeBannerProps) {
  return (
    <div
      className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
      role="status"
    >
      <Radio className="h-4 w-4 shrink-0" aria-hidden />
      <p className="flex-1 font-medium">{message}</p>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0 text-emerald-800 hover:bg-emerald-100 hover:text-emerald-950"
        onClick={onDismiss}
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
