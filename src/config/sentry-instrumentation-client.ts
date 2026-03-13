// Next.js 클라이언트 초기화
// 모든 로직은 src/config/sentry.ts에 있음
// Note: 모듈 레벨에서 초기화하지 않고 sentry-init.tsx의 useEffect에서 초기화합니다.
// 이렇게 하면 서버 사이드 렌더링 중에 replayIntegration 에러를 방지할 수 있습니다.

export { initClientSentry } from './sentry';

// Note: onRouterTransitionStart는 현재 @sentry/nextjs 버전에서 지원되지 않습니다.
// Next.js 15.4.1 이상에서 지원될 예정입니다.
// export { onRouterTransitionStart };

