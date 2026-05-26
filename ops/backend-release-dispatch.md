# Backend Production Release Dispatch Contract

This is the frontend repository contract for backend production deployments. Backend automation is the producer of backend deploy facts. The frontend repository is the final release-record writer.

This document follows the shared FE/BE contract in `ops/release-record-shared-contract.md`.

## Trigger

Backend production deploy success must call the frontend repository with `repository_dispatch` or an equivalent API trigger.

```json
{
  "event_type": "backend-prod-deployed",
  "client_payload": {
    "release_id": "prod-20260517-2100",
    "env": "prod",
    "summary": "backend patch release",
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

The frontend workflow that receives this event is:

```txt
.github/workflows/record-backend-prod-release.yml
```

## Required `client_payload`

```json
{
  "release_id": "prod-20260517-2100",
  "env": "prod",
  "summary": "backend patch release",
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
```

## Required fields

- `release_id` - `prod-YYYYMMDD-HHmm`
- `env` - must be `prod`
- `backend.image` - fixed immutable backend image tag
- `backend.commit` - backend short commit
- `backend.version` - `vMAJOR.MINOR.PATCH`
- `backend.changed` - must be `true`
- `database.changed` - boolean
- `database.migration_version` - migration version or `N/A`
- `database.migration_files` - array
- `rollback.backend` - fixed immutable backend rollback image tag
- `metadata.release_intent` - `patch`, `minor`, or `major`
- `metadata.bootstrap_mode` - boolean
- `metadata.backend_deploy_id` - unique backend deployment id

## Optional fields

- `summary`
- `metadata.previous_deploy_image` - backend Jenkins resolves the image behind the registry `latest-prod`/`prod` pointer before the new deploy
- `metadata.pull_request_number`
- `metadata.pull_request_labels`

## Frontend behavior

When the dispatch arrives, the frontend repository workflow:

1. validates the payload strictly,
2. reads the latest `releases/prod-*.yaml` to identify current frontend production state,
3. creates a new release record with `frontend.changed=false` and `backend.changed=true`,
4. writes `metadata.backend_deploy_id`,
5. fails if the same `backend_deploy_id` is already recorded,
6. fails if image tags use `prod`, `latest-prod`, dates, or non-canonical versions.

The workflow does not deploy frontend code. It only records the new atomic production combination `FE(current) + BE(new)`.

## Failure principle

Do not guess. If the payload is missing, invalid, duplicated, or the frontend repository has no previous release record to identify current frontend production state, the workflow must fail instead of writing a wrong release record.
