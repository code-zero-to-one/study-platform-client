# ZERO-ONE Version Management Rule - Frontend Repository

This document is the frontend repository source of truth for ZERO-ONE production release records. It is a version-management rule, not a frontend coding-style rule.

This document follows the shared FE/BE contract in `ops/release-record-shared-contract.md`.

- Do not direct-push commits to `main` or bypass the PR path. Production deploy/release recording depends on the PR and its `release:major|minor|patch` label.

## Responsibility

- `study-platform-client` owns the final production release record because it is the user-facing application and the running product depends on a compatible frontend/backend/database combination.
- `releases/` is the final release-record location for production combinations.
- A production release record must include frontend image, backend image, database migration state, rollback target, release id, deploy order, deployment time, deploy actor, and status.
- Backend deployments must provide the backend image tag, commit, version, and DB migration information that belongs in this repository's release record. Backend-specific compatibility rules live in the backend repository, not here.

## Release ID

Release IDs include date/time. Image tags do not.

```txt
prod-YYYYMMDD-HHmm
```

Example:

```txt
prod-20260517-2100
```

## Image tag policy

Image tags must be immutable and must not contain dates.

Canonical service image formats:

```txt
zeroone-frontend:v{MAJOR}.{MINOR}.{PATCH}-{shortCommit}
zeroone-backend:v{MAJOR}.{MINOR}.{PATCH}-{shortCommit}
```


A registry namespace may prefix the image name in workflow/deployment records, for example `zerooneitkr/zeroone-frontend:v1.0.0-f1a2b3c`, but the tag itself must still follow the immutable format above.

`prod` and `latest-prod` are deployment convenience pointers only. They must never be used as rollback targets.

## Production deploy order

Production deployment order is:

1. `db_migration`
2. `backend`
3. `backend_health_check`
4. `frontend`
5. `e2e_check`

For a frontend-only production deployment, the workflow must still record the currently deployed backend image/API and database migration state before writing the release record.

## Release record schema

Production release records live at:

```txt
releases/prod-YYYYMMDD-HHmm.yaml
```

Required shape:

```yaml
release_id: prod-20260517-2100
env: prod
service_version: v1.0.0

summary: Production frontend deployment

components:
  frontend:
    repo: study-platform-client
    image: zerooneitkr/zeroone-frontend:v1.0.0-f1a2b3c
    commit: f1a2b3c
    version: v1.0.0
    changed: true

  backend:
    repo: study-platform-mvp
    image: zerooneitkr/zeroone-backend:v1.0.0-b7c8d9e
    commit: b7c8d9e
    version: v1.0.0
    changed: false

database:
  changed: false
  migration_version: V12
  migration_files: []

rollback:
  app_rollback_target:
    frontend: zerooneitkr/zeroone-frontend:v0.6.3-a1b2c3d
    backend: zerooneitkr/zeroone-backend:v0.6.3-e4f5g6h
  db_rollback_note: DB rollback is not automated. Confirm app compatibility with the recorded DB state.

deploy_order:
  - db_migration
  - backend
  - backend_health_check
  - frontend
  - e2e_check

deployed_at: 2026-05-17T21:00:00+09:00
deployed_by: github-actions
status: success
```

## Incident and rollback rule

Incident analysis starts by identifying:

- current `release_id`
- frontend image
- backend image
- DB migration version/files
- rollback targets from the latest successful release record

Rollback decisions must use the fixed image tags in `rollback.app_rollback_target`, not `prod` or `latest-prod`.

## Main-branch release intent

Production versioning is derived from PR intent, not from per-release environment variables.

Allowed release intents are exactly:

- `release:patch`
- `release:minor`
- `release:major`

`hotfix` labels and `-hotfix.N` image tags are not used.

## Frontend-only production release

When a frontend PR is merged to `main`, `.github/workflows/deploy-prod.yml` builds and deploys the frontend image, then records the final production combination.

The workflow uses the latest `releases/prod-*.yaml` as the backend/DB source of truth. It records:

```yaml
components:
  frontend:
    changed: true
  backend:
    changed: false
```

If the production backend container can be inspected and its image differs from the latest release record, the frontend workflow fails. This prevents writing a release record with stale backend metadata.

## Backend-only production release

When backend production deploy succeeds, backend automation must trigger the frontend repository with `repository_dispatch` event type `backend-prod-deployed`.

The frontend workflow `.github/workflows/record-backend-prod-release.yml` receives the backend deploy fact, validates it, reads the current frontend production state from the latest release record, and records:

```yaml
components:
  frontend:
    changed: false
  backend:
    changed: true
```

The backend dispatch payload contract is documented in `ops/backend-release-dispatch.md`.

## Duplicate and failure rules

- `metadata.backend_deploy_id` is required for backend dispatch records.
- The same `metadata.backend_deploy_id` must not be recorded twice.
- `prod` and `latest-prod` are pointer tags only and are rejected as backend, frontend, or rollback image values.
- If payload/schema/current-state validation fails, the workflow must fail rather than guess.

## Bootstrap rule

The first recorded frontend release has no previous state to inherit from. It must be explicitly approved with `bootstrap: approved` in the frontend PR body and must include fixed frontend/backend rollback image tags plus current backend metadata.

Backend dispatch records require an existing release record so the frontend repository can identify the current frontend production state.

`PROD_E2E_BASE_URL` is the only optional repository variable used by this rule; it controls the production smoke/E2E URL. It is not version metadata.
