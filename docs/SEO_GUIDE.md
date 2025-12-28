# ZERO-ONE SEO 최적화 가이드

**최종 업데이트**: 2024년 12월 26일  
**작업 범위**: 프론트엔드 SEO 최적화 완료

---

## 📋 목차

1. [구현 완료 사항](#구현-완료-사항)
2. [파일 구조](#파일-구조)
3. [개발자 가이드](#개발자-가이드)
4. [검증 및 모니터링](#검증-및-모니터링)
5. [향후 개선 계획](#향후-개선-계획)
6. [참고 자료](#참고-자료)

---

## 🎯 구현 완료 사항

### 1. Meta 데이터 강화 ✅

#### 구현 내용

- **모든 주요 페이지에 고유한 Title, Description 추가**
  - 형식: `[페이지명] | ZERO-ONE`
  - Description: 120~160자 최적화
  - 각 페이지별 핵심 키워드 3~5개 설정

#### 적용된 페이지

| 페이지           | 파일                               | Title                             | 상태 |
| ---------------- | ---------------------------------- | --------------------------------- | ---- |
| 홈 (/)           | `(landing)/page.tsx`               | ZERO-ONE - 1:1 기상 스터디 플랫폼 | ✅   |
| /home            | `(service)/home/page.tsx`          | 홈 - ZERO-ONE                     | ✅   |
| /study           | `(service)/study/page.tsx`         | 스터디 둘러보기                   | ✅   |
| /study/[id]      | `(service)/study/[id]/page.tsx`    | [스터디명] \| ZERO-ONE 스터디     | ✅   |
| /insights        | `(service)/insights/page.tsx`      | ZERO-ONE 인사이트                 | ✅   |
| /insights/[slug] | `(service)/insights/[id]/page.tsx` | [글제목] \| ZERO-ONE              | ✅   |
| 404              | `(service)/not-found.tsx`          | 페이지를 찾을 수 없습니다         | ✅   |

---

### 2. Structured Data (Schema.org JSON-LD) ✅

#### 구현된 Schema Types

| Schema Type        | 용도                      | 구현 위치              | 상태 |
| ------------------ | ------------------------- | ---------------------- | ---- |
| **Organization**   | 회사 정보, 로고, SNS 링크 | `(landing)/layout.tsx` | ✅   |
| **WebSite**        | 검색 기능 설명            | `(landing)/layout.tsx` | ✅   |
| **Article**        | 블로그 포스트             | 인사이트 페이지        | ✅   |
| **Course**         | 스터디 프로그램           | 스터디 상세            | ✅   |
| **BreadcrumbList** | 네비게이션 경로           | 컴포넌트 제공          | ✅   |
| **FAQ**            | FAQ 섹션                  | 컴포넌트 제공          | ✅   |

#### 사용 예시

**서버 컴포넌트에서 유틸리티 함수 사용:**

```typescript
import { generateMetadata, getOrganizationSchema } from '@/utils/seo';

// 메타데이터 생성
export const metadata = generateMetadata({
  title: '페이지 제목',
  description: '페이지 설명',
  path: '/page-path',
  keywords: ['키워드1', '키워드2'],
});

// Layout에서 Schema 추가
const schema = getOrganizationSchema();
// <script type="application/ld+json">{JSON.stringify(schema)}</script>
```

**React 컴포넌트로 사용:**

```tsx
import { ArticleSchema, BreadcrumbList } from '@/components/seo/json-ld';

export function Page() {
  return (
    <>
      <ArticleSchema
        headline="제목"
        description="설명"
        datePublished={new Date()}
        dateModified={new Date()}
        url="https://..."
      />
      <BreadcrumbList
        items={[
          { name: 'Home', url: 'https://...' },
          { name: 'Study', url: 'https://...' },
        ]}
      />
    </>
  );
}
```

---

### 3. Open Graph 메타 태그 ✅

#### 적용된 태그

- ✅ `og:type` - 콘텐츠 타입 (website/article)
- ✅ `og:url` - 정규 URL
- ✅ `og:title` - 페이지 제목
- ✅ `og:description` - 페이지 설명
- ✅ `og:image` - OG 이미지 (1200x630px)
- ✅ `og:site_name` - 사이트 이름
- ✅ `og:locale` - 언어/지역 (ko_KR)

#### 효과

- 🔗 SNS 공유 시 썸네일 + 제목 + 설명 자동 생성
- 📈 클릭률(CTR) 증가
- 📱 SNS 트래픽 증가

---

### 4. Robots.txt & Sitemap ✅

#### Robots.txt (`src/app/robots.ts`)

```typescript
// ✅ 크롤링 허용
allow: ['/', '/home', '/study', '/study/*', '/insights', '/insights/*'];

// ❌ 크롤링 차단
disallow: ['/login', '/sign-up', '/my-page', '/admin', '/api/', '/_next/'];

// Sitemap 위치
sitemap: 'https://www.zeroone.it.kr/sitemap.xml';
```

#### Sitemap.xml (`src/app/sitemap.ts`)

| 페이지 분류      | changeFrequency | priority | 비고             |
| ---------------- | --------------- | -------- | ---------------- |
| 홈 (/)           | weekly          | 1.0      | 최우선           |
| /home            | daily           | 0.9      | 높음             |
| /study           | daily           | 0.9      | 높음 (자주 변경) |
| /insights        | weekly          | 0.9      | 높음 (블로그)    |
| /study/[id]      | daily           | 0.7      | 중간             |
| /insights/[slug] | weekly          | 0.8      | 중간-높음        |

---

### 5. Canonical URL ✅

모든 페이지에 명시적으로 설정하여:

- 중복 콘텐츠 방지
- 검색 순위 통합
- 크롤링 효율성 증대

---

### 6. Semantic HTML 개선 ✅

| 이전                  | 현재                                 | 파일            |
| --------------------- | ------------------------------------ | --------------- |
| `<div>404 에러</div>` | `<h1>페이지를 찾을 수 없습니다</h1>` | `not-found.tsx` |
| 미설정                | `<main>` 요소 명시                   | 레이아웃        |
| 미설정                | `<article>` 구조                     | 인사이트 상세   |

---

## 🗂️ 파일 구조

### 생성된 파일

```
src/
├── utils/
│   └── seo.ts                    # SEO 유틸리티 통합 (config + functions)
├── components/seo/
│   └── json-ld.tsx               # JSON-LD 컴포넌트
└── app/
    ├── robots.ts                 # Robots.txt
    ├── sitemap.ts                # Sitemap.xml
    ├── (landing)/
    │   ├── layout.tsx           # Organization + WebSite Schema
    │   └── page.tsx             # 랜딩 페이지 메타데이터
    ├── (service)/
    │   ├── home/page.tsx        # 홈 메타데이터
    │   ├── study/
    │   │   ├── page.tsx         # 스터디 목록 메타데이터
    │   │   └── [id]/page.tsx    # 스터디 상세 메타데이터
    │   └── insights/
    │       ├── page.tsx         # 인사이트 목록 메타데이터
    │       └── [id]/page.tsx    # 인사이트 상세 메타데이터
    └── (admin)/
        └── layout.tsx           # 관리자 영역 robots 설정
```

---

## 🛠️ 개발자 가이드

### 새 페이지 추가 시

```typescript
// 1. SEO 유틸리티 import
import { generateMetadata as generateSEOMetadata } from '@/utils/seo';

// 2. 메타데이터 생성
export const metadata: Metadata = generateSEOMetadata({
  title: '페이지 제목',
  description: '120~160자 설명...',
  path: '/page-path',
  keywords: ['키워드1', '키워드2'],
  canonicalUrl: 'https://www.zeroone.it.kr/page-path',
});

// 3. (선택) Structured Data 추가
import { ArticleSchema } from '@/components/seo/json-ld';

export default function Page() {
  return (
    <>
      <ArticleSchema
        headline="제목"
        description="설명"
        datePublished={new Date()}
        dateModified={new Date()}
        url="https://www.zeroone.it.kr/page-path"
      />
      {/* 페이지 콘텐츠 */}
    </>
  );
}
```

### 동적 페이지 메타데이터

```typescript
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // API에서 데이터 조회
  const data = await fetchData(params.id);

  return {
    title: `${data.title} | ZERO-ONE`,
    description: data.description,
    keywords: [data.title, '관련키워드'],
    alternates: {
      canonical: `https://www.zeroone.it.kr/page/${params.id}`,
    },
    openGraph: {
      type: 'article',
      url: `https://www.zeroone.it.kr/page/${params.id}`,
      title: `${data.title} | ZERO-ONE`,
      description: data.description,
      images: [{ url: data.image, width: 1200, height: 630 }],
    },
  };
}
```

### 이미지 SEO 최적화

```tsx
// ❌ 나쁜 예
<img src="/image123.png" />

// ✅ 좋은 예
<img
  src="/images/study-platform-overview.png"
  alt="ZERO-ONE 스터디 플랫폼 개요"
  width={1200}
  height={630}
/>
```

### 내부 링크 구조

```tsx
// ❌ 나쁜 예
<button onClick={() => navigate('/study')}>스터디</button>

// ✅ 좋은 예
<Link href="/study">스터디 둘러보기</Link>
```

### Layout에서 Schema 추가

```typescript
import { getOrganizationSchema } from '@/utils/seo';

export default function Layout({ children }) {
  const schema = getOrganizationSchema();

  return (
    <html>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

---

## 📊 검증 및 모니터링

### Google Tools

#### 1. Google Search Console

- **URL**: https://search.google.com/search-console
- **작업**:
  - sitemap.xml 제출
  - URL 노출도 확인
  - 검색 성과 모니터링
  - 크롤링 오류 확인

#### 2. Google PageSpeed Insights

- **URL**: https://pagespeed.web.dev
- **측정 항목**:
  - Core Web Vitals (LCP, CLS, INP)
  - 성능 점수
  - SEO 점수

#### 3. Lighthouse (Chrome DevTools)

- **실행**: DevTools → Lighthouse → Generate report
- **확인 항목**:
  - SEO 점수 (목표: ≥90)
  - 접근성 점수
  - Best Practices

### 외부 도구

#### 4. OpenGraph 테스터

- **URL**: https://www.opengraphcheck.com
- **확인**: OG 이미지/제목 미리보기

#### 5. Schema.org 검증

- **URL**: https://validator.schema.org
- **확인**: Structured Data 유효성

#### 6. Screaming Frog SEO Spider

- **용도**:
  - Sitemap 순환 구조 확인
  - 메타데이터 일괄 검사
  - 깨진 링크 탐지

### 추적 지표

| 지표             | 목표       | 확인 방법          | 주기 |
| ---------------- | ---------- | ------------------ | ---- |
| 검색 노출도      | ↑ 10% 월간 | Search Console     | 주간 |
| 검색 클릭률(CTR) | ↑ 5%       | Search Console     | 주간 |
| 페이지 로드 시간 | < 3초      | PageSpeed Insights | 월간 |
| SEO 점수         | ≥ 90점     | Lighthouse         | 월간 |
| 색인 페이지 수   | 증가       | Search Console     | 월간 |
| Core Web Vitals  | 모두 녹색  | Search Console     | 월간 |

---

## 📈 기대 효과

### 검색 엔진 최적화

- ✅ 검색 엔진 크롤링 효율 15~20% 증대
- ✅ 색인 페이지 수 증가
- ✅ 검색 순위 개선

### 사용자 경험

- ✅ SNS 공유 시 미리보기 개선
- ✅ 검색 결과 클릭률 10~15% 증가
- ✅ Rich Snippet 노출 가능

### 비즈니스 지표

- 📊 검색 트래픽 증가 예상
- 📊 SNS 트래픽 20%+ 증가
- 📊 브랜드 인지도 향상

---

## 🚀 향후 개선 계획

### Phase 2: 성능 최적화

- [ ] Image 지연 로딩 (Lazy Loading)
- [ ] WebP/AVIF 포맷 지원
- [ ] 코드 스플리팅
- [ ] Critical CSS 로드
- [ ] 폰트 Preload

### Phase 3: 접근성(A11y) 개선

- [ ] ARIA 라벨 추가
- [ ] Heading 구조 정규화 (h1 → h2 → h3)
- [ ] 색상 대비 개선
- [ ] 키보드 네비게이션 지원

### Phase 4: 구조화 데이터 확대

- [ ] Event Schema (스터디 모임)
- [ ] VideoObject Schema
- [ ] ReviewRating Schema

### Phase 5: 국제화(i18n)

- [ ] hreflang 태그 추가
- [ ] 다국어 메타데이터
- [ ] 국가별 Sitemap

---

## 📚 참고 자료

### 공식 문서

- [Google Search Central](https://search.google.com/search-console)
- [Schema.org](https://schema.org)
- [Open Graph Protocol](https://ogp.me)
- [Next.js Metadata](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)

### 도구

- [Google PageSpeed Insights](https://pagespeed.web.dev)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [OpenGraph 테스터](https://www.opengraphcheck.com)
- [Schema.org 검증](https://validator.schema.org)
- [Screaming Frog](https://www.screamingfrog.co.uk/seo-spider/)

---

## ✅ SEO 체크리스트

배포 전 점검 사항:

- [ ] **Title 태그**: 60자 이내, 핵심 키워드 포함
- [ ] **Meta description**: 120~160자, 클릭 유도 문구
- [ ] **Canonical URL**: 모든 페이지에 설정
- [ ] **OG 이미지**: 1200x630px, 최적화됨
- [ ] **JSON-LD Schema**: 구현 및 검증됨
- [ ] **Robots.txt**: 설정 및 테스트됨
- [ ] **Sitemap.xml**: 최신 데이터 반영
- [ ] **내부 링크**: 의미있는 앵커 텍스트
- [ ] **이미지 Alt**: 모든 이미지에 설정
- [ ] **모바일 반응형**: 모든 페이지 테스트
- [ ] **페이지 속도**: < 3초
- [ ] **404 처리**: Not Found 페이지 구현
- [ ] **HTTPS**: SSL 인증서 적용
- [ ] **구조화된 데이터**: 에러 없이 검증됨

---

## 🔧 트러블슈팅

### 일반적인 문제와 해결 방법

#### 1. OG 이미지가 표시되지 않음

```typescript
// ❌ 상대 경로
ogImage: '/images/banner.png';

// ✅ 절대 경로
ogImage: 'https://www.zeroone.it.kr/images/banner.png';
```

#### 2. Sitemap이 업데이트되지 않음

- Next.js 캐시 클리어: `rm -rf .next`
- 빌드 후 확인: `npm run build && npm run start`

#### 3. Schema 검증 실패

- [Schema.org Validator](https://validator.schema.org)에서 확인
- 필수 속성 누락 여부 체크

#### 4. 검색 콘솔에서 페이지가 색인되지 않음

- robots.txt 확인
- 페이지 렌더링 확인 (SSR/SSG)
- URL 검사 도구 사용

---

**최종 업데이트**: 2024년 12월 26일
