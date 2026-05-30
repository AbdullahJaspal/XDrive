# Engineering Standards

## Code quality

- TypeScript strict mode across all packages
- ESLint 9 flat config via `@uk-phv/config-eslint`
- Prettier with Tailwind plugin
- Husky pre-commit: lint-staged
- Commitlint: conventional commits

## API standards

### Success response

```json
{
  "success": true,
  "data": {},
  "meta": {
    "requestId": "uuid",
    "timestamp": "ISO-8601",
    "version": "1.0.0"
  }
}
```

### Error response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human readable",
    "details": [{ "field": "email", "code": "VALIDATION", "message": "..." }]
  },
  "meta": { "requestId": "...", "timestamp": "...", "version": "1.0.0" }
}
```

### Error codes

`VALIDATION_ERROR`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`, `BUSINESS_RULE`, `COMPLIANCE_BLOCKED`, `INTERNAL_ERROR`

## Logging

- Pino via `@uk-phv/logger`
- JSON logs in production (`LOG_FORMAT=json`)
- Redact: password, token, authorization headers
- Include `requestId` on HTTP logs

## Error handling

- Throw `AppError` in services
- Never catch-and-swallow without logging
- Compliance failures use 422 + `COMPLIANCE_BLOCKED`

## Audit logging

Log all regulated actions via `AuditLogsService`:

- Resource types: `booking`, `driver`, `vehicle`, `complaint`, `safeguarding_report`
- Actions: CREATE, UPDATE, DELETE, DISPATCH, EXPORT, LOGIN

## File uploads

- Max 10MB, MIME allowlist
- Storage keys: `{entityType}/{entityId}/{uuid}-{filename}`
- Metadata in `stored_files` table

## Notifications

1. Persist `notifications` row (PENDING)
2. Dispatch to provider
3. Update status SENT / FAILED

## Environment validation

Zod schemas in `apps/api/src/config/*.config.ts` — fail fast on boot if invalid.

## Testing strategy

| Level | Scope |
|-------|-------|
| Unit | Services with mocked repos |
| Integration | Repositories + test DB |
| E2E | Auth, booking, dispatch compliance |
| Contract | shared-types compatibility |

## Git workflow

- `main` — production
- `develop` — integration
- Feature branches: `feat/api-booking-export`
