# Development Roadmap

## Phase 0 — Foundation ✅

- [x] Monorepo (pnpm + Turborepo)
- [x] Shared types, validation, logger
- [x] NestJS API module structure
- [x] Prisma schema (compliance-ready)
- [x] Next.js web shell + shadcn base
- [x] Docker Compose (Postgres, Redis)
- [x] Cursor rules + sub-agent definitions
- [x] RBAC, audit, realtime gateway

## Phase 1 — Core operations (Weeks 1–4)

- [ ] Complete customer booking UI (maps, fare estimate)
- [ ] Operator dispatch board (realtime)
- [ ] Driver onboarding + licence upload
- [ ] Vehicle CRUD + PHV licence tracking
- [ ] Email verification + password reset
- [ ] Socket JWT authentication

## Phase 2 — Compliance & reporting (Weeks 5–8)

- [ ] Licence expiry cron → EXPIRING_SOON / EXPIRED
- [ ] Booking register CSV/PDF export for council
- [ ] Complaint workflow (assign, escalate, resolve)
- [ ] Safeguarding escalation notifications
- [ ] GDPR data export / erasure tooling
- [ ] Retention archival job

## Phase 3 — Integrations (Weeks 9–12)

- [ ] Stripe PaymentIntent + webhooks
- [ ] Twilio SMS booking confirmations
- [ ] Google Maps Directions + geocoding
- [ ] S3 file storage (production)
- [ ] Push notifications (web PWA or future native client)

## Phase 4 — Production hardening (Weeks 13–16)

- [ ] Rate limiting + WAF
- [ ] CI/CD (GitHub Actions → Vercel + Railway)
- [ ] Observability (OpenTelemetry, dashboards)
- [ ] Load testing dispatch peak
- [ ] Penetration test remediation
- [ ] Multi-operator tenancy UI

## Phase 5 — Scale (Future)

- [ ] Auto-dispatch algorithm
- [ ] Customer native app (optional; web-first)
- [ ] Analytics & operator insights
- [ ] API partner integrations
