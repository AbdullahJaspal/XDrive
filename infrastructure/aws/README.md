# AWS Architecture (Target)

## Recommended production topology

| Service | AWS product |
|---------|-------------|
| API | ECS Fargate or App Runner |
| Web | CloudFront + S3 (or keep Vercel) |
| Database | RDS PostgreSQL (Multi-AZ) |
| Cache | ElastiCache Redis |
| Files | S3 + SSE-KMS |
| Secrets | Secrets Manager |
| Logs | CloudWatch Logs |

## Networking

- VPC with private subnets for RDS/Redis
- ALB terminating TLS for API
- Security groups: API → RDS/Redis only

## Environment variables

Mirror Railway/Vercel secrets into Secrets Manager; inject at task runtime.

## IaC

Terraform modules planned in Phase 4 — see roadmap.
