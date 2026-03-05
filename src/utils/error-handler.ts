/**
 * 전역 에러 핸들링 유틸리티 : 모든 에러 처리는 이 파일에서 중앙 집중식으로 관리됩니다.
 
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
 - Error: JavaScript 네이티브

 */

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
  /** 리소스를 찾을 수 없음 (404, GSM001) */
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
export function analyzeError(error: unknown): ErrorInfo {
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

  // 일반 Error 객체
  if (error instanceof Error) {
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
  if (errorCode) {
    if (errorCode.startsWith('AUTH')) return ErrorType.AUTH;
    if (errorCode.startsWith('GSM001') || errorCode.includes('NOT_FOUND'))
      return ErrorType.NOT_FOUND;
  }

  // HTTP 상태 코드 기반 분류
  if (!statusCode) return ErrorType.UNKNOWN;

  if (statusCode === 401 || statusCode === 403) return ErrorType.AUTH;
  if (statusCode === 404) return ErrorType.NOT_FOUND;
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
      AUTH001: '인증 오류가 발생했습니다. 다시 로그인해주세요.',
      AUTH002: '권한이 없습니다.',
      GSM001: '요청하신 정보를 찾을 수 없습니다.',
      // 필요시 추가
    };

    if (codeMessages[errorCode]) {
      return codeMessages[errorCode];
    }
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
 * logError(errorInfo, {
 *   url: window.location.href,
 *   digest: error.digest,
 * });
 * ```
 */
export function logError(
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

  console.error('[Error Handler]', JSON.stringify(logData, null, 2));
}
