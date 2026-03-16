import * as Sentry from '@sentry/nextjs';

/**
 * ============================================================================
 * Sentry 설정 통합 파일
 * ============================================================================
 *
 * 모든 Sentry 설정이 이 파일에 통합되어 있습니다.
 * - 서버, 엣지, 클라이언트 초기화
 * - 환경 감지
 * - beforeSend 훅
 * - 라우터 전환 추적
 *
 * 다른 파일들은 Next.js 요구사항에 따라 얇은 래퍼로만 존재하며, 모든 로직은 이 파일에서 관리됩니다.
 * - src/config/sentry-instrumentation.ts: 서버/엣지 초기화
 * - src/config/sentry-instrumentation-client.ts: 클라이언트 초기화
 * - src/instrumentation.ts: Next.js instrumentation (re-export)
 */

/**
 * Sentry 환경 감지
 */
function detectEnvironment(): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';
  if (apiUrl.includes('api.zeroone.it.kr') && !apiUrl.includes('test-api'))
    return 'production';
  if (apiUrl.includes('test-api')) return 'staging';

  return 'development';
}

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
const environment = detectEnvironment();

/**
 * Sentry 초기화 함수 (서버, 엣지, 클라이언트 공통)
 */
function initSentry(config: {
  tracesSampleRate?: number;
  replaysSessionSampleRate?: number;
  replaysOnErrorSampleRate?: number;
  integrations?: any[];
}) {
  if (!dsn) return;

  Sentry.init({
    dsn,
    environment,
    tracesSampleRate: config.tracesSampleRate ?? 0.1,
    replaysSessionSampleRate: config.replaysSessionSampleRate ?? 0,
    replaysOnErrorSampleRate: config.replaysOnErrorSampleRate ?? 1.0,
    integrations: config.integrations ?? [],
    beforeSend(event) {
      const errorCode = event.extra?.errorCode as string | undefined;
      if (errorCode === 'AUTH001') return null;

      // Slack 알림에 ErrorType과 ErrorInfo 내용이 표시되도록 메시지 수정
      const errorType = event.tags?.['error.type'] as string | undefined;
      const errorCodeExtra = event.extra?.errorCode as string | undefined;
      const technicalMessage = event.extra?.technicalMessage as
        | string
        | undefined;

      if (errorType) {
        const enhancedMessage = `[${errorType}] ${technicalMessage || event.message || 'Error'}${errorCodeExtra ? ` (${errorCodeExtra})` : ''}`;

        if (event.exception?.values?.[0]) {
          event.exception.values[0].value = enhancedMessage;
        }
        if (event.message) {
          event.message = enhancedMessage;
        }
      }

      return event;
    },
  });
}

/**
 * 클라이언트 사이드 Sentry 초기화
 */
export function initClientSentry() {
  // 클라이언트 사이드에서만 실행
  if (typeof window === 'undefined') return;

  // replayIntegration은 클라이언트 전용
  // @sentry/nextjs 10.42.0에서는 replayIntegration을 직접 export하지 않음
  // replaysOnErrorSampleRate만 설정하면 자동으로 활성화됨
  const integrations: any[] = [];

  initSentry({
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 1.0,
    integrations,
  });
}

/**
 * 서버 사이드 Sentry 초기화
 */
export function initServerSentry() {
  initSentry({
    tracesSampleRate: 0.1,
  });
}

/**
 * 엣지 런타임 Sentry 초기화
 */
export function initEdgeSentry() {
  initSentry({
    tracesSampleRate: 0.1,
  });
}

/**
 * Next.js 라우터 전환 추적 (클라이언트 전용)
 *
 * Note: captureRouterTransitionStart는 현재 @sentry/nextjs 버전에서 지원되지 않습니다.
 * Next.js 15.4.1 이상에서 지원될 예정입니다.
 * 현재는 라우터 전환 추적이 비활성화되어 있습니다.
 */
