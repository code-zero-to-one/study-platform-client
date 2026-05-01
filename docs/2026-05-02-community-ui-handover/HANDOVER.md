# 커뮤니티·클래스 UI 작업 인수인계 (에이전트 세션 요약)

작성 목적: 동일 브랜치/PR에서 진행된 **프로토타입·더미 기반 UI** 변경을 다음 담당자가 이어갈 수 있도록 파일·의도·주의사항을 정리한다.  
백엔드 API 연동은 대부분 **미구현**이며 토스트·로컬 상태만 있는 경우가 많다.

---

## 1. 빌더 상세 모달 (`BuilderDetailModal`)

| 항목 | 내용 |
|------|------|
| 파일 | `src/components/pages/class/_components/builder-detail-modal.tsx` |
| 방향 | 커뮤니티 피드 상세(`CommunityFeedDetailPage`)와 유사한 레이아웃·인라인 스타일 정렬 |
| 주요 변경 | 히어로·본문·액션 pill(좋아요 / 사이트 열기 / 공유하기), 댓글 영역 배경·보더, 댓글 아바타 이미지(`DUMMY_PROFILE_IMAGE_SRC`), 댓글 등록 버튼 비활성 배경 `#F2F4F7` |
| 제거 | 미사용 `ModalActionButton` 컴포넌트 삭제 |
| 기타 | 댓글 작성자 표기 `FEED_CURRENT_USER` 사용 |
| 영향 범위 | `BuilderDetailModal`을 쓰는 모든 화면(예: 로드맵 `tab=feed`, 클래스 상세 등) 동일 적용 |

---

## 2. 커뮤니티 피드 상세 (`CommunityFeedDetailPage`)

| 항목 | 내용 |
|------|------|
| 파일 | `src/components/pages/community/_components/community-feed-detail-page.tsx` |
| 변경 | 좋아요 ↔ 공유하기 사이 **`사이트 열기`** 버튼 추가 (`open_in_new`, 스타일은 모달과 동일 pill) |
| 동작 | 더미에 배포 URL 없음 → 클릭 시 **`배포 URL은 코스 진행 후 안내됩니다.`** 성공 토스트 |
| 후속 | `FeedItem`에 실제 URL 필드 추가 시 `window.open(url, '_blank', 'noopener,noreferrer')` 등으로 교체 가능 |

---

## 3. 공유 버튼 문구 통일

라벨 **`공유` → `공유하기`** 로 통일 (본문·더미 텍스트 내 「공유」는 변경하지 않음).

| 파일 |
|------|
| `src/components/pages/community/_components/community-feed-detail-page.tsx` |
| `src/components/pages/class/_components/builder-detail-modal.tsx` |
| `src/components/pages/community/_components/post-detail-page.tsx` |
| `src/features/community/ui/pages/community-detail-page-client.tsx` |
| `src/features/community/ui/pages/community-qna-detail-page-client.tsx` |
| `src/components/one-to-one/balance-game/voting/voting-detail-view.tsx` (`aria-label`) |

---

## 4. 게시판 목록 카피 (자유 / 테크)

### 자유게시판

| 파일 | 변경 요약 |
|------|-----------|
| `src/app/(service)/community/free/page.tsx` | 설명 문구: 스터디 그룹 모집 반영, 하이픈 뒤 **`빌더들과 일상에서 자유롭게 교류해요.`** |
| `src/components/pages/community/_components/community-home-page.tsx` | 카테고리 카드 짧은 설명 **`IT 이슈·일상·스터디 그룹 모집`** |

### 테크 한입

| 파일 | 변경 요약 |
|------|-----------|
| `src/app/(service)/community/tech/page.tsx` | **`개발 지식·테크 트렌드·도구 활용 팁·…`** |
| `community-home-page.tsx` | 카드 설명 **`개발 지식·테크 트렌드·도구·인사이트`** |

---

## 5. 신고 기능 (프로토타입)

### 신규 파일

| 파일 | 역할 |
|------|------|
| `src/features/community/ui/community-report-categories.ts` | 이용 규칙 기준 신고 유형 `<select>`용 그룹·옵션 |
| `src/features/community/ui/community-post-report-menu.tsx` | ⋮ 메뉴 → 신고하기 → **공통 `Modal`** 안에서 유형 선택·텍스트 영역·안내 문구·제출 |

### 동작 요약

- 드롭다운 패딩: 콘텐츠 `p-150`, 아이템 `px-200 py-150` 등 여유 있게 조정됨.
- 모달: **shadcn `DialogContent` 내장 X 제거**, **`Modal`** (`rounded-150`, Header/Body/Footer 패딩) + 헤더 우측 **`Modal.CloseButton`**.
- 제출 검증: 유형 필수, 상세 **10자 이상**.
- 제출 후: **실제 API 없음** → 성공 토스트만 표시.
- 푸터 버튼: **`Modal.Footer variant="form"`** 로 가로 배치·우측 정렬(`flex justify-end`).
- 과거 수정: `<optgroup>` JSX 닫힘 오류 1건 수정함 (파싱/ESLint 실패 원인).

### 삽입 위치 (상세 페이지 우측 상단 메뉴 옆 또는 제목 행)

| 화면 | 파일 |
|------|------|
| API 게시글 상세 | `src/features/community/ui/pages/community-detail-page-client.tsx` |
| API Q&A 상세 | `src/features/community/ui/pages/community-qna-detail-page-client.tsx` (`dialogTitle="질문 신고"`) |
| 테크·자유 더미 상세 | `src/components/pages/community/_components/post-detail-page.tsx` |
| 빌더 피드 더미 상세 | `src/components/pages/community/_components/community-feed-detail-page.tsx` (`dialogTitle="빌더 피드 신고"`) |
| 레거시 Q&A 더미 상세 | `src/components/pages/community/_components/community-qna-detail-page.tsx` (`dialogTitle="질문 신고"`) |

### 후속 작업 제안

- 신고 **POST API** 및 에러·로딩 처리.
- 스팸 방지·중복 제출 제한 등 운영 정책 반영.

---

## 6. 자유게시판 목록 → 상세 네비게이션

| 파일 | `src/components/pages/community/_components/post-board-page.tsx` |
|------|------|
| 문제 인식 | 사용자 보고: 자유게시판만 상세 연결 실패 의혹 |
| 조치 | 행 클릭을 **`next/link` `<Link>`** 로 변경, **`href={`/community/${post.board}/${post.id}`}`**, **`key={`${post.board}-${post.id}`}`** |
| 정리 | 미사용 **`useRouter`** 제거 |

라우트는 `src/app/(service)/community/free/[postId]/page.tsx` 등과 일치해야 함. 배포 환경에서만 깨지면 빌드·라우트 포함 여부 확인 권장.

---

## 7. 검증·품질

세션 중 실행된 검증 예시:

- 수정 파일 단위 또는 관련 파일에 대해 **`yarn eslint … --fix`**
- **`yarn typecheck`**

전체 **`yarn build`** 는 한 번은 로컬/CI에서 통과 확인하는 것이 좋다 (백그라운드 빌드 작업은 일부 실패 로그만 존재할 수 있음).

---

## 8. 원칙·주의 (레포 규칙과의 관계)

- `src/api/openapi/` 는 수정 금지.
- 신고·사이트 열기 등은 **실제 API 미연동** 상태일 수 있음 → 프로덕션 전 계약 확인 필요.
- `cn()`, 디자인 토큰·Tailwind 규칙은 기존 `CLAUDE.md` / `AGENTS.md` 준수.

---

## 9. 변경 파일 빠른 체크리스트

- `builder-detail-modal.tsx`
- `community-feed-detail-page.tsx`
- `post-detail-page.tsx`
- `post-board-page.tsx`
- `community-home-page.tsx`
- `community/free/page.tsx`, `community/tech/page.tsx`
- `community-detail-page-client.tsx`, `community-qna-detail-page-client.tsx`
- `community-qna-detail-page.tsx`
- `community-post-report-menu.tsx`, `community-report-categories.ts` (신규)
- `voting-detail-view.tsx`

---

*본 문서는 대화 세션에서 수행된 작업 범위를 기준으로 작성되었다. 추가 커밋이 있다면 저장소 diff와 함께 갱신할 것.*
