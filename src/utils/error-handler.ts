/**
 * 전역 에러 핸들링 유틸리티 : 모든 에러 처리는 이 파일에서 중앙 집중식으로 관리됩니다.
 
 * 에러 처리 플로우:
┌─────────────────────────────────────────────────────────────┐
│ 1. 에러 발생                                                  │
│    - AxiosError (axios 라이브러리)                            │
│    - ApiError (프로젝트 커스텀, src/api/client/api-error.ts) │
│    - Error (JavaScript 네이티브, fetch API 등)               │
└───────────────────────┬─────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. analyzeError(error) 호출                                   │
│    - 에러 타입 분류 (NETWORK, AUTH, SERVER, CLIENT 등)       │
│    - 사용자 친화적 메시지 생성                                 │
│    - 기술적 메시지 생성                                       │
└───────────────────────┬─────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. ErrorInfo 반환                                             │
│    {                                                          │
│      type: ErrorType,                                         │
│      userMessage: string,                                     │
│      technicalMessage: string,                                │
│      errorCode?: string,                                      │
│      statusCode?: number,                                     │
│      originalError: unknown                                   │
│    }                                                          │
└───────────────────────┬─────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. sendErrorToSentry(errorInfo, context?) 호출                │
│    - 개발 환경: 콘솔에 상세 로그 출력                          │
│    - Sentry 전송 (DSN 설정 시)                                │
└───────────────────────┬─────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. 사용자에게 에러 표시                                        │
│    - Next.js Error Boundary: error.tsx 페이지 표시            │
│      * (service): src/app/(service)/error.tsx                │
│      * (landing): src/app/(landing)/error.tsx                 │
│      * (admin): src/app/(admin)/error.tsx                     │
│    - Toast 알림: useToastStore().showToast() (별도 호출 필요) │
│      * 일반적인 API 에러는 컴포넌트에서 직접 toast 표시         │
│      * Error Boundary는 전체 페이지 에러만 처리                │
└───────────────────────┬─────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. Sentry 전송 플로우                                         │
│    Sentry.withScope((scope) => {                             │
│      scope.setTag('error.type', ErrorType)  // 필터링용       │
│      scope.setExtra(...)                    // 상세 정보       │
│      Sentry.captureException(error)        // 에러 전송       │
│    })                                                        │
│    ↓                                                          │
│    beforeSend() 훅 실행 (필터링/수정)                         │
│    ↓                                                          │
│    Sentry 서버로 전송                                         │
└─────────────────────────────────────────────────────────────┘
 
 * 에러 타입 계층 구조:
┌────────────────────────┐
│ Error (JavaScript 기본) │
└────────────┬───────────┘
             │
    ┌────────┴────────┐
    │                 │
┌───▼───────┐   ┌──────▼────┐
│ AxiosError│   │ ApiError  │
│ (axios)   │   │ (프로젝트)  │
└───────────┘   └───────────┘
    │                 │
    └────────┬────────┘
             ↓
    analyzeError() 호출
             ↓
    ErrorInfo 반환
    (타입 분류 + 메시지 생성)
 
 * 에러 정의 위치:
 - AxiosError: axios 라이브러리 (외부)
 - ApiError: src/api/client/api-error.ts
 - Error: JavaScript 네이티브 (fetch API 등)
 
 * fetch vs axios 에러 처리:
 - fetch: 일반 Error 발생 → analyzeError()에서 ErrorType.NETWORK로 분류
 - axios: AxiosError 발생 → response.data가 ApiError 형식이면 ApiError로 변환
 - 둘 다 analyzeError()에서 통합 처리됨

 */

import * as Sentry from '@sentry/nextjs';
import { isAxiosError } from 'axios';
import { isApiError } from '@/api/client/api-error';

/**
 * 에러 타입 분류
 * 에러를 비즈니스 로직에 맞게 분류합니다.
 */
export enum ErrorType {
  /** 네트워크 연결 실패 */
  NETWORK = 'NETWORK',
  /** 인증/권한 에러 (401, 403, AUTH*) */
  AUTH = 'AUTH',
  /** 리소스를 찾을 수 없음 (404) */
  NOT_FOUND = 'NOT_FOUND',
  /** 서버 에러 (500번대) */
  SERVER = 'SERVER',
  /** 클라이언트 에러 (400번대) */
  CLIENT = 'CLIENT',
  /** 알 수 없는 에러 */
  UNKNOWN = 'UNKNOWN',
}

/**
 * 에러 분석 결과
 * analyzeError() 함수가 반환하는 구조화된 에러 정보
 */
export interface ErrorInfo {
  /** 에러 타입 분류 */
  type: ErrorType;
  /** 사용자에게 표시할 친화적인 메시지 */
  userMessage: string;
  /** 개발팀용 기술적 메시지 */
  technicalMessage: string;
  /** API 에러 코드 (예: AUTH001, GSM001) */
  errorCode?: string;
  /** HTTP 상태 코드 (예: 401, 404, 500) */
  statusCode?: number;
  /** 원본 에러 객체 */
  originalError: unknown;
}

/**
 * 에러를 분석하고 분류합니다.
 *
 * 모든 종류의 에러를 받아서 구조화된 ErrorInfo로 변환합니다.
 *
 * @param error - 분석할 에러 객체 (AxiosError, ApiError, Error 등)
 * @returns 구조화된 에러 정보 (ErrorInfo)
 *
 * @example
 * ```typescript
 * try {
 *   await fetchData();
 * } catch (error) {
 *   const errorInfo = analyzeError(error);
 *   // errorInfo.type: 'NETWORK' | 'AUTH' | 'NOT_FOUND' | ...
 *   // errorInfo.userMessage: '네트워크 연결을 확인해주세요.'
 *   // errorInfo.technicalMessage: 'Network Error: Failed to fetch'
 * }
 * ```
 */
export function analyzeError(
  error: unknown,
  options?: { isServerSide?: boolean },
): ErrorInfo {
  // Axios 에러 처리
  if (isAxiosError(error)) {
    const statusCode = error.response?.status;
    const responseData = error.response?.data;

    // API 에러 응답
    if (responseData && isApiError(responseData)) {
      // isApiError가 타입 가드이므로 responseData는 ApiError 타입으로 좁혀짐
      return {
        type: getErrorTypeFromStatusCode(statusCode, responseData.errorCode),
        userMessage: getUserFriendlyMessage(
          responseData.errorCode,
          responseData.message,
        ),
        technicalMessage: `[${responseData.errorCode}] ${responseData.errorName}: ${responseData.message}`,
        errorCode: responseData.errorCode,
        statusCode,
        originalError: error,
      };
    }

    // 네트워크 에러
    if (!error.response) {
      return {
        type: ErrorType.NETWORK,
        userMessage: '네트워크 연결을 확인해주세요.',
        technicalMessage: `Network Error: ${error.message}`,
        originalError: error,
      };
    }

    // HTTP 상태 코드 기반 처리
    return {
      type: getErrorTypeFromStatusCode(statusCode),
      userMessage: getUserFriendlyMessage(undefined, error.message, statusCode),
      technicalMessage: `HTTP ${statusCode}: ${error.message}`,
      statusCode,
      originalError: error,
    };
  }

  // ApiError 처리 (axios 인터셉터가 ApiError로 변환한 에러)
  if (isApiError(error)) {
    // 클라이언트 사이드에서 발생한 ApiError는 상태 코드가 500이어도 CLIENT로 분류
    // (서버 사이드에서 발생한 500 에러는 SERVER로 분류)
    const errorType = getErrorTypeFromStatusCode(
      error.statusCode,
      error.errorCode,
    );

    return {
      type: errorType,
      userMessage: getUserFriendlyMessage(error.errorCode, error.message),
      technicalMessage: `[${error.errorCode}] ${error.errorName}: ${error.message}`,
      errorCode: error.errorCode,
      statusCode: error.statusCode,
      originalError: error,
    };
  }

  // 일반 Error 객체
  if (error instanceof Error) {
    // 서버 사이드 에러 감지
    // Next.js 서버 사이드 에러는 digest가 있거나 스택에 서버 관련 키워드가 있음
    const isServerSideError =
      options?.isServerSide === true ||
      // Next.js Error Boundary에서 전달되는 서버 에러는 digest가 있음
      (error as Error & { digest?: string }).digest !== undefined ||
      // 스택 트레이스에 서버 사이드 관련 키워드가 있으면 서버 에러
      (error.stack &&
        (error.stack.includes('next-server') ||
          error.stack.includes('node_modules/next') ||
          error.stack.includes('server-components') ||
          (error.stack.includes('app/') && error.stack.includes('page.tsx'))));

    // 네트워크 에러 감지 (fetch API 실패)
    const isNetworkError =
      error.message.includes('Failed to fetch') ||
      error.message.includes('NetworkError') ||
      error.message.includes('fetch failed') ||
      error.message.includes('Network request failed') ||
      (error.name === 'TypeError' && error.message.includes('fetch'));

    // JSON 파싱 에러 감지 (HTML 응답 등)
    const isJsonParseError =
      error.message.includes('Unexpected token') ||
      error.message.includes('DOCTYPE') ||
      error.message.includes('is not valid JSON') ||
      error.message.includes('JSON.parse');

    // 클라이언트 렌더링 에러 감지 (null/undefined 접근 등)
    const isClientError =
      (error.name === 'TypeError' &&
        (error.message.includes('Cannot read properties of null') ||
          error.message.includes('Cannot read properties of undefined') ||
          error.message.includes('Cannot read property') ||
          error.message.includes('of null') ||
          error.message.includes('of undefined'))) ||
      error.name === 'ReferenceError' ||
      error.name === 'SyntaxError';

    // 서버 사이드 에러는 가장 우선적으로 처리
    if (isServerSideError) {
      return {
        type: ErrorType.SERVER,
        userMessage: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        technicalMessage: error.message,
        originalError: error,
      };
    }

    if (isNetworkError) {
      return {
        type: ErrorType.NETWORK,
        userMessage: '네트워크 연결을 확인해주세요.',
        technicalMessage: `Network Error: ${error.message}`,
        originalError: error,
      };
    }

    if (isJsonParseError) {
      return {
        type: ErrorType.CLIENT,
        userMessage:
          '서버 응답 형식 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        technicalMessage: error.message,
        originalError: error,
      };
    }

    if (isClientError) {
      return {
        type: ErrorType.CLIENT,
        userMessage: '오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        technicalMessage: error.message,
        originalError: error,
      };
    }

    return {
      type: ErrorType.UNKNOWN,
      userMessage: getUserFriendlyMessage(undefined, error.message),
      technicalMessage: error.message,
      originalError: error,
    };
  }

  // 알 수 없는 에러
  return {
    type: ErrorType.UNKNOWN,
    userMessage: '알 수 없는 오류가 발생했습니다.',
    technicalMessage: String(error),
    originalError: error,
  };
}

/**
 * HTTP 상태 코드와 에러 코드로부터 ErrorType 결정
 */
function getErrorTypeFromStatusCode(
  statusCode?: number,
  errorCode?: string,
): ErrorType {
  // 에러 코드 기반 분류
  if (errorCode?.startsWith('AUTH')) return ErrorType.AUTH;

  // HTTP 상태 코드 기반 분류
  if (!statusCode) return ErrorType.UNKNOWN;

  if (statusCode === 401 || statusCode === 403) return ErrorType.AUTH;
  if (statusCode === 404) return ErrorType.NOT_FOUND;

  // 500 에러는 서버 사이드에서 발생한 경우에만 SERVER로 분류
  // 클라이언트 사이드에서 발생한 500 에러는 CLIENT로 분류됨
  // (클라이언트에서 발생한 에러는 analyzeError 호출 시점에서 이미 CLIENT로 분류됨)
  if (statusCode >= 500) return ErrorType.SERVER;
  if (statusCode >= 400) return ErrorType.CLIENT;

  return ErrorType.UNKNOWN;
}

/**
 * 사용자 친화적인 메시지 생성
 */
function getUserFriendlyMessage(
  errorCode?: string,
  originalMessage?: string,
  statusCode?: number,
): string {
  // 에러 코드 기반 메시지
  if (errorCode) {
    const codeMessages: Record<string, string> = {
      // === AUTH (인증) ===
      AUTH001: '인증 오류가 발생했습니다. 다시 로그인해주세요.',
      AUTH002: '접근 권한이 없습니다.',
      AUTH003: '인증 정보가 만료되었습니다. 다시 로그인해주세요.',
      AUTH004: '인증 처리 중 오류가 발생했습니다. 다시 로그인해주세요.',

      // === CMM (공통) ===
      CMM001: '입력값이 올바르지 않습니다. 확인 후 다시 시도해주세요.',
      CMM003: '요청하신 정보를 찾을 수 없습니다.',
      CMM006: '접근 권한이 없습니다.',

      // === MEM (회원) ===
      MEM001: '입력 정보가 유효하지 않습니다. 확인 후 다시 시도해주세요.',
      MEM002: '회원 정보를 찾을 수 없습니다.',
      MEM003: '이미 가입된 회원입니다.',

      // === GSM (그룹스터디 관리) ===
      GSM001: '스터디를 찾을 수 없습니다.',
      GSM002: '스터디 정보를 찾을 수 없습니다.',
      GSM003: '해당 스터디의 개설자만 수행할 수 있습니다.',
      GSM004: '인증되지 않은 회원입니다.',

      // === GSA (그룹스터디 신청) ===
      GSA001: '스터디 신청 정보를 찾을 수 없습니다.',
      GSA002: '이미 신청한 스터디입니다.',
      GSA003: '정원 초과로 인해 신청할 수 없습니다.',
      GSA004: '리더는 자신이 개설한 스터디에 신청할 수 없습니다.',
      GSA005: '해당 신청의 본인이 아닙니다.',
      GSA006: '이미 처리된 신청입니다.',

      // === HWK (과제) ===
      HWK001: '과제를 찾을 수 없습니다.',
      HWK003: '과제 제출 기간이 만료되었습니다.',
      HWK004: '과제 제출 기간이 아직 시작되지 않았습니다.',
      HWK005: '이미 제출한 과제입니다.',

      // === EVL (평가) ===
      EVL002: '이미 평가가 존재합니다.',
      EVL003: '평가 가능 기간이 아닙니다.',

      // === PAY 결제 (2xx) ===
      PAY201: '결제 정보를 찾을 수 없습니다.',
      PAY202: '이미 승인된 결제입니다.',
      PAY207: '결제 금액이 일치하지 않습니다.',
      PAY212: '유료 스터디가 아닙니다.',
      PAY213: '스터디 시작 후에는 결제를 진행할 수 없습니다.',
      PAY214: '신청하지 않은 스터디입니다.',

      // === PAY 환불 (3xx) ===
      PAY301: '환불 정보를 찾을 수 없습니다. 관리자에게 문의해주세요.',
      PAY302: '이미 진행 중이거나 완료된 환불이 있습니다.',
      PAY303: '이미 취소된 환불 요청입니다.',
      PAY304: '환불 금액이 유효하지 않습니다. 관리자에게 문의해주세요.',
      PAY305: '환불 금액이 결제 금액을 초과합니다.',
      PAY306: '해당 환불의 소유자가 아닙니다.',
      PAY307: '현재 환불이 허용되지 않는 시점입니다. 관리자에게 문의해주세요.',
      PAY308: '환불 상태가 유효하지 않습니다.',
      PAY309:
        '정산이 이미 진행되어 환불이 불가합니다. 관리자에게 문의해주세요.',

      // === FILE ===
      FILE001: '파일 업로드에 실패했습니다. 다시 시도해주세요.',
      FILE002: '지원하지 않는 파일 형식입니다.',
    };

    if (codeMessages[errorCode]) {
      return codeMessages[errorCode];
    }
  }

  // 백엔드 메시지가 한국어이면 그대로 사용
  if (originalMessage && /[가-힣]/.test(originalMessage)) {
    return originalMessage;
  }

  // HTTP 상태 코드 기반 메시지
  if (statusCode) {
    const statusMessages: Record<number, string> = {
      401: '인증이 필요합니다. 다시 로그인해주세요.',
      403: '접근 권한이 없습니다.',
      404: '요청하신 페이지를 찾을 수 없습니다.',
      500: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
      502: '서버에 일시적인 문제가 발생했습니다.',
      503: '서비스를 일시적으로 사용할 수 없습니다.',
    };

    if (statusMessages[statusCode]) {
      return statusMessages[statusCode];
    }
  }

  // 원본 메시지에서 키워드 추출
  if (originalMessage) {
    const lowerMessage = originalMessage.toLowerCase();

    if (lowerMessage.includes('network') || lowerMessage.includes('네트워크')) {
      return '네트워크 연결을 확인해주세요.';
    }
    if (lowerMessage.includes('timeout') || lowerMessage.includes('타임아웃')) {
      return '요청 시간이 초과되었습니다. 다시 시도해주세요.';
    }
    if (lowerMessage.includes('auth') || lowerMessage.includes('인증')) {
      return '인증 오류가 발생했습니다. 다시 로그인해주세요.';
    }
  }

  // 기본 메시지
  return '오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
}

/**
 * 에러를 구조화된 형태로 로깅합니다.
 *
 * 개발팀을 위한 상세한 에러 정보를 JSON 형태로 로깅합니다.
 * 향후 모니터링 서비스(Sentry 등)로 전송할 수 있습니다.
 *
 * @param errorInfo - 로깅할 에러 정보
 * @param context - 추가 컨텍스트 정보 (URL, digest 등)
 *
 * @example
 * ```typescript
 * const errorInfo = analyzeError(error);
 * sendErrorToSentry(errorInfo, {
 *   url: window.location.href,
 *   digest: error.digest,
 * });
 * ```
 */
export function sendErrorToSentry(
  errorInfo: ErrorInfo,
  context?: Record<string, unknown>,
): void {
  const logData = {
    timestamp: new Date().toISOString(),
    type: errorInfo.type,
    userMessage: errorInfo.userMessage,
    technicalMessage: errorInfo.technicalMessage,
    errorCode: errorInfo.errorCode,
    statusCode: errorInfo.statusCode,
    context,
    stack:
      errorInfo.originalError instanceof Error
        ? errorInfo.originalError.stack
        : undefined,
  };

  // 개발 환경에서만 상세 로그 출력
  if (process.env.NODE_ENV === 'development') {
    console.error('[Error Handler]', JSON.stringify(logData, null, 2));
  }

  // Sentry 에러 보고
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (dsn) {
    try {
      Sentry.withScope((scope) => {
        scope.setTag('error.type', errorInfo.type);
        scope.setExtra('errorCode', errorInfo.errorCode);
        scope.setExtra('userMessage', errorInfo.userMessage);
        scope.setExtra('technicalMessage', errorInfo.technicalMessage);
        scope.setExtra('statusCode', errorInfo.statusCode);

        if (errorInfo.originalError instanceof Error) {
          scope.setExtra('stack', errorInfo.originalError.stack);
        }

        if (context) {
          Object.entries(context).forEach(([key, value]) => {
            scope.setExtra(key, value);
          });

          // 테스트 환경에서는 각 테스트가 새 이슈로 생성되도록 fingerprint 설정
          if (context.testType) {
            scope.setFingerprint([
              `test-${context.testType}`,
              Date.now().toString(),
            ]);
          }

          // 서버 사이드 에러의 중복 전송 방지 (digest 기반)
          if (context.isServerError && context.digest) {
            scope.setFingerprint(['server-error', context.digest as string]);
          }
        }

        if (errorInfo.originalError instanceof Error) {
          Sentry.captureException(errorInfo.originalError);
        } else {
          Sentry.captureMessage(errorInfo.technicalMessage, 'error');
        }
      });
    } catch (sentryError) {
      console.error('[Sentry Error Handler] Sentry 전송 실패:', sentryError);
    }
  }
}
