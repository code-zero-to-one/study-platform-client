<!-- Generated: 2026-04-18 | Updated: 2026-04-18 -->

# study-platform-client-v2

## Purpose
ZERO-ONE Study Platform — a 1:1 morning study platform built with Next.js 15 (App Router), React 19, TypeScript 5, and Tailwind CSS 4. This is the frontend client that connects students with mentors for daily accountability sessions, group studies, and premium mentoring.

## Key Files

| File | Description |
|------|-------------|
| `package.json` | Dependencies and scripts. Package manager: Yarn 1.22+, Node >= 20 |
| `next.config.ts` | Next.js config wrapped with `withSentryConfig()` — SVG via `@svgr/webpack`, bundle analyzer |
| `tsconfig.json` | TypeScript config — `@/*` maps to `./src/*`, `bundler` moduleResolution |
| `.eslintrc.cjs` | RushStack-based strict ESLint — TypeScript, React hooks, TanStack Query plugin, import sorting |
| `biome.json` | Biome formatter config (replaces Prettier in lint-staged) |
| `vitest.config.ts` | Unit test config (Vitest) |
| `CLAUDE.md` | AI agent instructions for this codebase — **read before making any changes** |
| `README.md` | Human-readable project overview and setup guide |
| `PROJECT_INDEX.md` | Auto-generated codebase index for quick navigation |
| `components.json` | shadcn/ui component registry config |
| `sentry.client.config.ts` | Sentry client-side SDK initialization |
| `sentry.server.config.ts` | Sentry server-side SDK initialization |
| `sentry.edge.config.ts` | Sentry edge runtime SDK initialization |
| `docker-compose.dev.yml` | Local development Docker setup |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `src/` | All application source code (see `src/AGENTS.md`) |
| `docs/` | Developer documentation, guides, and bugfix records (see `docs/AGENTS.md`) |
| `e2e/` | End-to-end Playwright tests (see `e2e/AGENTS.md`) |
| `public/` | Static assets: icons, images, Lottie animations (see `public/AGENTS.md`) |
| `scripts/` | Developer tooling: API generator, backend setup scripts |
| `.github/` | CI/CD workflows (8 workflows): lint, typecheck, build, Storybook, security audit |
| `.storybook/` | Storybook configuration |
| `StudyVault/` | Structured knowledge vault organized by domain (AI-readable docs) |
| `.claude/` | Claude Code project configuration and rules |
| `.agents/` | Agent skills for automation (25 skills) |

## For AI Agents

### Working In This Directory
- **Always read `CLAUDE.md` first** — it contains project-specific conventions that override defaults
- Never modify `src/api/openapi/` — these files are auto-generated from the backend Swagger spec
- Use `@/*` import alias (maps to `src/*`), never use relative `../../` paths across module boundaries
- All className composition must use `cn()` — no template literals, no raw `clsx` without `tailwind-merge`
- No Tailwind arbitrary values (`p-[4px]`, `w-[320px]`) — use project custom tokens from `global.css`

### Testing Requirements
All 3 must pass before a task is complete:
```bash
yarn lint:fix       # ESLint auto-fix
yarn prettier:fix   # Biome format (via lint-staged alias)
yarn typecheck      # tsc --noEmit
```

### Common Patterns
- API calls: verify endpoints exist in `src/hooks/queries/` or `src/api/` before using — never fabricate
- State: Zustand for global client state (`src/stores/`), TanStack Query for server state (`src/hooks/queries/`)
- Forms: React Hook Form + Zod validation schemas (`src/types/schemas/`)
- Error handling: centralized via `src/utils/error-handler.ts` — never use `alert()`, always Toast
- Commit format: `<type>: <Korean summary>` — WHY-focused, under 50 chars

## Dependencies

### External
- `next@15.2.8` — App Router, Server Components, Turbopack dev server
- `react@19` — concurrent features, use server/client directives
- `@tanstack/react-query@5` — server state management, staleTime default 60s
- `zustand@5` — global client state
- `axios@1` — HTTP client with auth interceptors
- `tailwindcss@4` — CSS via `@tailwindcss/postcss` (CSS-based config in `global.css`)
- `zod@4` — schema validation
- `react-hook-form@7` — form state management
- `@sentry/nextjs@10` — error monitoring and performance
- `@tiptap/react@3` — rich text editor
- `@tosspayments/tosspayments-sdk` — payment integration
- `framer-motion@12` — animations
- `lucide-react` — icon system
- `@radix-ui/*` — headless UI primitives (Dialog, DropdownMenu, Avatar, etc.)

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->

### Production Version Management
- Main-branch production deployments must follow `ops/version-management.md` (ZERO-ONE Version Management Rule - Frontend Repository).
- `releases/` is the source of truth for successful production FE/BE/DB/rollback combinations.
- Develop/test-server deployment keeps the existing flow and does not create release records.
