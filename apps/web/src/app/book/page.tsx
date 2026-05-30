import { MapPin } from 'lucide-react';

import { BookingForm } from '@/components/booking/booking-form';
import { PageShell } from '@/components/layout/page-shell';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function BookPage() {
  return (
    <PageShell>
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="mb-8 text-center">
          <Badge variant="accent" className="mb-4">
            Book a taxi
          </Badge>
          <h1 className="text-3xl font-bold sm:text-4xl">Where are we picking you up?</h1>
          <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
            Enter your journey details and we&apos;ll request a licensed private hire vehicle for you.
          </p>
        </div>

        <Card className="glass-card border-0 shadow-xl shadow-slate-900/10">
          <CardHeader className="border-b bg-secondary/30">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" aria-hidden />
              Journey details
            </CardTitle>
            <CardDescription>
              UK postcodes are validated when you submit. Maps integration coming soon.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <BookingForm />
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
