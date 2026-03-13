/**
 * @deprecated 이 파일은 하위 호환성을 위해 유지됩니다.
 * 새로운 코드에서는 `@/utils/error-handler`의 `analyzeError`를 사용하세요.
 *
 * 마이그레이션 가이드:
 * ```typescript
 * // 이전 코드
 * import { extractErrorCode } from '@/utils/error';
 * const { errorCode, message } = extractErrorCode(error);
 *
 * // 새로운 코드
 * import { analyzeError } from '@/utils/error-handler';
 * const errorInfo = analyzeError(error);
 * // errorInfo.errorCode, errorInfo.userMessage 사용
 * ```
 */

import { analyzeError } from './error-handler';

/**
 * @deprecated `extractErrorCode`는 더 이상 사용되지 않습니다.
 * 대신 `analyzeError`를 사용하세요.
 *
 * 이전: `extractErrorCode(error)` → `{ errorCode, message }`
 * 현재: `analyzeError(error)` → `ErrorInfo` (더 풍부한 정보)
 *
 * @param error - 분석할 에러 객체
 * @returns 에러 코드와 메시지
 */
export function extractErrorCode(error: unknown): {
  errorCode?: string;
  message?: string;
} {
  const errorInfo = analyzeError(error);

  return {
    errorCode: errorInfo.errorCode,
    message: errorInfo.userMessage,
  };
}
