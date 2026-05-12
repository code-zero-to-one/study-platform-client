# Live API Schema Auto-Check

Whenever a task touches any of the following files, **automatically** fetch and verify the live Swagger schema — no user prompt required:

- `src/types/api/*.types.ts`
- `src/hooks/queries/**/*.ts`
- `src/api/client/*.ts`

## When to Run

Trigger this check at task start (before writing code), not after:

- Adding or modifying a DTO interface
- Adding or modifying a query/mutation hook
- Reviewing a component that calls an API hook

## How to Fetch

Use `ctx_execute` (never `WebFetch` — blocked by hook):

```javascript
const res = await fetch('https://test-api.zeroone.it.kr/v3/api-docs');
const api = await res.json();
const schemas = api.components?.schemas ?? {};
const paths = api.paths ?? {};
```

SpringDoc wraps all responses in `BaseResponse<T>` — the actual DTO is in `content.$ref`. Navigate through the wrapper to reach the real fields. When a schema has a circular `content.$ref` pointing to itself, drill into the path's `responses['200'].content['application/json'].examples` instead — the examples contain the actual field structure.

## What to Compare

For every DTO type being touched:

| Check | How |
|---|---|
| Field names | Compare frontend interface keys vs backend schema properties |
| Field types | `string`/`number`/`boolean`/`array` alignment |
| Optionality | `?` in frontend vs `required[]` array in backend schema |
| New fields | Backend fields absent from frontend interface → add them |
| Removed fields | Frontend fields absent from backend → flag to user |
| Enum values | Frontend union type vs backend `enum` array |

## Reporting Format

```
DTO 비교: CourseCurriculumLessonResponse
  ✅ lessonId, order, title, isFree, locked, estimatedMinutes
  ❌ 누락: viewCount (backend: integer) → 추가 필요
  ❌ 제거됨: legacyField (frontend에만 존재)
```

Report mismatches **before writing any code**. Do not silently skip unmatched fields.

## Staging URLs

- API docs JSON: `https://test-api.zeroone.it.kr/v3/api-docs`
- Swagger UI:    `https://test-api.zeroone.it.kr/swagger-ui/index.html`
- API base:      `https://test-api.zeroone.it.kr`
