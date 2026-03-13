// Next.js instrumentation (서버/엣지 런타임)
// 모든 Sentry 설정은 src/config/sentry.ts에 통합되어 있음
import * as Sentry from '@sentry/nextjs';
import { initServerSentry, initEdgeSentry } from './sentry';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    initServerSentry();
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    initEdgeSentry();
  }
}

/**
 * Next.js 서버 사이드 요청 에러 처리
 *
 * Error Boundary가 처리하는 서버 컴포넌트 에러는 error.tsx에서 Sentry로 전송하므로
 * 여기서는 필터링하여 중복 전송을 방지합니다.
 *
 * onRequestError는 주로 API 라우트나 미들웨어에서 발생한 에러를 처리합니다.
 * 서버 컴포넌트 페이지 에러는 Error Boundary가 처리하므로 여기서는 건너뜁니다.
 */
export function onRequestError(
  err: Error,
  requestInfo: { path: string; method: string },
) {
  // 서버 컴포넌트 페이지 에러는 Error Boundary가 처리하므로 필터링
  // GET 요청이고 /api/로 시작하지 않는 경로는 서버 컴포넌트 페이지로 간주
  const isServerComponentPage =
    requestInfo.method === 'GET' &&
    !requestInfo.path.startsWith('/api/') &&
    !requestInfo.path.startsWith('/_next/');

  if (isServerComponentPage) {
    // Error Boundary가 처리할 서버 컴포넌트 에러는 건너뛰기
    // (error.tsx에서 이미 Sentry로 전송됨)
    return;
  }

  // API 라우트나 미들웨어에서 발생한 에러만 Sentry로 전송
  Sentry.captureRequestError(err, requestInfo);
}
