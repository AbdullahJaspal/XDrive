# Deploy on Vercel

The platform is a **single Next.js app** (`apps/web`) with API routes, Prisma, and optional Pusher realtime.

## Prerequisites

- GitHub repository
- [Vercel](https://vercel.com) account
- PostgreSQL (recommended: [Neon](https://neon.tech) or Vercel Postgres)
- Optional: [Pusher](https://pusher.com) Channels app for live dispatch updates

## Vercel project settings

| Setting | Value |
|---------|--------|
| **Root Directory** | `apps/web` |
| **Framework** | Next.js |
| **Install Command** | `cd ../.. && pnpm install` (or use `apps/web/vercel.json`) |
| **Build Command** | `cd ../.. && pnpm exec turbo run build --filter=@uk-phv/web` |

## Environment variables

Set in Vercel → Project → Settings → Environment Variables:

| Variable | Required | Notes |
|----------|----------|--------|
| `DATABASE_URL` | Yes | Pooled Postgres URL (Neon pooler recommended) |
| `JWT_ACCESS_SECRET` | Yes | Min 32 chars |
| `JWT_REFRESH_SECRET` | Yes | Min 32 chars |
| `NEXT_PUBLIC_PUSHER_KEY` | No | Pusher public key |
| `NEXT_PUBLIC_PUSHER_CLUSTER` | No | e.g. `eu` |
| `PUSHER_APP_ID` | No | Server-side |
| `PUSHER_SECRET` | No | Server-side |

Without Pusher, the app works with **30s polling** on the dashboard.

## Database migrations

After first deploy, run migrations against production DB:

```bash
DATABASE_URL="your-production-url" pnpm db:migrate:deploy
DATABASE_URL="your-production-url" pnpm db:seed
```

Or use Neon/Vercel SQL console after `prisma migrate deploy` from CI.

## Pusher setup

1. Create a Channels app (cluster `eu` for UK).
2. Enable **private channels**.
3. In Pusher dashboard → App Keys, copy credentials to Vercel env.
4. No extra redirect URLs needed (auth via `/api/pusher/auth`).

## Verify production

- `GET https://your-app.vercel.app/api/v1/health`
- Sign in at `/login` with seed user (after `db:seed`)
- Dashboard at `/dashboard`

## Local development

```bash
pnpm install
cp apps/web/.env.example apps/web/.env
# Set DATABASE_URL
pnpm --filter @uk-phv/shared-types build
pnpm --filter @uk-phv/validation build
pnpm db:migrate
pnpm db:seed
pnpm dev
```

Open http://localhost:3000
