import * as Sentry from '@sentry/nextjs';

function detectEnvironment(): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';
  if (apiUrl.includes('api.zeroone.it.kr') && !apiUrl.includes('test-api'))
    return 'production';
  if (apiUrl.includes('test-api')) return 'staging';

  return 'development';
}

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: detectEnvironment(),

    // 성능 트레이싱: 10%만 샘플링 (비용 제어)
    tracesSampleRate: 0.1,

    // Session Replay: 에러 발생 시에만 기록 (비용 제어)
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 1.0,
    integrations: [Sentry.replayIntegration()],

    beforeSend(event) {
      // AUTH001(토큰 만료)은 정상 플로우이므로 Sentry에 보고하지 않음
      const errorCode = event.extra?.errorCode as string | undefined;
      if (errorCode === 'AUTH001') return null;

      return event;
    },
  });
}
