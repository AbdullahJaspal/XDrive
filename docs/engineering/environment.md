# Environment variables

## Root `.env`

Used by Docker Compose references and shared tooling. Copy from `.env.example`.

## `apps/api/.env`

Required for the NestJS API. Minimum variables:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection string |
| `JWT_ACCESS_SECRET` | Min 32 chars |
| `JWT_REFRESH_SECRET` | Min 32 chars |
| `API_CORS_ORIGINS` | Comma-separated web origins |

## `apps/web`

Uses Next.js public env vars (set in Vercel or `.env.local`):

- `NEXT_PUBLIC_API_URL` — e.g. `http://localhost:4000/api/v1`
- `NEXT_PUBLIC_WS_URL` — e.g. `http://localhost:4000`

## Production

- Railway: API + Postgres + Redis env groups
- Vercel: web public URLs pointing to Railway API
- Never commit real secrets; rotate JWT keys on compromise
