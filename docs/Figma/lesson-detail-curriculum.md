# Figma Spec — Lesson detail page (curriculum drawer open)

- **Source**: https://www.figma.com/design/ghct7wh8uZ62eUi6JPU758/ZeroOne-클래스?node-id=210-2643
- **Top-level node**: `210:2643` ("클래스 레슨 페이지 - 커리큘럼 클릭 시")
- **Drawer node**: `210:2709`
- **Review section node**: `210:2660`
- **Capture date**: 2026-05-08
- **Route**: `/class/vibe-intro/lesson/[id]` (covered by `/class` PUBLIC_SESSION prefix in `route-policy.ts`)

## Section inventory

| Region | Figma node | Component file |
|---|---|---|
| Top bar (sticky) | 210:3015 | `_components/lesson-top-bar.tsx` |
| Curriculum drawer | 210:2709 | `_components/curriculum-drawer.tsx` |
| Tabs | inside 210:2644 | `_components/lesson-tabs.tsx` |
| Review form | 210:2660 | `_components/lesson-review-form.tsx` |
| Sidebar — rating | 210:2934 | `_components/lesson-rating-card.tsx` |
| Sidebar — Q&A | 210:2934 | `_components/lesson-qna-card.tsx` |
| Sidebar — builder feed | 210:2934 | `_components/lesson-builder-feed-card.tsx` |
| Page orchestrator | 210:2643 | `app/(landing)/class/vibe-intro/lesson/[id]/page.tsx` |

## Component reuse map

| Existing | Path | Used in |
|---|---|---|
| `LessonQnaSubmissionModal` | `_components/lesson-qna-submission-modal.tsx` | Q&A card → 질문하기 |
| `LessonQnaDetailModal` | `_components/lesson-qna-detail-modal.tsx` | Q&A card → 내 질문 click |
| `cn()` | `@/components/common/ui/(shadcn)/lib/utils` | All components |
| `useToastStore` | `@/stores/use-toast-store` | Submit feedback toast |

## Token mapping

| Figma raw | Project token | Notes |
|---|---|---|
| `#fff` | `bg-background-default` | |
| `#f5f5f5` | `bg-gray-100` | Chapter header bg, page bg |
| `#e9eaeb` | `border-gray-200` | Chapter divider |
| `#d5d7da` | `border-gray-300` | Card border, badge border |
| `#a4a7ae` | `text-gray-400` | Locked label, placeholder |
| `#252b37` | `text-gray-800` | Body title |
| `#0a0d12` | `text-gray-1000` | Course title |
| `#f63d68` | `text-text-brand` / `bg-background-brand-default` | Brand rose |
| `#fea3b4` | `bg-rose-300` | Active free badge |
| `#fecdd6` | `bg-rose-200` | Completion chip bg |
| `#fecdcd` | `bg-[#fecdcd]` | Selected chip bg (NOT in token system — kept as arbitrary value) |
| `#ff4343` | `text-[#ff4343]` | Selected chip text |
| `#f76363` | `border-[#f76363]` / `text-[#f76363]` | Unselected chip |
| `12px` font Bold | `font-designer-12b` | Free badge |
| `14px` font Regular/Bold | `font-designer-14r` / `font-designer-14m` / `font-designer-14b` | Various |
| `16px` font Regular/Medium/Bold | `font-designer-16r/m/b` | Body |
| `18px` Bold | `font-designer-18b` | Chapter title, CTA labels |
| `20px` SemiBold/Bold | `font-designer-20b` | Drawer course title (SemiBold→Bold deviation: project lacks SemiBold) |
| `24px` Medium/Bold | `font-designer-24m` / `font-designer-24b` | Question label, drawer header |
| `28px` Bold/Regular | `font-designer-28b` / `font-designer-28r` | Section titles |
| `32px` Bold | `font-designer-32b` | Lesson page title |
| `rounded-[8px]` | `rounded-100` | CTA buttons |
| `rounded-[12px]` | `rounded-150` | Cards |
| `rounded-[16px]` | `rounded-200` | Textareas |
| `rounded-[40px]` / pill | `rounded-50` (badge) / `rounded-full` (chips) | |

### Token deviations (intentional)

- **SemiBold → Bold** for `font-designer-20`. Project token system has only `r/m/b`. Plan acknowledged.
- **Hardcoded chip colors** `#fecdcd` / `#ff4343` / `#f76363` kept as arbitrary values. Not in `@theme inline`. Matches existing draft.
- **Drawer width 400px** (Figma `w-[400px]`) instead of plan's 420px. Figma scrollbar pill at `left:407` is decorative — handled by browser native scrollbar.
- **Lesson row stride**: Figma uses absolute `mt-[120px]`/`mt-[171px]`/`mt-[222px]` = 51px stride. Implemented as static `h-[51px]` per `<li>`.
- **Vertical line position**: Figma `ml-[50px]` from drawer left = `left:50px`. Marker is 12px wide at `left:44px`, so center at `x=50` aligns with line.
- **Lesson title 32b**: project lacks `font-designer-30b`; rounded up to 32b.

## API mapping

| Region | Hook | DTO | Notes |
|---|---|---|---|
| Lesson detail | `useGetLessonDetail(lessonId)` | `LessonDetailResponse` | Provides `courseId`, `title`, `retrospectiveSubmitted` |
| Curriculum drawer | `useGetCourseDrawer(courseId)` | `CourseDrawerResponse` | Falls back to `MOCK_DRAWER_CHAPTERS` when backend unavailable |
| Q&A list | `useGetLessonQnas(lessonId)` | `LessonQnaListResponse` | `myQnas`, `qnas`, `totalCount` |
| Builder feeds | `useGetBuilderFeeds({ courseId, lessonId, page, size: 5 })` | `BuilderFeedListResponse` | Shows one at a time with prev/next |
| Submit retrospective | `useSubmitLessonRetrospective()` | `LessonRetrospectiveCreateRequest` | Has mock fallback when POST not yet ready |

## Backend gap — two-question UI vs single `content` field

Figma shows **two separate question textareas**:
1. "오늘 가장 신기했던 코드 하나만 적어볼까요?"
2. "직접 해보니 생각과 달랐던 의외의 순간은?"

Backend `LessonRetrospectiveCreateRequest.content: string` accepts only one string.

**Implementation**: bundle the two answers with `\n---\n` delimiter before POST.

```typescript
const combinedContent = `${reflection1}\n---\n${reflection2}`;
```

**Follow-up**: backend may add a second content field later. When that happens, split the bundling and send both fields.

## Out of scope (carried over from plan)

- Real markdown viewer for lesson content (placeholder white box only).
- Backend schema change for the second question.
- Storybook stories.
- E2E tests.
- Mobile/responsive layout (Figma is desktop-only at 1920px).
- Drawer scroll indicator pill (browser native scrollbar acceptable).
