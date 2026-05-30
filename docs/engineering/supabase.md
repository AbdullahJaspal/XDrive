# Supabase setup

Use Supabase as the **hosted PostgreSQL** database for this project. The NestJS API and Prisma stay the same — only the database connection changes. You do **not** need Docker or local Postgres.

Supabase does **not** replace Redis. Keep local Redis (`brew install redis && brew services start redis`) or use Upstash for production realtime caching.

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a project.
2. Choose a region close to your users (e.g. `eu-west-2` for UK).
3. Save the database password when prompted.

## 2. Get connection strings

In the Supabase dashboard: **Project Settings → Database → Connection string**

You need **two** URLs:

| Variable | Supabase setting | Used for |
|----------|------------------|----------|
| `DATABASE_URL` | **Transaction** pooler, port **6543**, add `?pgbouncer=true` | API runtime (Prisma queries) |
| `DIRECT_URL` | **Session** pooler or **Direct** connection, port **5432** | `pnpm db:migrate`, `pnpm db:seed` |

Example (replace placeholders):

```env
DATABASE_URL=postgresql://postgres.abcdefgh:YOUR_PASSWORD@aws-0-eu-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.abcdefgh:YOUR_PASSWORD@aws-0-eu-west-2.pooler.supabase.com:5432/postgres
```

Set these in **both** `.env` (repo root) and `apps/api/.env`.

## 3. Run migrations and seed

No Docker required:

```bash
pnpm --filter @uk-phv/shared-types build
pnpm --filter @uk-phv/validation build
pnpm --filter @uk-phv/logger build

pnpm db:generate
pnpm db:migrate    # migration name: init
pnpm db:seed
pnpm dev
```

## 4. Verify

```bash
curl -s http://localhost:4000/api/v1/health | jq
curl -s -X POST http://localhost:4000/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@phv-dev.local","password":"ChangeMe123!"}' | jq
```

Tables appear in Supabase **Table Editor** after migrate + seed.

## What Supabase replaces vs what stays

| Component | With Supabase |
|-----------|---------------|
| PostgreSQL | Supabase hosted DB |
| NestJS API | Unchanged — business logic, RBAC, compliance |
| Prisma | Unchanged — schema + migrations |
| Auth | NestJS JWT (not Supabase Auth) — keeps RBAC/audit model |
| Realtime dispatch | Socket.io + Redis (not Supabase Realtime) |
| File uploads | Local/S3 for now; Supabase Storage optional later |

## Optional: Supabase Storage

For compliance document uploads, you can point `STORAGE_DRIVER` at Supabase Storage (S3-compatible) in a later phase. The API storage module is already structured for S3-compatible backends.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Migrate fails with pooler error | Use `DIRECT_URL` on port 5432, not the 6543 pooler |
| `prepared statement` errors | Ensure `?pgbouncer=true` on `DATABASE_URL` |
| Connection timeout | Check Supabase project is not paused (free tier) |
| Tables empty after migrate | Run `pnpm db:seed` |
