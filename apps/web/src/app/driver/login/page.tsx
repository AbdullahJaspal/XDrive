'use client';

import { Loader2, Lock, Mail, Navigation } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { BrandLogo } from '@/components/layout/brand-logo';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BRAND } from '@/lib/brand';
import { getPostLoginPath, isDriverRole, isOperatorStaffRole } from '@/lib/auth/roles';
import { setTokens } from '@/lib/auth/session-client';
import { apiRequest } from '@/lib/api/client';
import type { AuthTokens } from '@uk-phv/shared-types';

export default function DriverLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState(
    process.env.NODE_ENV === 'development' ? 'driver@phv-dev.local' : '',
  );
  const [password, setPassword] = useState(
    process.env.NODE_ENV === 'development' ? 'ChangeMe123!' : '',
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isDev = process.env.NODE_ENV === 'development';

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    void (async () => {
      try {
        const tokens = await apiRequest<AuthTokens>('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        });
        const profile = await apiRequest<{ role: string }>('/users/me', {
          token: tokens.accessToken,
        });
        if (isOperatorStaffRole(profile.role)) {
          setError('Operator staff must use the operator login page.');
          setLoading(false);
          return;
        }
        if (!isDriverRole(profile.role)) {
          setError('This login is for licensed drivers only. Passengers can sign in on the main site.');
          setLoading(false);
          return;
        }
        setTokens(tokens.accessToken, tokens.refreshToken);
        router.push(getPostLoginPath(profile.role));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Login failed');
      } finally {
        setLoading(false);
      }
    })();
  }

  return (
    <div className="flex min-h-screen">
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden p-12 text-primary-foreground lg:flex">
        <div className="absolute inset-0 -z-10">
          <Image
            src="/bg-login.png"
            alt=""
            fill
            priority
            className="object-cover object-center"
            sizes="50vw"
          />
          <div className="hero-overlay absolute inset-0" aria-hidden />
        </div>
        <BrandLogo markOnly onDark />
        <div>
          <Badge className="mb-6 border-amber-400/30 bg-amber-400/20 text-amber-100">
            Driver access
          </Badge>
          <h1 className="text-3xl font-bold leading-tight xl:text-4xl">
            Your shift, in one place
          </h1>
          <p className="mt-4 max-w-md text-primary-foreground/75">
            View assigned jobs, update journey status, and stay compliant — built for {BRAND.name}{' '}
            licensed drivers.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-primary-foreground/65">
            <li className="flex gap-3">
              <Navigation className="mt-0.5 h-4 w-4 shrink-0 text-luxury" aria-hidden />
              Turn-by-turn pickup &amp; drop-off details
            </li>
            <li className="flex gap-3">
              <Navigation className="mt-0.5 h-4 w-4 shrink-0 text-luxury" aria-hidden />
              One-tap status updates for council records
            </li>
          </ul>
        </div>
        <p className="text-sm text-primary-foreground/50">
          <Link href="/" className="underline-offset-2 hover:underline">
            ← Back to passenger site
          </Link>
          {' · '}
          <Link href="/staff/login" className="underline-offset-2 hover:underline">
            Operator login
          </Link>
        </p>
      </div>

      <div className="flex w-full flex-col justify-center px-4 py-12 lg:w-1/2 lg:px-16">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              ← Back to book a taxi
            </Link>
          </div>

          <Card className="surface-elevated border-0">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl">Driver sign in</CardTitle>
              <CardDescription>Licensed drivers assigned by your operator</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      placeholder="you@driver.co.uk"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                {error ? (
                  <div
                    className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                    role="alert"
                  >
                    {error}
                  </div>
                ) : null}
                <Button type="submit" className="w-full" size="lg" variant="luxury" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Signing in…
                    </>
                  ) : (
                    'Open driver app'
                  )}
                </Button>
              </form>
              {isDev ? (
                <p className="mt-6 text-center text-xs text-muted-foreground">
                  Dev: driver@phv-dev.local / ChangeMe123!
                </p>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
