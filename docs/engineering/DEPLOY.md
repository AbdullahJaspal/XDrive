# Deploy on Vercel

The platform is a **single Next.js app** (`apps/web`) with API routes, Prisma, and optional Pusher realtime.

## Prerequisites

- GitHub repository
- [Vercel](https://vercel.com) account
- PostgreSQL (recommended: [Neon](https://neon.tech) or Vercel Postgres)
- Optional: [Pusher](https://pusher.com) Channels app for live dispatch updates

## Vercel project settings

| Setting             | Value                                                        |
| ------------------- | ------------------------------------------------------------ |
| **Root Directory**  | `apps/web`                                                   |
| **Framework**       | Next.js                                                      |
| **Install Command** | `cd ../.. && pnpm install` (or use `apps/web/vercel.json`)   |
| **Build Command**   | `cd ../.. && pnpm exec turbo run build --filter=@uk-phv/web` |

## Environment variables

Set in Vercel → Project → Settings → Environment Variables:

| Variable                     | Required | Notes                                                       |
| ---------------------------- | -------- | ----------------------------------------------------------- |
| `DATABASE_URL`               | Yes      | Pooled Postgres URL (Neon pooler recommended)               |
| `JWT_ACCESS_SECRET`          | Yes      | Min 32 chars                                                |
| `JWT_REFRESH_SECRET`         | Yes      | Min 32 chars                                                |
| `NEXT_PUBLIC_PUSHER_KEY`     | No       | Pusher public key                                           |
| `NEXT_PUBLIC_PUSHER_CLUSTER` | No       | e.g. `eu`                                                   |
| `PUSHER_APP_ID`              | No       | Server-side                                                 |
| `PUSHER_SECRET`              | No       | Server-side                                                 |
| `RESEND_API_KEY`             | No       | Resend API key for booking notification emails              |
| `EMAIL_FROM`                 | No\*     | Verified sender, e.g. `info@xdrive.uk.com`                  |
| `BOOKING_NOTIFICATION_EMAIL` | No       | Inbox for new bookings; defaults to operator `contactEmail` |
| `NEXT_PUBLIC_SITE_URL`       | No       | Used in booking emails for dashboard link                   |

\* Required with `RESEND_API_KEY` if you want booking emails sent.

Without Pusher, the app works with **30s polling** on the dashboard.
Without Resend, bookings still work — only email notifications are skipped.

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

## Booking email setup (Resend)

Cloudflare Email Routing receives mail at your domain; **Resend sends** the automated booking alerts.

1. Create a [Resend](https://resend.com) account (free tier: ~3,000 emails/month).
2. Add domain `xdrive.uk.com` (or your domain) and copy the **SPF** and **DKIM** DNS records into Cloudflare.
3. Create an API key in Resend → **API Keys**.
4. Set in Vercel (and `apps/web/.env` locally):

```env
RESEND_API_KEY=re_xxxxxxxx
EMAIL_FROM=info@xdrive.uk.com
BOOKING_NOTIFICATION_EMAIL=info@xdrive.uk.com
NEXT_PUBLIC_SITE_URL=https://your-production-domain
```

5. Place a test booking on the site — you should receive an email at `haroonjaspal50505@gmail.com` via Cloudflare forwarding.

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
