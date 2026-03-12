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
    tracesSampleRate: 0.1,

    beforeSend(event) {
      const errorCode = event.extra?.errorCode as string | undefined;
      if (errorCode === 'AUTH001') return null;

      return event;
    },
  });
}
