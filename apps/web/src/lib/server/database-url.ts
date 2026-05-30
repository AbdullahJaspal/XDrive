/**
 * Normalizes pooled Postgres URLs (Neon, Vercel) for Prisma + Next.js.
 * @see https://www.prisma.io/docs/guides/database/neon
 */
export function normalizePooledDatabaseUrl(rawUrl: string): string {
  const url = new URL(rawUrl);
  const isNeon = url.hostname.includes('neon.tech');
  const isPooler = url.hostname.includes('pooler') || url.searchParams.has('pgbouncer');

  if (!isNeon && !isPooler) {
    return rawUrl;
  }

  if (!url.searchParams.has('sslmode')) {
    url.searchParams.set('sslmode', 'require');
  }

  // Required for Neon pooled connections with Prisma
  if (!url.searchParams.has('pgbouncer')) {
    url.searchParams.set('pgbouncer', 'true');
  }

  if (!url.searchParams.has('connect_timeout')) {
    url.searchParams.set('connect_timeout', '30');
  }

  // Prisma pool: avoid 10s default timeout during Neon cold start / dev HMR
  if (!url.searchParams.has('pool_timeout')) {
    url.searchParams.set('pool_timeout', '30');
  }

  // Limit client-side pool size (Neon recommends low limits per instance)
  if (!url.searchParams.has('connection_limit')) {
    url.searchParams.set(
      'connection_limit',
      process.env.NODE_ENV === 'production' ? '1' : '5',
    );
  }

  return url.toString();
}

export function getPooledDatabaseUrl(): string {
  const raw = process.env.DATABASE_URL;
  if (!raw) {
    throw new Error('DATABASE_URL is not set');
  }
  return normalizePooledDatabaseUrl(raw);
}
