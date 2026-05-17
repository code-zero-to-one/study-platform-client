# Production Release Intent Usage

Production release intent is how a PR tells the production automation what semantic version bump to apply. This removes the need to set release-version environment variables for every deployment.

This applies only when code is deployed from `main`. `develop` test-server deployment keeps its existing flow.

This document follows the shared FE/BE contract in `ops/release-record-shared-contract.md`.

## Allowed labels

Use exactly one release label:

- `release:patch` - bug fix or small compatible change
- `release:minor` - compatible feature/change
- `release:major` - breaking product/API contract change

`hotfix` labels are not used. Emergency fixes still use `release:patch` unless they are minor/major by compatibility impact.

## Frontend PR

For a normal frontend-only production deployment, the PR only needs one release label, for example:

```txt
release:patch
```

On `main` deploy, the frontend workflow reads the latest `releases/prod-*.yaml`, bumps the frontend version, builds a fixed frontend image, verifies the currently inspected backend image does not differ from the latest release record, and writes a new release record with:

```yaml
components:
  frontend:
    changed: true
  backend:
    changed: false
```

If the inspected backend image differs from the latest release record, the frontend deploy fails. The backend deployment must be recorded first through `backend-prod-deployed` dispatch.

## Backend PR

Backend PRs also use exactly one release label, but backend metadata is not copied into a frontend PR body. After backend prod deploy succeeds, backend automation sends the `backend-prod-deployed` payload documented in `ops/backend-release-dispatch.md`.

The frontend repository then records `FE(current) + BE(new)` with:

```yaml
components:
  frontend:
    changed: false
  backend:
    changed: true
```

## First recorded frontend release bootstrap

The first frontend release record has no previous YAML to inherit backend and rollback metadata from. For that one frontend PR only, include `bootstrap: approved` and the full production combination in the PR body:

```md
## Release Intent
release: patch
summary: First recorded production release
bootstrap: approved
base_version: v1.0.0
backend_image: zerooneitkr/zeroone-backend:v1.0.0-b7c8d9e
backend_commit: b7c8d9e
backend_version: v1.0.0
rollback_frontend_image: zerooneitkr/zeroone-frontend:v0.6.3-a1b2c3d
rollback_backend_image: zerooneitkr/zeroone-backend:v0.6.3-e4f5g6h
db_changed: false
db_migration_version: V12
db_migration_files:
db_rollback_note: DB rollback is not automated. Confirm app compatibility with the recorded DB state.
```

Bootstrap is an explicit exception path. Without `bootstrap: approved`, first-record generation fails.

## PR body release fallback

If labels are not available, a frontend PR can use:

```md
release: patch
summary: QnA image key fix production release
```

If a label and body `release` disagree, the workflow fails. If more than one `release:*` label exists, the workflow fails.
