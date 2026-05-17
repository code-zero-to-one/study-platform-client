# ZERO-ONE Version Management Agent Skill SSOT

Use this skill when working on production release records, release intent labels/body, `main` production deployment workflow, rollback metadata, or `releases/prod-*.yaml` in `study-platform-client`.

This file is the shared skill source of truth. Codex and Claude wrappers must stay thin and point here instead of duplicating the workflow.

## Required reading order

1. `ops/version-management.md` - repository rule and release-record policy.
2. `ops/release-intent.md` - human usage for PR labels/body and bootstrap.
3. `ops/deploy-checklist.md` or `ops/rollback.md` only when deploying or rolling back.
4. Relevant scripts/workflows only after the docs above:
   - `.github/workflows/deploy-prod.yml`
   - `.github/workflows/release-record-check.yml`
   - `scripts/release/resolve-prod-release-intent.mjs`
   - `scripts/release/generate-prod-release-record.mjs`
   - `scripts/release/generate-backend-prod-release-record.mjs`
   - `scripts/release/validate-release-record.mjs`
   - `ops/backend-release-dispatch.md`

## Non-negotiable rules

- This skill applies to `main` production releases only. Do not change `develop` deployment behavior unless the user explicitly asks.
- `releases/` is the frontend repository source of truth for successful production FE/BE/DB/rollback combinations.
- Frontend repo owns only the frontend version-management rule. Do not add the backend repository rule here.
- Production version metadata comes from PR intent or backend dispatch payload, not per-release repository variables.
- Exactly one release intent is allowed: `release:major`, `release:minor`, or `release:patch`.
- If multiple `release:*` labels are present, or label intent conflicts with body `release`, fail instead of guessing.
- First recorded frontend production release requires explicit bootstrap approval metadata in the PR body: `bootstrap: approved`, `base_version` or `version`, backend image/commit/version, and rollback frontend/backend fixed image tags.
- `prod` and `latest-prod` are pointer tags only. They are never valid rollback targets and must fail if used as inherited or supplied backend/rollback images.
- Image dates belong in `release_id`, not image tags.

## Implementation workflow for agents

1. Inspect current branch and changed files.
2. Read the docs in the required reading order.
3. For workflow/script changes, add deterministic checks for:
   - first-release bootstrap without accidental defaulting,
   - duplicate release label failure,
   - pointer-tag rejection,
   - docs/examples matching supported script keys,
   - backend dispatch schema validation,
   - duplicate `metadata.backend_deploy_id` rejection.
4. Validate with targeted commands first:
   - `node --check scripts/release/resolve-prod-release-intent.mjs`
   - local resolver smoke cases for bootstrap, duplicate labels, pointer tags, and normal latest-release inheritance.
   - `node scripts/release/validate-release-record.mjs releases`
5. Then run repository checks required by the project for the changed scope.

## Human handoff format

Report:

- changed files,
- what happens on `main` merge,
- what the PR author must put in labels/body,
- verification commands and results,
- any remaining manual setup such as optional `PROD_E2E_BASE_URL`.
