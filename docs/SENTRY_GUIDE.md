# ⚠️ 임시 문서

이 문서는 Sentry 통합 작업 중 작성된 임시 문서입니다.
향후 공식 문서로 정리될 예정입니다.

---

# Sentry 가이드

## Sentry 아키텍처 및 파일 구조

### 파일 구조

```
src/
├── config/
│   ├── sentry.ts                          # 🎯 메인 설정 파일 (모든 로직 통합)
│   ├── sentry-instrumentation.ts          # 서버/엣지 런타임 초기화
│   └── sentry-instrumentation-client.ts   # 클라이언트 런타임 초기화
├── instrumentation.ts                     # Next.js instrumentation (re-export)
├── components/
│   └── common/
│       └── sentry-init.tsx                # 클라이언트 초기화 컴포넌트 (App Router)
└── utils/
    └── error-handler.ts                   # 에러 분석 및 Sentry 전송 로직
```

### 각 파일의 역할

1. **`src/config/sentry.ts`** (메인 설정 파일)
   - 모든 Sentry 설정의 중앙 집중식 관리
   - 환경 감지 (development/staging/production)
   - `beforeSend` 훅 (필터링 및 메시지 수정)
   - `initClientSentry()`, `initServerSentry()`, `initEdgeSentry()` 함수 제공

2. **`src/config/sentry-instrumentation.ts`**
   - Next.js 서버/엣지 런타임 초기화
   - `register()` 함수: 런타임별 초기화
   - `onRequestError()` 함수: 서버 사이드 요청 에러 처리 (중복 전송 방지)

3. **`src/config/sentry-instrumentation-client.ts`**
   - 클라이언트 런타임 초기화
   - `initClientSentry()` 호출

4. **`src/instrumentation.ts`**
   - Next.js가 자동으로 찾는 instrumentation 파일
   - `sentry-instrumentation.ts`를 re-export

5. **`src/components/common/sentry-init.tsx`**
   - App Router에서 클라이언트 초기화를 보장하기 위한 컴포넌트
   - `src/app/(service)/layout.tsx`에 포함됨
   - `useEffect`에서 `initClientSentry()` 호출

6. **`src/utils/error-handler.ts`**
   - 에러 분석 및 분류 (`analyzeError()`)
   - Sentry 전송 (`sendErrorToSentry()`)
   - 에러 타입별 사용자 친화적 메시지 생성

### 초기화 플로우

```
앱 시작
  ↓
┌─────────────────────────────────────────┐
│ 서버/엣지 런타임                        │
│ src/instrumentation.ts                  │
│   → src/config/sentry-instrumentation.ts│
│     → src/config/sentry.ts              │
│       → initServerSentry() /           │
│         initEdgeSentry()                │
└─────────────────────────────────────────┘
  ↓
┌─────────────────────────────────────────┐
│ 클라이언트 런타임                        │
│ src/app/(service)/layout.tsx             │
│   → <SentryInit />                      │
│     → src/components/common/sentry-init.tsx│
│       → src/config/sentry-instrumentation-client.ts│
│         → src/config/sentry.ts          │
│           → initClientSentry()          │
└─────────────────────────────────────────┘
```

## Sentry 에러 전송 Flow

```
에러 발생
  ↓
┌─────────────────────────────────────────┐
│ 1. 에러 타입 분류                        │
│    - AxiosError (axios)                 │
│    - ApiError (프로젝트 커스텀)          │
│    - Error (JavaScript 네이티브)         │
└───────────────────────┬─────────────────┘
                        ↓
┌─────────────────────────────────────────┐
│ 2. analyzeError(error)                  │
│    - 에러 타입 분류 (NETWORK, AUTH, etc) │
│    - 사용자 친화적 메시지 생성            │
│    - 기술적 메시지 생성                  │
└───────────────────────┬─────────────────┘
                        ↓
┌─────────────────────────────────────────┐
│ 3. sendErrorToSentry(errorInfo, context)│
│    - scope.setTag('error.type', ...)    │
│    - scope.setExtra(...)                │
│    - Sentry.captureException(error)     │
└───────────────────────┬─────────────────┘
                        ↓
┌─────────────────────────────────────────┐
│ 4. beforeSend 훅 (sentry.ts)            │
│    - AUTH001 필터링 (return null)       │
│    - 메시지에 ErrorType 포함            │
└───────────────────────┬─────────────────┘
                        ↓
┌─────────────────────────────────────────┐
│ 5. Sentry 서버 전송                     │
│    - 자동 수집: StackTrace, Request 등   │
│    - 우리가 설정: Tags, Additional Data │
└───────────────────────┬─────────────────┘
                        ↓
┌─────────────────────────────────────────┐
│ 6. Sentry 대시보드 표시                 │
│    - 이슈 목록                           │
│    - 이슈 상세 페이지                    │
└───────────────────────┬─────────────────┘
                        ↓
┌─────────────────────────────────────────┐
│ 7. Slack 알림 (설정된 경우)              │
│    - Alert Rule 트리거                  │
│    - ErrorType과 ErrorInfo 포함된 메시지 │
└─────────────────────────────────────────┘
```

### 서버 사이드 에러 처리 Flow

```
서버 컴포넌트 에러 발생
  ↓
┌─────────────────────────────────────────┐
│ Next.js Error Boundary                   │
│ src/app/(service)/error.tsx              │
│   → analyzeError(error)                  │
│   → sendErrorToSentry(errorInfo)        │
└───────────────────────┬─────────────────┘
                        ↓
┌─────────────────────────────────────────┐
│ onRequestError (sentry-instrumentation.ts)│
│   → 서버 컴포넌트 페이지 에러 필터링     │
│   → API 라우트/미들웨어 에러만 전송      │
└─────────────────────────────────────────┘
```

**중복 전송 방지:**
- 서버 컴포넌트 페이지 에러는 Error Boundary에서만 처리
- `onRequestError`에서 GET 요청이고 `/api/`로 시작하지 않는 경로는 필터링
- `digest` 기반 fingerprint로 중복 이슈 그룹화

## Sentry 이슈 상세 페이지 섹션 설명

Sentry 이슈를 클릭하면 보이는 각 섹션에 대한 설명:

### 자동 수집 (Sentry가 자동으로)

1. **Highlights**
   - Sentry가 자동으로 분석한 에러의 주요 특징
   - "The error likely stems from..." 같은 설명은 Sentry가 자동 생성
   - 우리가 설정한 것 아님

2. **Stack Trace**
   - Error 객체의 stack 속성에서 자동 추출
   - 에러 발생 위치와 호출 스택 전체 표시
   - 우리가 설정한 것 아님

3. **Session Replay** (설정 필요)
   - 사용자의 화면 녹화 (에러 발생 전후)
   - `replaysOnErrorSampleRate` 설정으로 활성화
   - 현재 설정: 1.0 (100% 수집)

4. **Breadcrumbs**
   - 에러 발생 전의 사용자 행동 기록
   - 클릭, 네비게이션, API 호출 등
   - 우리가 설정한 것 아님

5. **Trace Preview**
   - 분산 추적 정보 (Performance Monitoring)
   - `tracesSampleRate` 설정으로 활성화
   - 현재 설정: 1.0 (100% 수집)

6. **HTTP Request**
   - Next.js 통합으로 자동 수집
   - URL, Method, Headers, Query Parameters 등
   - 우리가 설정한 것 아님

### 우리가 설정한 것

7. **Tags**
   - `error.type`: ErrorType (NETWORK, AUTH, SERVER, CLIENT 등)
   - 필터링/검색용으로 사용
   - `scope.setTag('error.type', ErrorType)`로 설정
   - Sentry 대시보드에서 `tags[error.type]:SERVER`로 필터링 가능

8. **Additional Data**
   - `errorCode`: API 에러 코드 (예: AUTH001, GSM001)
   - `userMessage`: 사용자 친화적 메시지
   - `technicalMessage`: 기술적 메시지
   - `statusCode`: HTTP 상태 코드
   - `digest`: Next.js 서버 에러 digest
   - `url`: 에러 발생 URL
   - 기타 context 정보
   - `scope.setExtra()`로 설정
   - Sentry 대시보드의 "Additional Data" 섹션에 표시

## Sentry 핵심 개념 요약

이 파일에서 Sentry를 사용하는 이유: 에러를 Sentry 대시보드에 자동으로 전송하여 프로덕션 환경에서 발생하는 에러를 모니터링하고 디버깅할 수 있습니다.

### 주요 함수

1. **captureException(error)**
   - 에러 객체를 Sentry로 전송
   - 스택 트레이스 포함
   - 예: `Sentry.captureException(new Error('에러 메시지'))`

2. **captureMessage(message, level)**
   - 메시지를 Sentry로 전송
   - 스택 트레이스 없음
   - 예: `Sentry.captureMessage('에러 메시지', 'error')`

3. **withScope((scope) => { ... })**
   - 임시 스코프 생성 (일회성)
   - 특정 에러에만 메타데이터를 붙일 때 사용
   - 스코프는 호출 후 자동으로 해제됨

4. **scope.setTag(key, value)**
   - 필터링/검색용 태그 추가 (문자열만 가능)
   - Sentry 대시보드에서 `tags[error.type]:SERVER`로 필터링 가능
   - 예: `scope.setTag('error.type', 'SERVER')`

5. **scope.setExtra(key, value)**
   - 디버깅용 상세 정보 추가 (모든 타입 가능)
   - Sentry 대시보드의 "Additional Data" 섹션에 표시
   - 우리가 설정한 것: `errorCode`, `userMessage`, `technicalMessage`, `statusCode` 등
   - 예: `scope.setExtra('userId', '123')`

6. **beforeSend(event, hint)**
   - Sentry로 전송되기 전에 실행되는 훅
   - `src/config/sentry.ts`에서 설정
   - `return null`: 전송하지 않음 (필터링)
   - `return event`: 전송
   - `return modifiedEvent`: 수정된 내용으로 전송

### Sentry가 자동으로 수집하는 정보 (우리가 설정하지 않음)

- **StackTrace**: Error 객체의 stack 속성에서 자동 추출
  → Sentry 대시보드의 "StackTrace" 섹션에 표시
- **Request 정보**: URL, Method, Headers 등 (Next.js 통합)
- **User 정보**: 브라우저, OS, 디바이스 등
- **Breadcrumbs**: 에러 발생 전의 사용자 행동 기록
- **Context**: 환경 변수, 릴리스 정보 등

### Slack 메시지의 자동 생성 내용 (우리가 설정하지 않음)

- "The error likely stems from an unhandled exception within the TestServerErrorPage Server Component logic itself."
  → Sentry가 스택 트레이스와 컨텍스트를 분석하여 자동 생성
- 우리가 설정한 것은 에러 메시지에 ErrorType과 ErrorInfo를 포함시키는 것뿐

### 전송 플로우

```
captureException/captureMessage 호출
  → withScope로 스코프 생성 (선택적)
  → scope.setTag/setExtra로 메타데이터 추가
  → beforeSend 훅 실행 (필터링/수정)
  → Sentry 서버로 전송
  → Sentry 대시보드에 표시
  → Slack 알림 전송 (설정된 경우)
```

### 이 파일에서의 사용

- ErrorType만 태그로 설정 (필터링용)
- 상세 정보는 Extra로 전송 (디버깅용)
- 원본 에러 객체를 전송하여 Sentry에서 스택 트레이스 확인 가능
- Slack 알림에 ErrorType과 ErrorInfo 내용이 표시되도록 메시지 수정

## 테스트 코드

⚠️ **주의: 아래 테스트 코드들은 Sentry 통합 작업 중 작성된 임시 테스트 코드입니다. 추후 삭제 예정입니다.**

### 테스트 파일 목록

1. **`src/app/(service)/test-sentry/page.tsx`**
   - 다양한 에러 타입 테스트 페이지
   - 클라이언트, 네트워크, 서버, API 에러 시뮬레이션
   - 직접 Sentry 전송 테스트

2. **`src/app/(service)/test-sentry-server-error/page.tsx`**
   - 서버 컴포넌트 에러 테스트 페이지
   - Next.js Error Boundary 트리거 테스트

3. **`src/app/api/test-sentry/route.ts`**
   - 테스트용 API 라우트
   - 다양한 에러 타입 반환 (server-error, api-error, auth-error 등)

### 테스트 방법

1. 개발 서버 실행: `yarn dev`
2. 브라우저에서 `http://localhost:3002/test-sentry` 접속
3. 각 버튼 클릭하여 에러 타입별 테스트
4. GlitchTip 대시보드에서 이슈 확인

### 삭제 예정

- 프로덕션 배포 전에 모든 테스트 파일 삭제 필요
- 테스트 페이지는 개발 환경에서만 사용
- API 라우트도 테스트 완료 후 삭제

