# X Drive

**X Drive** — production-grade **UK Private Hire Vehicle (PHV) operator** dispatch platform for licensed operator compliance.

## Stack

| Layer | Technology |
|-------|------------|
| App | Next.js 15 (App Router) — UI + `/api/v1` routes |
| Database | PostgreSQL + Prisma |
| Auth | JWT + refresh tokens, RBAC |
| Realtime | Pusher Channels (optional; polling fallback) |
| Deploy | **Vercel** (single app) |
| Monorepo | pnpm workspaces, Turborepo |

## Repository structure

```
uk-phv-platform/
├── apps/web/           # Next.js full-stack (deploy this to Vercel)
│   ├── prisma/         # Schema, migrations, seed
│   └── src/app/api/v1/ # REST API
├── packages/
│   ├── shared-types/
│   └── validation/
└── docs/
```

## Quick start

See [docs/engineering/GETTING-STARTED.md](docs/engineering/GETTING-STARTED.md) and [docs/engineering/DEPLOY.md](docs/engineering/DEPLOY.md).

```bash
pnpm install
cp apps/web/.env.example apps/web/.env
# Set DATABASE_URL and JWT secrets (min 32 chars)

pnpm --filter @uk-phv/shared-types build
pnpm --filter @uk-phv/validation build
pnpm db:migrate
pnpm db:seed
pnpm dev
```

- App: http://localhost:3000  
- API: http://localhost:3000/api/v1  
- Health: http://localhost:3000/api/v1/health  

## Seed accounts

| Email | Password | Role | App entry |
|-------|----------|------|-----------|
| admin@phv-dev.local | ChangeMe123! | OPERATOR_ADMIN | `/staff/login` → dashboard, dispatch, fleet, compliance, complaints |
| dispatcher@phv-dev.local | ChangeMe123! | DISPATCHER | `/staff/login` → dispatch & fleet (no complaints UI) |
| driver@phv-dev.local | ChangeMe123! | DRIVER | `/driver/login` → home, jobs, history, profile |
| customer@phv-dev.local | ChangeMe123! | CUSTOMER | `/login` |

## Core API modules

- **auth** — login, register, refresh, logout
- **bookings** — create, list, status updates, retention
- **dispatch** — assign driver (PHV licence compliance gate)
- **drivers / vehicles** — fleet
- **complaints / safeguarding**
- **audit-logs**, **payments**, **storage**
- **admin/dashboard** — operator stats
- **Pusher** — live dispatch events for operator dashboard and driver app (optional)

## Deployment

Deploy **`apps/web`** to Vercel. Set **Root Directory** to `apps/web`. See [DEPLOY.md](docs/engineering/DEPLOY.md).

## Licence

Proprietary — operator platform software.
