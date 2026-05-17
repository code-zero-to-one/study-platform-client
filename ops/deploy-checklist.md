# Production Deploy Checklist

This checklist applies to `main` production deployments only. `develop` test-server deployment keeps the existing lightweight pointer-tag flow.

## Before production deploy

- Confirm PR CI is green before merging to `main`.
- Confirm frontend version source (`package.json.version`) is intentional.
- Confirm the production backend image/API metadata is available to the workflow:
  - preferred: current production backend container labels/inspect output
  - fallback: GitHub variables/secrets documented in `ops/version-management.md`
- Confirm DB migration metadata is known when backend/database changed.
- Confirm rollback targets are fixed image tags, not `prod` or `latest-prod`.

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
