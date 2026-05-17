# No `<img>` Tag, No eslint-disable Comments

## `<img>` tag is banned

Always use `<Image>` from `next/image`. No exceptions.

For blob URLs (`URL.createObjectURL`), use `<Image unoptimized>` — that prop exists exactly for this case:

```tsx
// ❌ Never
<img src={blobUrl} />
// eslint-disable-next-line @next/next/no-img-element
<img src={blobUrl} />

// ✅ Always
<Image src={blobUrl} width={100} height={100} unoptimized alt="..." />
```

## eslint-disable comments are banned

Treat inline `eslint-disable` comments the same as `--no-verify`. Both are explicitly banned.

When lint blocks a pattern, fix the root cause — use the correct API or component. Never silence the linter.

```tsx
// ❌ Never silence lint
// eslint-disable-next-line @next/next/no-img-element
<img src={url} />

// ✅ Fix the root cause
<Image src={url} unoptimized ... />
```
