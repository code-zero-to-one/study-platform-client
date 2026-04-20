# CLAUDE.md

Stack: Next.js 15 (App Router), React 19, TypeScript 5, Tailwind CSS 4 · Yarn 1.22+ · Node.js ≥20

## Core Rules

### Implementation Principles

- **Explore max 2–3 files.** Once path and API contract are known, write code immediately.
- **Never fabricate API endpoints.** Verify in `src/hooks/queries/`, `src/api/`, `src/api/openapi/`. Not found → leave TODO and tell the user.
- **Single-pass code review.** All discovered issues fixed in one pass per file.
- **Verify frontend ↔ backend alignment** before finalizing API changes. Cross-check `../study-platform-mvp/`: path/method, param names/types, DTO fields/optionality, enum values. Report mismatch before committing.

### Completion Criteria

After writing or modifying code, **all 3 must pass**:

```bash
yarn prettier:fix   # Prettier format
yarn lint:fix       # ESLint auto-fix
yarn typecheck      # No type errors (skip for style-only: className, text, color tokens)
```

Standalone "prettier cleanup" or "lint fix" commits = criterion not met.

### Code Conventions

- `cn()` for all `className` composition. No template literal classNames.
- No Tailwind arbitrary values (`p-[4px]`, `w-[320px]`). Project custom tokens only.
- No hardcoded colors/spacing. `@theme inline` tokens from `global.css` only.

---

## Commands

```bash
yarn dev / build / lint / lint:fix / typecheck / prettier / prettier:fix
yarn storybook / build-storybook
yarn generate:api <name>   # API hook boilerplate
```

CI: lint → typecheck → prettier → build → build-storybook → security audit

## Key Conventions

- Commits: `feat :`, `fix :`, `refactor :`, `style :`, `docs :`, `test :`, `chore :` (spaces around colon) — Korean, WHY-focused, ≤50 chars
- Branch: Feature → `develop` (staging: test.zeroone.it.kr) → `main` (production: www.zeroone.it.kr)
- SVG: `@svgr/webpack` — import as React components

---

## Rules

@.claude/rules/domain-entities.md
@.claude/rules/api-patterns.md
@.claude/rules/backend-data-safety.md
@.claude/rules/error-handling.md
@.claude/rules/architecture.md
@.claude/rules/styling.md
@.claude/rules/documentation-rules.md
@.claude/rules/commands.md
