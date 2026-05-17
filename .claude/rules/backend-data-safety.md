# Backend Data Safety Patterns

Empty array safety is already guaranteed by parent component `if (!arr?.length) return null` guards, so no additional defensive code before `Math.max` calls is needed.

## Using Optional Fields Safely in React keys and Handlers

Using optional (`?`) ID fields from the backend directly as React `key` props can cause multiple items to have `key="undefined"`, leading to incorrect DOM reuse by React. Use `??` operator with `index` fallback.

```typescript
// Wrong pattern — if missionId is undefined, all items get key="undefined"
{items.map((item) => <div key={item.missionId}>...</div>)}

// Correct pattern — optional field ?? index
{items.map((item, index) => <div key={item.missionId ?? index}>...</div>)}
```

Optional fields used inside event handlers also need guards:

```typescript
// Wrong pattern — if missionId is undefined, routes to ?missionId=undefined
const handleClick = (id: number) => router.push(`...?missionId=${id}`);

// Correct pattern — recoverable failures notify via Toast
const handleClick = (id: number | undefined) => {
  if (!id) {
    showToast('정보를 불러올 수 없습니다.', 'error');
    return;
  }
  router.push(`...?missionId=${id}`);
};
```

## Safe Guards for enum-like String Type Assertions

The backend may send values not present in the frontend type definition. Use `in` guard + fallback instead of a simple `as StudyType` assertion. TypeScript `as` does not protect at runtime.

```typescript
// Wrong pattern — undefined rendering or runtime error when unknown value received
const studyType = type as StudyType;
<Badge>{STUDY_TYPE_LABELS[studyType]}</Badge>

// Correct pattern — in guard with fallback
const studyType =
  type && type in STUDY_TYPE_LABELS ? (type as StudyType) : undefined;
<Badge>{studyType ? STUDY_TYPE_LABELS[studyType] : '스터디'}</Badge>

// When iterating lists
{experienceLevels?.map((level) => (
  <Badge key={level}>
    {level in EXPERIENCE_LEVEL_LABELS
      ? EXPERIENCE_LEVEL_LABELS[level as ExperienceLevel]
      : level}
  </Badge>
))}
```
