# CLAUDE.md

This file is a reference guide for Claude Code (claude.ai/code) when working with this repository.

## Core Rules (Must Review Before All Tasks)

### Implementation Principles

- **Limit exploration to 2–3 files max.** Do not spend the session on exploration or planning. Once you know the file path and API contract, start writing code immediately.
- **Never fabricate API endpoints.** Do not invent endpoints that don't exist. Always verify real APIs in `src/hooks/queries/`, `src/api/`, `src/api/openapi/` before using them. If not found, leave a TODO placeholder and inform the user.
- **Fix all issues in a single pass during code review.** Do not make multiple passes on the same file. Handle all discovered issues in one pass.
- **Verify frontend ↔ backend alignment before finalizing any API-touching change.** Cross-check against the backend repo at `../study-platform-mvp/`. Specifically confirm: (1) endpoint path and HTTP method, (2) query/path param names and types, (3) response DTO field names, types, and optionality, (4) enum values. Report any mismatch to the user before committing.

### Completion Criteria

After writing or modifying code, **all 3 of the following must pass to consider the task complete**:

```bash
yarn lint:fix       # ESLint auto-fix
yarn prettier:fix   # Prettier format
yarn typecheck      # No type errors
```

- `yarn typecheck` can be skipped for UI-only changes with no type modifications
- Standalone "prettier cleanup" or "lint fix" commits signal this criterion was not met
- Even for broad changes, lint/prettier runs only **within the scope of modified files** (consistent with the no-unrelated-improvements principle)

### Code Conventions (auto-applied)

- Always use `cn()` for `className` composition. No template literal classNames.
- No arbitrary px values for **spacing/sizing** utilities (`p-[4px]`, `w-[320px]`, `h-[100px]`, `gap-[10px]`). Use project custom tokens. Other arbitrary values (`grid-cols-[...]`, `bg-[url('/img.png')]`, etc.) are allowed.
- No hardcoded colors/spacing. Use only `@theme inline` tokens from `global.css`.

@.claude/rules/no-img-no-eslint-disable.md
@.claude/rules/version-management-frontend.md

---

## Project Overview

ZERO-ONE Study Platform — A 1:1 morning study platform to start every day together. Built on Next.js 15 (App Router), React 19, TypeScript 5, Tailwind CSS 4. Package manager: **Yarn 1.22+**, Node.js >=20 required.

## Commands # hook 으로 빼기 (토큰아끼기)

```bash
yarn dev              # Run Turbopack dev server
yarn build            # Production build
yarn lint             # ESLint check
yarn lint:fix         # ESLint auto-fix
yarn typecheck        # TypeScript type check (tsc --noEmit)
yarn prettier         # Prettier format check
yarn prettier:fix     # Prettier auto-format
yarn storybook        # Storybook dev server (port 6006)
yarn build-storybook  # Storybook build
yarn generate:api <name>  # Generate API query hook boilerplate (e.g., yarn generate:api bank-search-queries)
```

CI pipeline: lint → typecheck → prettier → build → build-storybook → security audit.

## Domain Warning: Mentoring vs MentorStudy

@.claude/rules/domain-entities.md

---

## Architecture

### Folder Structure (Type-Based)

New code goes in type-based layers: `components/<domain>/`, `hooks/queries/<domain>/`, `types/<domain>/`, `api/endpoints/<domain>/`. `src/features/` is **frozen legacy** — no new files; migrate one domain per PR, never mix structures in a single PR. See `.claude/rules/architecture.md`.

### Routing (Next.js App Router)

- `src/app/(landing)/` — public landing page (`/`)
- `src/app/(service)/` — authenticated service pages (home, my-page, payment, premium-study, etc.)
- `src/app/(admin)/` — admin pages (protected by `ROLE_ADMIN` claim in JWT)
- `src/middleware.ts` — auth handling: validates accessToken cookie, auto-refreshes via `/api/v1/auth/access-token/refresh`, checks admin permissions for `/admin/*` paths

### API Layer

**Backend API docs (Swagger):**

- Staging: https://test-api.zeroone.it.kr/v3/api-docs
- Swagger UI: https://test-api.zeroone.it.kr/swagger-ui/index.html

Two communication patterns coexist:

1. **Legacy axios** (`src/api/client/axios.ts`): baseURL `/api/v1/`, token refresh queue (triggers on AUTH001 error). Used for custom endpoints.
2. **OpenAPI auto-generated** (`src/api/openapi/`): Types and services auto-generated from backend Swagger. **Never modify files inside `src/api/openapi/`** — they are regenerated. This directory is excluded from ESLint.

How to add a new API hook:

```bash
yarn generate:api <swagger-api-title-name>
# Creates src/hooks/queries/<name>.ts (with createApiInstance boilerplate)
```

### Error handling
