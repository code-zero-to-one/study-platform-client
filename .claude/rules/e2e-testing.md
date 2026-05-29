# E2E Testing Conventions

Framework: Playwright v1.51+. Tests run against staging (`https://test.zeroone.it.kr`) by default.

## Commands

```bash
yarn e2e                         # Run all tests (headless, staging)
yarn e2e --grep-invert @auth     # Run only non-auth tests (CI mode)
yarn e2e:ui                      # Playwright UI mode (interactive)
yarn e2e:headed                  # Headed mode (visible browser)
yarn e2e:save-auth               # Re-capture auth session → e2e/fixtures/auth.json
```

Override target: `E2E_BASE_URL=http://localhost:3000 yarn e2e`

## Auth Tag Convention

This project uses Kakao/Google OAuth — auth sessions cannot be auto-generated in CI.

**Tag any `test.describe` that requires login with `@auth`:**

```typescript
// ✅ requires login → tag it
test.describe('그룹스터디 개설 @auth', () => { ... });

// ✅ explicitly unauthenticated → no tag needed
test.describe('비로그인 UI', () => {
  test.use({ storageState: { cookies: [], origins: [] } });
  ...
});
```

CI runs `yarn e2e --grep-invert @auth` — skips all `@auth` tests.
Local full run (`yarn e2e`) executes everything using `e2e/fixtures/auth.json`.

**When auth.json expires:** re-run `yarn e2e:save-auth` and update the `E2E_AUTH_JSON` GitHub Secret.

## Requirement Tag Convention (`@REQ-*`)

When a test verifies a tracked requirement (a row in `docs/product-ssot/<domain>/traceability.md`), append the `@REQ-*` id to the `describe` title — same spot as `@auth`, both can coexist:

```typescript
// 추적표의 REQ-AUTH-007을 검증하는 테스트
test.describe('세션 만료 후 로그인 모달 @auth @REQ-AUTH-007', () => { ... });
```

The id must match the row's `검증` cell exactly. `yarn trace:check` cross-checks the table against these tags (orphan = tag with no row, broken = row with no tag). Format and id rules: `docs/product-ssot/_shared/traceability-rules.md`.

## When to Write E2E Tests

**Write E2E** for:
- Payment flows (Toss integration — critical path, hard to unit-test)
- Auth flows (OAuth, token refresh, session expiry)
- Multi-step user flows that cross multiple pages (study apply → accept → assignment submit)

**Skip E2E** for:
- Single-component rendering — use Storybook or manual check
- API hook logic — covered by unit tests or manual staging verify
- Pure UI styling changes

## File Structure

```
e2e/
├── fixtures/
│   └── auth.json          # Saved auth session (not committed — regenerate with e2e:save-auth)
├── support/
│   └── study-helpers.ts   # Shared helpers (navigation, data setup)
└── <domain>/
    └── <feature>.spec.ts  # Tests grouped by domain (group-study, payment, auth)
```

## Test Patterns

### Authentication

Tests requiring login use the saved auth session from `e2e/fixtures/auth.json`:

```typescript
import { test } from '@playwright/test';
import authState from '../fixtures/auth.json';

test.use({ storageState: 'e2e/fixtures/auth.json' });
```

If auth.json is stale (login fails mid-test), regenerate with `yarn e2e:save-auth`.

### Shared Helpers

Import from `e2e/support/study-helpers.ts` for common study setup. Do not duplicate navigation or data-creation logic across spec files.

### Spec Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('feature name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/target-path');
  });

  test('happy path', async ({ page }) => {
    // action
    await expect(page.getByRole('...')).toBeVisible();
  });
});
```

## Staging vs Local

- Default target: `https://test.zeroone.it.kr` (staging)
- Do not hardcode staging URL in test files — always use `page.goto('/path')` (relative), relying on `baseURL` from `playwright.config.ts`
- For payment tests, staging Toss keys are required — confirm `E2E_BASE_URL` is staging, not production

## What NOT to Do

- Do not commit `e2e/fixtures/auth.json` — contains real session tokens
- Do not use `page.waitForTimeout()` for timing — use `waitForResponse` or `waitForSelector`
- Do not write tests that mutate production data — always target staging
