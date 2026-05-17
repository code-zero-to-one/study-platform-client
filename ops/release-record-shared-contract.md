# ZERO-ONE Release Record Shared Contract

This is the shared production release-record contract between `study-platform-mvp` backend and `study-platform-client` frontend.

It fixes two schemas:

1. the backend-to-frontend release payload schema, and
2. the final frontend repository release record schema.

The final release-record source of truth is:

```txt
study-platform-client/releases/
```

## 1. Roles

### Backend

Backend is the release fact producer. It deploys production backend, resolves backend version/image, DB migration metadata, and backend rollback target, then sends that fact to the frontend workflow.

### Frontend

Frontend is the final release record writer. It validates backend facts, reads the current frontend production state, and records the final FE/BE/DB production combination.

## 2. Release intent

Exactly one release intent is allowed:

- `release:major`
- `release:minor`
- `release:patch`

`hotfix` labels and `-hotfix.N` image tags are not used.

## 3. Identifiers

### Service version

```txt
vMAJOR.MINOR.PATCH
```

### Image tags

Image tags must not contain dates.

```txt
zeroone-frontend:vMAJOR.MINOR.PATCH-shortCommit
zeroone-backend:vMAJOR.MINOR.PATCH-shortCommit
```

A registry prefix is allowed, for example `zerooneitkr/zeroone-backend:v1.4.3-b7c8d9e`.

### Release ID

Date/time belongs only in `release_id`.

```txt
prod-YYYYMMDD-HHmm
```

### Mutable tags

`prod` and `latest-prod` are deployment pointers only. They are never valid rollback targets.

## 4. Backend to frontend dispatch contract

Backend production deploy success triggers the frontend repository workflow using `repository_dispatch`.

- target repository: `code-zero-to-one/study-platform-client`
- event type: `backend-prod-deployed`

### Dispatch wrapper

```json
{
  "event_type": "backend-prod-deployed",
  "client_payload": {
    "release_id": "prod-20260517-2100",
    "env": "prod",
    "summary": "[patch] Backend release summary",
    "backend": {
      "repo": "study-platform-mvp",
      "image": "zeroone-backend:v1.4.3-b7c8d9e",
      "commit": "b7c8d9e",
      "version": "v1.4.3",
      "changed": true
    },
    "database": {
      "changed": true,
      "migration_version": "V45",
      "migration_files": [
        "src/main/resources/db/migration/V45__create_course_refund.sql"
      ]
    },
    "rollback": {
      "backend": "zeroone-backend:v1.4.2-a1b2c3d"
    },
    "metadata": {
      "release_intent": "patch",
      "bootstrap_mode": false,
      "previous_deploy_image": "zeroone-backend:v1.4.2-a1b2c3d",
      "pull_request_number": 1234,
      "pull_request_labels": ["release:patch", "db:backup-confirmed"],
      "backend_deploy_id": "backend-prod-123"
    }
  }
}
```

The frontend script also accepts the inner `client_payload` object directly when GitHub Actions already selected `github.event.client_payload`.

### Required payload fields

- `release_id`
- `env`
- `backend.repo`
- `backend.image`
- `backend.commit`
- `backend.version`
- `backend.changed`
- `database.changed`
- `database.migration_version`
- `database.migration_files`
- `rollback.backend`
- `metadata.release_intent`
- `metadata.bootstrap_mode`
- `metadata.backend_deploy_id`

### Optional payload fields

- `summary`
- `metadata.previous_deploy_image`
- `metadata.pull_request_number`
- `metadata.pull_request_labels`

### Field semantics

- `database.migration_version`: representative migration version. Use `N/A` when there is no migration.
- `database.migration_files`: migration file list. Use `[]` when there is no migration.
- `metadata.backend_deploy_id`: backend deploy dedupe key. Frontend must not record the same backend deployment twice as a new backend-only fact.

## 5. Final release record contract

Records are written to:

```txt
releases/<release_id>.yaml
```

### Backend-origin record example

```yaml
release_id: prod-20260517-2100
env: prod
service_version: v1.4.3

summary: backend patch release

components:
  frontend:
    repo: study-platform-client
    image: zeroone-frontend:v1.4.2-f1a2b3c
    commit: f1a2b3c
    version: v1.4.2
    changed: false

  backend:
    repo: study-platform-mvp
    image: zeroone-backend:v1.4.3-b7c8d9e
    commit: b7c8d9e
    version: v1.4.3
    changed: true

database:
  changed: true
  migration_version: V45
  migration_files:
    - src/main/resources/db/migration/V45__create_course_refund.sql

rollback:
  app_rollback_target:
    frontend: zeroone-frontend:v1.4.2-f1a2b3c
    backend: zeroone-backend:v1.4.2-a1b2c3d
  db_rollback_note: Verify compatibility before app rollback if DB changed.

deploy_order:
  - db_migration
  - backend
  - backend_health_check
  - frontend
  - e2e_check

deployed_at: 2026-05-17T21:00:00+09:00
deployed_by: automation
status: success

metadata:
  backend_deploy_id: backend-prod-123
  release_intent: patch
  bootstrap_mode: false
```

### Required final fields

- `release_id`
- `env`
- `service_version`
- `components.frontend.image`
- `components.frontend.commit`
- `components.frontend.version`
- `components.frontend.changed`
- `components.backend.image`
- `components.backend.commit`
- `components.backend.version`
- `components.backend.changed`
- `database.changed`
- `database.migration_version`
- `database.migration_files`
- `rollback.app_rollback_target.frontend`
- `rollback.app_rollback_target.backend`
- `deploy_order`
- `deployed_at`
- `deployed_by`
- `status`

Additionally:

- if `components.backend.changed: true`, `metadata.backend_deploy_id`, `metadata.release_intent`, and `metadata.bootstrap_mode` are required.
- if `components.frontend.changed: true`, `metadata.frontend_deploy_id` is required.
- if a frontend deployment intentionally pairs with a previous backend deploy fact, `metadata.paired_backend_deploy_id` must equal `metadata.backend_deploy_id`.

## 6. Atomic release record rules

The release record must describe the actual production FE/BE combination at that point in time.

### Backend-only

```yaml
components:
  frontend:
    changed: false
  backend:
    changed: true
```

### Frontend-only

```yaml
components:
  frontend:
    changed: true
  backend:
    changed: false
```

### Paired FE/BE change

When frontend deploy intentionally pairs with a previously recorded backend deploy id:

```yaml
components:
  frontend:
    changed: true
  backend:
    changed: true
metadata:
  backend_deploy_id: backend-prod-123
  paired_backend_deploy_id: backend-prod-123
```

The paired mode must be explicit. Frontend must not guess.

## 7. Validation and failure rules

Frontend fails instead of writing a release record when:

- payload is missing,
- schema mismatches,
- image/version/release_id is invalid,
- rollback image is missing or mutable,
- DB field shape is invalid,
- backend deploy id is missing for backend-origin records,
- duplicate backend-only deploy id is detected,
- current frontend state cannot be identified for backend-origin records.

Wrong release records are worse than failed automation.

## 8. Bootstrap

If current production is not yet on canonical image tags, backend may use bootstrap mode only with explicit `bootstrap:approved` approval on the backend side.

Bootstrap version calculation:

- `release:patch` -> `v0.0.1`
- `release:minor` -> `v0.1.0`
- `release:major` -> `v1.0.0`

Frontend records backend bootstrap facts with `metadata.bootstrap_mode: true`.
