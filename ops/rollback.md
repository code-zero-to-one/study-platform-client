# Production Rollback Guide

Rollback is based on fixed image tags recorded in `releases/`, never on pointer tags.

## Required inputs

1. Current failed `release_id`.
2. Latest known-good release record under `releases/`.
3. `rollback.app_rollback_target.frontend` fixed image tag.
4. `rollback.app_rollback_target.backend` fixed image tag.
5. `rollback.db_rollback_note` and DB compatibility confirmation.

## Rules

- Do not rollback to `prod` or `latest-prod`.
- Rollback frontend/backend as a compatible combination unless the incident analysis proves only one side changed safely.
- Do not run destructive DB rollback automatically.
- If DB migration compatibility is uncertain, stop and verify before changing app images.

## Minimal rollback flow

1. Open the latest successful release YAML before the failed release.
2. Copy fixed image tags from `rollback.app_rollback_target`.
3. Deploy the fixed frontend/backend images.
4. Run backend health check.
5. Run frontend smoke/E2E check.
6. Record the rollback outcome in a follow-up release/incident note.
