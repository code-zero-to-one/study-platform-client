# Schema Validation Against Backend DTOs

Zod schemas in `src/types/schemas/` must stay aligned with backend DTOs from `src/types/api/` or `src/api/openapi/`. Divergence is always a bug unless an explicit transformer function handles the conversion.

## Required Pattern

Every schema that maps to a backend request/response **must**:

1. Import the corresponding DTO type
2. Have an explicit transformer function (e.g., `toCreateRequest()`) for type conversions
3. Use the same enum constants as the DTO

```typescript
// ✅ Correct — imports DTO type, has explicit transformer
import type { GroupStudyCreateRequest } from '@/types/api/group-study.types';

const GroupStudyFormSchema = z.object({
  maxMembersCount: z.string().regex(/^[1-9]\d*$/), // string OK — HTML input
  type: z.enum(STUDY_TYPES),                         // enum from shared const
});

export function toCreateRequest(v: GroupStudyFormValues): GroupStudyCreateRequest {
  return {
    basicInfo: {
      maxMembersCount: Number(v.maxMembersCount), // conversion documented here
      type: v.type,
    },
  };
}

// ❌ Wrong — duplicates DTO fields without importing or linking to them
const StudySchema = z.object({
  maxMembersCount: z.number(), // guessing the type — may drift silently
  type: z.enum(['PROJECT', 'PORTFOLIO']), // hardcoded — enum values may drift
});
```

## Rules

**Enum values must use shared constants, not inline literals:**

```typescript
// ✅ From shared const — stays in sync
import { STUDY_TYPES } from '@/config/group-study-const';
type: z.enum(STUDY_TYPES)

// ❌ Hardcoded — will drift when backend adds/removes values
type: z.enum(['PROJECT', 'PORTFOLIO', 'STUDY'])
```

**Optionality must mirror DTO unless transformer converts:**

```typescript
// DTO: tags: string[] (required)
// ✅ Schema required — matches DTO
tags: z.array(z.string()).min(1)

// ❌ Schema optional — creates shape mismatch the transformer must handle
tags: z.array(z.string()).optional()
```

**Form string → DTO number conversions belong in the transformer, not the schema:**

```typescript
// DTO: capacity: number (required)
// ✅ Schema keeps string for input, transformer converts
capacity: z.string().regex(/^\d+$/)   // form input is always string
// in toCreateRequest(): capacity: Number(v.capacity)

// ❌ Schema as number — doesn't work with HTML inputs
capacity: z.number()
```

**Fields that exist in the DTO must exist in the schema (no silent omissions):**

```typescript
// DTO has: title, description, summary, thumbnailExtension
// ✅ All DTO fields present in schema or transformer output
// ❌ Missing thumbnailExtension in schema → transformer can't include it safely
```

## File Locations

- Zod schemas: `src/types/schemas/<feature>.schema.ts`
- Manual DTO types: `src/types/api/<feature>.types.ts`
- OpenAPI auto-generated: `src/api/openapi/` — never modify

## Audit Pattern

When creating or modifying a schema, verify alignment:

```bash
# Find the corresponding DTO type
grep -r "interface.*Request\|interface.*Response" src/types/api/ | grep -i <feature>

# Check if schema imports the DTO
grep "from '@/types/api/" src/types/schemas/<feature>.schema.ts
```

If the schema does not import from `@/types/api/` or `@/api/openapi/`, it must have a comment explaining why it's standalone.
