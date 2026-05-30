# Getting Started

Run from the repo root.

## 1. Install

```bash
pnpm install
```

## 2. Environment

```bash
cp apps/web/.env.example apps/web/.env
```

Edit `apps/web/.env`:

- `DATABASE_URL` — PostgreSQL (local, Neon, or Vercel Postgres)
- `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` — min 32 characters
- Optional Pusher keys for live dashboard updates

## 3. Build shared packages

```bash
pnpm --filter @uk-phv/shared-types build
pnpm --filter @uk-phv/validation build
```

## 4. Database

```bash
pnpm db:migrate    # name: init
pnpm db:seed
```

## 5. Run

```bash
pnpm dev
```

- http://localhost:3000  
- Sign in: http://localhost:3000/login (`admin@phv-dev.local` / `ChangeMe123!`)  
- API health: http://localhost:3000/api/v1/health  

## Deploy

See [DEPLOY.md](./DEPLOY.md) for Vercel + Neon + Pusher.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Prisma client missing | `pnpm db:generate` |
| JWT error on start | Check secret length ≥ 32 in `apps/web/.env` |
| No live updates | Add Pusher env vars or rely on 30s dashboard polling |
