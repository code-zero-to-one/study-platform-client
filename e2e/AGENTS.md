<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-18 | Updated: 2026-04-18 -->

# e2e/

## Purpose
End-to-end testing infrastructure for the ZERO-ONE Study Platform using Playwright. Contains test fixtures and support utilities for automated browser-based testing of critical user flows (authentication, study creation, group study interaction, mentoring, payments).

## Key Files

| File | Description |
|------|-------------|
| `fixtures/` | Reusable test fixtures — shared page objects, data factories, authentication setup |
| `support/` | Helper utilities — custom commands, assertion extensions, test reporters |

## For AI Agents

### Working In This Directory

#### Test Structure
- **Framework**: Playwright (v1.51.1) — runs against staging/production environments
- **Organization**: Place E2E tests in `e2e/` root or subdirectories by feature domain (e.g., `e2e/auth/`, `e2e/study/`)
- **Fixtures**: Create reusable page objects and test data in `e2e/fixtures/` — import via `import { fixture } from './fixtures/...'`
- **Support utilities**: Add custom commands and helpers in `e2e/support/` — extends Playwright's expect with project-specific assertions

#### Test Development Patterns

1. **Page Object Model (POM)**: Create page objects in `fixtures/pages/` for complex pages
   ```typescript
   // e2e/fixtures/pages/group-study-page.ts
   export class GroupStudyPage {
     constructor(private page: Page) {}
     
     async navigateTo(studyId: number) {
       await this.page.goto(`/group-study/${studyId}`);
     }
     
     async joinStudy() {
       await this.page.click('[data-testid="join-button"]');
     }
   }
   ```

2. **Fixtures for Setup**: Create test data fixtures in `fixtures/data/` for consistent test state
   ```typescript
   // e2e/fixtures/data/study-data.ts
   export const createStudyPayload = (overrides = {}) => ({
     title: 'Test Study',
     description: 'Test Description',
     ...overrides,
   });
   ```

3. **Authentication Fixtures**: Create reusable auth setup in `fixtures/auth/`
   ```typescript
   // e2e/fixtures/auth/login.ts
   export async function loginAsUser(page: Page, email: string, password: string) {
     // Implement OAuth mock or credential-based login flow
   }
   ```

#### Test Conventions

- **Test file naming**: `*.spec.ts` or `*.e2e.ts` convention
- **Describe blocks**: Group tests by feature/page (auth, study, payment, etc.)
- **Assertions**: Use `expect()` with custom matchers from `support/` if available
- **Timeouts**: Set explicit waits for async operations (navigation, API calls)
- **Cleanup**: Use `afterEach()` to reset state or delete test data created during test
- **Environment variables**: Reference staging endpoint via `process.env.PLAYWRIGHT_TEST_BASE_URL` (configure in playwright.config.ts)

#### Critical Flows to Test

- **Authentication**: Login (OAuth/credentials), token refresh, session expiry, logout
- **Group Study**: Create, join, apply, view members, mission submission, evaluation
- **Mentoring**: Browse mentors, apply, accept/reject applications
- **Payment**: Initiate Toss payment flow, handle webhooks, verify premium access
- **UI State**: Responsive layout, modals, form validation, error toasts

### Testing Requirements

**Pre-commit**:
```bash
yarn lint:fix       # ESLint auto-fix
yarn prettier:fix   # Biome format
yarn typecheck      # tsc --noEmit
```

**Running Tests**:
```bash
# Run all E2E tests (if configured in package.json)
yarn test:e2e

# Run specific test file
npx playwright test e2e/auth.spec.ts

# Debug mode (headed browser)
npx playwright test --headed --debug

# Generate test report
npx playwright show-report
```

**Configuration**: 
- Playwright config typically at `playwright.config.ts` (project root)
- Staging URL: `https://test.zeroone.it.kr`
- Production URL: `https://www.zeroone.it.kr`

### Common Patterns

#### Waiting for Network
```typescript
// Wait for API response before asserting UI
await Promise.all([
  page.waitForResponse(response => response.url().includes('/api/v1/group-studies')),
  page.click('[data-testid="create-study-button"]'),
]);
```

#### Handling Modals
```typescript
// Login modal pattern (common in this app)
const loginModal = page.locator('[data-testid="login-modal"]');
await loginModal.locator('input[type="email"]').fill('test@example.com');
await loginModal.locator('[data-testid="login-submit"]').click();
```

#### Testing Responsive Layout
```typescript
// Test mobile viewport
await page.setViewportSize({ width: 375, height: 667 });
// Test desktop
await page.setViewportSize({ width: 1280, height: 720 });
```

#### Assertion with Retry
```typescript
// Playwright automatically retries assertions
await expect(page.locator('[data-testid="success-message"]')).toBeVisible({
  timeout: 5000,
});
```

## Dependencies

### External
- `playwright@^1.51.1` — browser automation framework
  - Supports Chromium, Firefox, WebKit in parallel
  - Built-in video/trace recording for debugging
  - Network request/response interception

### Internal
- `src/` — application source (for test data generation, API endpoint patterns)
- `docs/` — reference for feature behavior and acceptance criteria
- Backend API (staging: https://test-api.zeroone.it.kr) — test data and endpoint verification

### Related Configuration Files
- `playwright.config.ts` (project root, if exists) — test runner config, browser options, base URL
- `package.json` — test scripts and Playwright version
- `.github/workflows/` — CI/CD test execution (if configured)

<!-- MANUAL: -->
