# Feature: 멘토스터디 신청+결제 E2E 테스트

## Background

멘토스터디(PREMIUM_STUDY) 결제 플로우(신청 → Toss 결제 → `/payment/success`)는 UI 회귀를 수동으로만 검증할 수 있었다. 결제 플로우는 Toss 외부 SDK, RSC hydration, TanStack Query 캐시 상태, 여러 API 엔드포인트에 의존하기 때문에 자동화하기 어려웠다.

특히 두 가지 구조적 장벽이 있었다:

1. **RSC leader 판별 문제**: 스터디 생성자(memberId=2)가 곧 신청자로 사용되는 E2E 계정이어서, SSR에서 `isLeader=true`로 판별되면 "신청하기" 버튼이 렌더링되지 않는다.
2. **Toss SDK v2 오버레이**: Toss Payments v2는 `pay.toss.im`으로 리다이렉트하지 않고 in-page overlay widget을 렌더링한다.

## Implementation

### 핵심 접근법

**RSC HTML 패치 (isLeader 우회)**

`page.route()`로 HTML document 응답을 가로채 dehydrated RSC payload의 `leader.memberId`를 2→9999로 교체한다. RSC는 JSON을 이중 인코딩하므로 실제 HTML에는 `\"leader\":{\"memberId\":2`가 포함되어 있다.

```typescript
// e2e/support/payment-helpers.ts
const patched = text.replace(
  /\\"leader\\":\{\\"memberId\\":2/g,
  '\\"leader\\":{\\"memberId\\":9999',
);
```

이 패치로 클라이언트가 `isLeader = (9999 === 2) = false`로 계산하면:
- `useGetGroupStudyMyStatus` hook이 활성화됨 (SSR에서 prefetch 안 됨)
- `useGetMyTransactionsByGroupStudy` hook이 활성화됨
- 두 엔드포인트 모두 `page.route()`로 interceptable한 클라이언트 사이드 fetch가 됨

**stateful mock (신청 전후 상태 전환)**

```typescript
let hasApplied = false;

// members/status: NONE → PENDING (신청 후 query invalidation 시)
// apply POST: 성공 + hasApplied = true로 플립
```

**Toss SDK v2 오버레이 처리**

`payment.requestPayment()` 클릭 후 in-page overlay가 뜨는데, `page.evaluate()`로 직접 success URL로 이동한다. confirm API는 이미 mock되어 있어 success page가 정상 렌더링된다.

```typescript
await page.evaluate(() => {
  window.location.href =
    '/payment/success?paymentId=1&paymentKey=tpaytest_e2e&orderId=order_e2e&amount=10000&method=CARD';
});
```

**추가 mock 목록**

| 엔드포인트 | 이유 |
|-----------|------|
| `GET /api/v1/group-studies/${studyId}/members/status` | 클라이언트 사이드 fetch, 상태 전환 필요 |
| `GET /api/v1/mypage/transactions/group-studies/${studyId}` | 빈 배열 반환 → `latestPaymentType === undefined` → "결제하기" 버튼 조건 충족 |
| `POST /api/v1/group-studies/${studyId}/apply` | leader 계정은 본인 스터디 신청 불가 |
| `POST /api/v1/group-studies/${studyId}/payments/prepare` | 실제 신청 레코드 없으므로 서버 거절 |
| `POST /api/v1/payments/toss/confirm` | success page 렌더링 조건 |

### 고려했으나 기각한 접근법

- **`/api/v1/group-studies/${studyId}` 응답 mock**: SSR은 서버→서버 fetch라 `page.route()` 인터셉트 불가
- **`memberId` 쿠키 위조**: `useAuth()`가 JWT 쿠키를 decode해서 `authData.memberId`를 추출하므로 plain `memberId` 쿠키 조작은 무효
- **Toss pay.toss.im 가로채기**: Toss SDK v2는 리다이렉트 대신 in-page overlay를 사용

## Result

**사용자 관점**: 멘토스터디 신청+결제 전체 플로우(신청서 작성 → toast → 결제 페이지 → "결제가 완료되었습니다." 확인)가 자동화되어 회귀를 빠르게 감지할 수 있다.

**개발자 관점**:
- `e2e/support/payment-helpers.ts`: 재사용 가능한 mock helper 함수들 (study 생성/삭제 API, RSC 패치, 결제 flow mock)
- `e2e/payment/premium-study-payment.spec.ts`: 전체 신청+결제 E2E 시나리오
- beforeAll/afterAll로 테스트용 스터디를 동적 생성/삭제 → 사이드 이펙트 없는 테스트

## References

### Playwright — `page.route()` for Network Interception

> "Routing provides the capability to modify network requests that are made by a page. Once routing is enabled, every request matching the url pattern will stall unless it's continued, fulfilled or aborted."
>
> — [Playwright Network Documentation](https://playwright.dev/docs/network)

**Why applied**: The test uses `page.route()` to intercept HTML document responses and patch the dehydrated RSC payload (replacing `memberId: 2` with `memberId: 9999`). The `route.fulfill()` method returns the modified HTML without making the actual request, and `route.continue()` allows client-side API calls to be intercepted separately.

### Playwright — `page.evaluate()` for Programmatic Navigation

> "page.evaluate() returns the value of the pageFunction invocation... The function runs in the browser, not in Node.js, so it has access to the page's `window` object, DOM, and other browser APIs."
>
> — [Playwright API Reference — page.evaluate()](https://playwright.dev/docs/api/class-page#page-evaluate)

**Why applied**: After the Toss Payments SDK v2 in-page overlay appears, the test uses `page.evaluate()` to directly set `window.location.href` to the success URL. This simulates user completion of the payment flow without needing to interact with the actual Toss overlay.

### TanStack Query — HydrationBoundary & Dehydration

> "HydrationBoundary adds a previously dehydrated state into the queryClient that would be returned by useQueryClient()... Dehydrate creates a frozen representation of a cache that can later be hydrated with HydrationBoundary or hydrate. This is useful for passing prefetched queries from server to client."
>
> — [TanStack Query — Hydration Reference](https://tanstack.com/query/latest/docs/framework/react/reference/hydration)

**Why applied**: The Next.js RSC page uses `HydrationBoundary` to dehydrate server-fetched study data into the HTML markup. The test patches the dehydrated JSON payload in the HTML response to change `leader.memberId` before the client hydrates the cache, allowing the test to bypass the leader-only restriction.

### Next.js — RSC State Serialization

> "Only queries can be dehydrated with an HydrationBoundary... The dehydrated state is a plain JavaScript object that can be safely serialized with JSON.stringify()."
>
> — [TanStack Query Hydration Docs](https://tanstack.com/query/latest/docs/framework/react/reference/hydration)

**Why applied**: RSC encodes dehydrated TanStack Query state as JSON within the HTML (double-encoded as string literals). The test performs string replacement on the raw HTML to modify this serialized payload before the browser parses and hydrates it.

### Toss Payments SDK v2 — Payment Window Overlay

> "The windowTarget parameter controls how the payment window opens—either 'self' (full browser redirect, mobile default) or 'iframe' (overlay window, PC default)."
>
> — [Toss Payments JavaScript SDK v2 Documentation](https://docs.tosspayments.com/sdk/v2/js)

**Why applied**: Unlike Toss SDK v1, v2 renders an in-page overlay (iframe mode) instead of redirecting to pay.toss.im. The test cannot directly interact with this overlay, so it uses `page.evaluate()` to programmatically navigate to the success URL instead of waiting for user interaction.

