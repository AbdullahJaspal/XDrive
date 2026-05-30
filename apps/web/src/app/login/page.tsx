'use client';

import { Loader2, Lock, Mail, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { PageShell } from '@/components/layout/page-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getPostLoginPath, isStaffRole } from '@/lib/auth/roles';
import { clearTokens, setTokens } from '@/lib/auth/session-client';
import { apiRequest } from '@/lib/api/client';
import type { AuthTokens } from '@uk-phv/shared-types';

type Mode = 'signin' | 'register';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isDev = process.env.NODE_ENV === 'development';

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    void (async () => {
      try {
        let tokens: AuthTokens;
        if (mode === 'register') {
          tokens = await apiRequest<AuthTokens>('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email, password, firstName, lastName }),
          });
        } else {
          tokens = await apiRequest<AuthTokens>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
          });
        }
        setTokens(tokens.accessToken, tokens.refreshToken);

        const profile = await apiRequest<{ role: string }>('/users/me', {
          token: tokens.accessToken,
        });
        if (isStaffRole(profile.role)) {
          clearTokens();
          setError('Operator accounts must use the staff login page.');
          return;
        }
        router.push(getPostLoginPath(profile.role));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setLoading(false);
      }
    })();
  }

  return (
    <PageShell>
      <div className="mx-auto flex max-w-md flex-col px-4 py-12 sm:py-16">
        <div className="mb-8 text-center">
          <p className="label-caps text-luxury">Guest account</p>
          <h1 className="mt-2 font-display text-4xl font-medium">
            {mode === 'signin' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {mode === 'signin'
              ? 'Sign in to view your trips and booking history.'
              : 'Register to track bookings and book faster next time.'}
          </p>
        </div>

        <div className="mb-6 flex rounded-lg bg-muted p-1">
          <button
            type="button"
            className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
              mode === 'signin' ? 'bg-card shadow-sm' : 'text-muted-foreground'
            }`}
            onClick={() => {
              setMode('signin');
            }}
          >
            Sign in
          </button>
          <button
            type="button"
            className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
              mode === 'register' ? 'bg-card shadow-sm' : 'text-muted-foreground'
            }`}
            onClick={() => {
              setMode('register');
            }}
          >
            Register
          </button>
        </div>

        <Card className="surface-elevated border-0">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">
              {mode === 'signin' ? 'Sign in' : 'Register'}
            </CardTitle>
            <CardDescription>
              Operator staff should use the{' '}
              <Link href="/staff/login" className="text-primary underline-offset-2 hover:underline">
                operator login
              </Link>
              .
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First name</Label>
                    <Input
                      id="firstName"
                      required
                      value={firstName}
                      onChange={(e) => {
                        setFirstName(e.target.value);
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last name</Label>
                    <Input
                      id="lastName"
                      required
                      value={lastName}
                      onChange={(e) => {
                        setLastName(e.target.value);
                      }}
                    />
                  </div>
                </div>
              ) : null}
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
                    onChange={(e) => {
                      setEmail(e.target.value);
                    }}
                    className="pl-10"
                    placeholder="you@example.com"
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
                    autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                    }}
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
              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Please wait…
                  </>
                ) : mode === 'signin' ? (
                  'Sign in'
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    Create account
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            ← Back to booking
          </Link>
        </p>

        {isDev ? (
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Dev: register a new account or use operator credentials at /staff/login
          </p>
        ) : null}
      </div>
    </PageShell>
  );
}
