# Production Deploy Checklist

This checklist applies to `main` production deployments only. `develop` test-server deployment keeps the existing lightweight pointer-tag flow.

## Before production deploy

- Confirm PR CI is green before merging to `main`.
- Confirm the PR has exactly one release intent: `release:patch`, `release:minor`, `release:major`, or a `release: ...` line in the PR body.
- Confirm `ops/release-intent.md` bootstrap approval fields are present if this is the first recorded frontend production release.
- For frontend-only deploys, confirm latest `releases/` backend image matches current production backend; if not, record the backend dispatch first.
- Confirm rollback targets and inherited/supplied backend images are fixed image tags, not `prod` or `latest-prod`.

## Deployment order

1. DB migration
2. Backend
3. Backend health check
4. Frontend
5. E2E/smoke check

## After production deploy

- Confirm frontend container is running with the fixed frontend image tag.
- Confirm backend health/API compatibility.
- Confirm `releases/prod-YYYYMMDD-HHmm.yaml` was committed to `main`.
- Confirm the release record includes frontend, backend, database, rollback, deploy order, deployed time, actor, and `status: success`.
