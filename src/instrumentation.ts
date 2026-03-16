// Next.js가 자동으로 찾는 파일 (루트 또는 src/에 필수)
// 실제 로직은 src/config/sentry-instrumentation.ts에 있음
export * from './config/sentry-instrumentation';

// onRequestError를 명시적으로 export하여 Sentry가 인식하도록 함
export { onRequestError } from './config/sentry-instrumentation';
