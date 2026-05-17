<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-18 | Updated: 2026-04-18 -->

# types/

## Purpose

TypeScript type definitions and Zod validation schemas for the ZERO-ONE study platform. This directory is **never auto-modified** — all types are manually maintained. Two sub-patterns coexist: raw API/domain type files at the root level, and form validation schemas in `schemas/` paired with `react-hook-form`.

## Key Files

| File | Description |
|------|-------------|
| `api/` subdirectory | API response/request types from backend endpoints — response DTOs, query params, error responses |
| `schemas/` subdirectory | Zod validation schemas for React Hook Form — form validation rules, error messages (Korean), type inference via `z.infer<>` |
| `css.d.ts` | TypeScript module declaration for CSS imports — enables type-safe CSS Modules |
| `auth.types.ts` | Authentication request/response types (signup, login payloads) |
| `group-study.types.ts` | Group study domain types — largest file (11KB), covers study metadata, member roles, statuses |
| `user.types.ts` | User profile, preferences, and account-related types |
| `schedule.types.ts` | Scheduling and time-related types |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `api/` | API response/request types (13 files) — one per domain (admin, channel, group-study, interview, my-page, schedule, user, etc.) |
| `auth/` | Authentication-specific types — login/signup flows, JWT payloads, OAuth responses |
| `community/` | Community feature types — discussions, comments, Q&A, voting |
| `developer/` | Developer-facing types — used in component props, query params, internal domain models |
| `interview/` | Interview feature types — interview sessions, questions, responses |
| `matching/` | Matching feature types — admin domain models, query params for mentor-study matching |
| `mentoring/` | Mentoring feature types — mentor profiles, applications, consultation sessions (1:1 individual) |
| `one-to-one-study/` | 1:1 study session types — distinct from mentoring (no assignments) |
| `schedule/` | Scheduling types — time slots, calendar, availability |
| `schemas/` | Zod validation schemas (22 files) — form validation, runtime type checking for form inputs |

## For AI Agents

### Working In This Directory

1. **Never fabricate types** — Always check backend Swagger or `api/` subdirectory before adding new types. Types must align with actual backend responses.

2. **API response types live in `api/` subdirectory** — Do not create root-level API types. Example: `api/group-study.types.ts` contains `GroupStudyDetailResponse`, `GroupStudyApplicationRequest`, etc.

3. **Form schemas in `schemas/` only** — All Zod schemas for `react-hook-form` go in `schemas/`. Do not mix validation logic with raw types. Example: `group-study-form.schema.ts` exports `GroupStudyFormSchema` + `GroupStudyFormData = z.infer<typeof GroupStudyFormSchema>`.

4. **Type inference from Zod** — Always derive form data types via `z.infer<typeof Schema>`, not manual interface definitions:
   ```typescript
   // ✅ Correct
   export const MyFormSchema = z.object({ name: z.string() });
   export type MyFormData = z.infer<typeof MyFormSchema>;
   
   // ❌ Wrong
   export interface MyFormData { name: string; }
   ```

5. **Optional fields from backend require runtime guards** — Backend may send values not in frontend types. Use `in` guard + fallback instead of bare `as Type` assertion:
   ```typescript
   // ❌ Wrong
   const studyType = response.type as StudyType;
   
   // ✅ Correct
   const studyType = response.type && response.type in STUDY_TYPE_LABELS 
     ? (response.type as StudyType) 
     : undefined;
   ```

6. **Optional ID fields in React `key` props need `?? index` fallback** — Never use `key={item.id}` when `id` is optional; multiple items get `key="undefined"` causing incorrect DOM reuse:
   ```typescript
   // ❌ Wrong
   {items.map((item) => <div key={item.missionId}>...</div>)}
   
   // ✅ Correct
   {items.map((item, index) => <div key={item.missionId ?? index}>...</div>)}
   ```

7. **Path alias always** — Import from types using `@/types/`, never relative paths:
   ```typescript
   // ✅ Correct
   import type { GroupStudy } from '@/types/api/group-study.types';
   import { GroupStudyFormSchema } from '@/types/schemas/group-study-form.schema';
   
   // ❌ Wrong
   import type { GroupStudy } from '../api/group-study.types';
   ```

8. **Keep English identifier names, Korean descriptions** — Comments and error messages are in Korean; type names and property keys are in English:
   ```typescript
   export interface SignUpRequest {
     nickname: string; // 닉네임
     career?: string; // 경력 (옵션)
   }
   ```

### Common Patterns

**API Response Type Structure:**
```typescript
// api/group-study.types.ts
export interface GroupStudyResponse {
  content: {
    id: number;
    title: string;
    status: 'ACTIVE' | 'CLOSED' | 'CANCELLED';
    members: GroupStudyMember[];
  };
  statusCode: number;
  message: string;
}

// Optional fields from backend → use `in` guard
export const studyStatus = 
  response.status && response.status in STATUS_LABELS
    ? (response.status as StudyStatus)
    : 'ACTIVE';
```

**Form Validation Schema Pattern:**
```typescript
// schemas/group-study-form.schema.ts
import { z } from 'zod';

export const GroupStudyFormSchema = z.object({
  title: z.string()
    .trim()
    .min(5, '스터디 제목은 5자 이상이어야 합니다.')
    .max(100, '스터디 제목은 100자 이하여야 합니다.'),
  capacity: z.number()
    .min(2, '최소 2명 이상이어야 합니다.')
    .max(10, '최대 10명까지만 가능합니다.'),
  tags: z.array(z.string()).optional(),
});

export type GroupStudyFormData = z.infer<typeof GroupStudyFormSchema>;
```

**Usage with React Hook Form:**
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { GroupStudyFormSchema, GroupStudyFormData } from '@/types/schemas/group-study-form.schema';

export function CreateStudyForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<GroupStudyFormData>({
    resolver: zodResolver(GroupStudyFormSchema),
  });
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('title')} />
      {errors.title && <span>{errors.title.message}</span>}
    </form>
  );
}
```

**Enum Guard Pattern:**
```typescript
// ❌ Wrong — bare as assertion unsafe at runtime
const level = response.level as ExperienceLevel;

// ✅ Correct — guard + fallback
const EXPERIENCE_LEVELS = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] as const;
type ExperienceLevel = typeof EXPERIENCE_LEVELS[number];

const level = response.level && EXPERIENCE_LEVELS.includes(response.level)
  ? (response.level as ExperienceLevel)
  : 'BEGINNER';
```

**Mentoring vs MentorStudy** (Domain Warning):
- **Mentoring** (`/mentoring/*`) — 1:1 individual consultation. Uses `useMentorDetail`, `useMentoringApplyController`. Backend: `/api/v1/mentors`
- **MentorStudy** (`/premium-study/*`) — Premium group study type. Uses `useGetGroupStudyDetail`. Backend: `/api/v1/group-studies?type=MENTOR_STUDY`
- **Key difference**: Mentoring has no assignments/evaluations; MentorStudy (group) includes member management, assignments, evaluations.

### Type Naming Conventions

| Suffix | Purpose | Example |
|--------|---------|---------|
| `Request` | API request payload | `SignUpRequest`, `CreateMissionRequest` |
| `Response` | API response payload | `GroupStudyDetailResponse`, `UserProfileResponse` |
| `DTO` | Data Transfer Object (sometimes used interchangeably with Response) | `MissionDTO` |
| `Params` | Query/path parameters for API calls | `GetMissionsParams`, `CreateGroupStudyParams` |
| `Schema` | Zod validation schema (file in `schemas/`) | `GroupStudyFormSchema`, `ProfileFormSchema` |
| `Data` | Inferred type from Zod schema via `z.infer<>` | `GroupStudyFormData`, `ProfileFormData` |

### File Organization Rules

**Root-level `*.types.ts`** — Domain-specific type aggregations (not API responses, but entity models):
- `auth.types.ts` — auth entities
- `group-study.types.ts` — study model types
- `user.types.ts` — user model types

**`api/` subdirectory** — One file per API domain:
- `api/group-study.types.ts` — Group study API request/response
- `api/user.types.ts` — User API request/response
- `api/admin.types.ts` — Admin endpoints

**`schemas/` subdirectory** — One file per form:
- `group-study-form.schema.ts` — Create/edit group study form
- `profile-form.schema.ts` — User profile edit form
- `zod-schema.ts` — Reusable Zod base schemas (helpers like `UrlSchema`, `CommentFormSchema`)

### Import/Export Standards

```typescript
// ✅ Export types, interfaces, and inferred types
export type GroupStudyFormData = z.infer<typeof GroupStudyFormSchema>;
export interface GroupStudy { ... }
export const GroupStudyFormSchema = z.object({ ... });

// ✅ Named exports for schemas (for `zodResolver`)
export const ProfileFormSchema = z.object({ ... });

// ❌ Avoid default exports for types (harder to track)
export default interface User { ... }
```

### Testing Requirements

Types and schemas are validated during `yarn typecheck` — no separate test command. Zod runtime validation is tested through integration tests in `src/components/` and `src/features/`.

## Dependencies

### Internal
- Schema files depend on `zod` package (no internal type imports within `schemas/`)
- Type files may reference other type files within the same directory (e.g., `user.types.ts` → `auth.types.ts`)

### External
- `zod` — runtime schema validation, type inference
- TypeScript — static type checking (build-time only)

<!-- MANUAL: -->
