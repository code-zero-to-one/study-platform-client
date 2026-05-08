# Curriculum Drawer (Left_side curriculum)

## Source

- File: `ghct7wh8uZ62eUi6JPU758` | Node: `210:2709` | URL: https://www.figma.com/design/ghct7wh8uZ62eUi6JPU758/ZeroOne-%ED%81%B4%EB%9E%98%EC%8A%A4?node-id=210-2709 | Captured: 2026-05-08

## Route

- Target: drawer overlay inside `src/app/(landing)/class/vibe-intro/lesson/[id]/page.tsx`
- Layout group: `(landing)` | Auth required: no (landing path `/class` registered as PREFIX)
- Drawer trigger: top-bar "커리큘럼" button — same page, not separate route

## Sections

| Section | Type | Data Source | Notes |
|---------|------|-------------|-------|
| Header (title/course/duration/X) | Static + dynamic | `drawer.courseTitle` | "커리큘럼" / course title / "수강기한 무제한" / close X |
| Chapter list | List | `drawer.chapters[]` | 5 chapters in mock; dynamic count from API |
| Chapter row | Row | chapter.{order,title,defaultExpanded} | Icon 42×42 + label "Chapter NN" + title + chevron |
| Lesson row | Row | lesson.{order,title,isFree,status,isLocked,isCurrentLesson} | Marker 12×12 + 40×20 badge + Lesson NN title |

## Component Reuse

| Figma instance | Codebase path | Status |
|----------------|---------------|--------|
| KeyboardArrowUp / Down | `lucide-react` ChevronUp / ChevronDown | Reuse |
| Close X | `lucide-react` X | Reuse |
| edit_note (chapter active) | `/public/class/vibe-intro/curriculum/edit-note.svg` | Asset only |
| chapter-lock (chapter locked) | `/public/class/vibe-intro/curriculum/chapter-lock.svg` | Asset only |
| lock_open (lesson next-up) | `/public/class/vibe-intro/curriculum/lock-open.svg` | Asset only |
| lock (lesson locked) | `/public/class/vibe-intro/curriculum/lesson-lock-icon.svg` | Asset only |
| line-active / line-locked | `/public/class/vibe-intro/curriculum/line-{active,locked}.svg` | Asset only |
| marker-active / marker-default | `/public/class/vibe-intro/curriculum/marker-{active,default}.svg` | Asset only |

## Token Mapping

| Figma Variable | Project Token | Status |
|----------------|---------------|--------|
| gradation/0 (#ffffff) | `bg-white` | ✅ |
| gradation/100 (#f5f5f5) | `bg-gray-100` | ✅ |
| gradation/200 (#e9eaeb) | `border-gray-200` | ✅ |
| gradation/300 (#d5d7da) | `bg-gray-300` / `border-gray-300` | ✅ |
| gradation/400 (#a4a7ae) | `text-gray-400` | ✅ |
| gradation/800 (#252b37) | `text-gray-800` | ✅ |
| rose/Brand_Primary_300 (#fea3b4) | `bg-rose-300` | ✅ |
| main_color/Brand_Primary_500 (#f63d68) | `text-rose-500` | ✅ |
| Typography 24px Bold | `font-designer-24b` | ✅ |
| Typography 20px SemiBold | `font-designer-20m` | ⚠️ nearest (Medium ≈ SemiBold) |
| Typography 18px Bold | `font-designer-18b` | ✅ |
| Typography 14px Bold | `font-designer-14b` | ✅ |
| Typography 14px Regular | `font-designer-14r` | ✅ |
| Typography 12px Bold | `font-designer-12b` | ✅ |
| padding 8px (badge) | `px-100 py-100` (custom 4px scale) | Adapt |
| radius 4px (badge) | `rounded-100` | ✅ |
| radius 7px (chapter icon square) | `rounded-150` | ⚠️ closest |

## Token Deviations

- 20px SemiBold → `font-designer-20m` (no SemiBold-specific designer token; Medium = closest visual weight).
- chapter-icon container radius 7px → `rounded-150` (8px); 1px deviation, visually negligible.

## Transforms

| Node | Rotation | Scale | Notes |
|------|----------|-------|-------|
| close X bars (210:2715, 210:2716) | -45° / +45° | – | Two 2px-tall bars rotated to form X |
| All chapter/lesson rows | 0° | – | No rotations |

## API Mapping

| Region | Hook | DTO Type | File |
|--------|------|----------|------|
| Drawer data | `useGetCourseDrawer(courseId)` | `CourseDrawerResponse` | `src/hooks/queries/course/course-api.ts` |

DTO cross-check vs `../study-platform-mvp/`:
- `GET /courses/{courseId}/drawer` — confirmed on `CourseController.java:128`
- All field names + types + optionality match (TS `CourseDrawerLessonResponse` ↔ Java record fields 1:1)
- Enum `LessonProgressStatus = LOCKED | IN_PROGRESS | COMPLETED` aligned

## Lesson Visual Logic (DTO → UI)

| Condition (DTO) | Marker | Badge | Title style |
|-----------------|--------|-------|-------------|
| `isCurrentLesson === true` | marker-active (pink filled) | rose-300 fill + "무료" white bold (or active variant) | rose-500 14b |
| `!isCurrentLesson && status === COMPLETED && isFree` | marker-default (grey ring) | white border + "무료" gray-400 | gray-400 14r |
| `!isCurrentLesson && status === LOCKED && isFree && nextUp` | marker-default | gray-300 fill + lock-open icon | gray-400 14r |
| `!isCurrentLesson && status === LOCKED && !isFree` | marker-default | white border + lock icon | gray-400 14r |

`nextUp` derived client-side: first locked lesson after current lesson in flat order.

## Notes

- Page-level drawer is `fixed inset-0 z-50` overlay; panel `w-[420px]` matches Figma frame width.
- Existing drawer in `page.tsx:169-246` had wrong width (350), wrong header layout, wrong chapter rows (used colored numbered squares instead of edit-note/lock icons), missing connecting line, missing lesson markers.
- Scroll thumb decoration (id 210:2933, 6×80 at right edge) skipped — native scrollbar is acceptable.
- Existing `/public/class/vibe-intro/lesson-lock.svg` reused name conflict avoided by saving to `curriculum/lesson-lock-icon.svg`.
