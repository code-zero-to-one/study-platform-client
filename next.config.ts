import { withSentryConfig } from '@sentry/nextjs';
import type { NextConfig } from 'next';
import type { RemotePattern } from 'next/dist/shared/lib/image-config';

// @next/bundle-analyzer는 devDependency이므로 런타임 컨테이너에 없을 수 있습니다.
// 런타임에서는 항상 초기화하되, enabled 옵션으로 제어합니다.
let withBundleAnalyzer: (config: NextConfig) => NextConfig = (config) => config;

if (process.env.ANALYZE === 'true') {
  try {
    const bundleAnalyzer = require('@next/bundle-analyzer');
    withBundleAnalyzer = bundleAnalyzer({ enabled: true });
  } catch (error) {
    // devDependencies가 없는 환경에서는 무시
    console.warn('@next/bundle-analyzer를 로드할 수 없습니다:', error);
  }
}

const isProd = process.env.NODE_ENV === 'production';
const isDev = process.env.NODE_ENV === 'development';

const cspScriptSrcHosts = [
  'https://www.googletagmanager.com',
  'https://www.clarity.ms',
  'https://scripts.clarity.ms',
  'https://js.tosspayments.com',
  'https://browser.sentry-cdn.com',
  'https://static.cloudflareinsights.com',
  'https://googleads.g.doubleclick.net',
] as const;

const cspImgSrcHosts = [
  'https://img1.kakaocdn.net',
  'https://lh3.googleusercontent.com',
  'https://api.zeroone.it.kr',
  'https://test-api.zeroone.it.kr',
  'https://www.zeroone.it.kr',
  'https://test-blog.zeroone.it.kr',
  'https://blog.zeroone.it.kr',
  'https://www.google.com',
  'https://www.google.co.kr',
  'https://c.clarity.ms',
  'https://c.bing.com',
] as const;

const cspConnectSrcHosts = [
  'https://api.zeroone.it.kr',
  'https://test-api.zeroone.it.kr',
  'https://www.google-analytics.com',
  'https://analytics.google.com',
  'https://stats.g.doubleclick.net',
  'https://www.google.com',
  'https://www.clarity.ms',
  'https://l.clarity.ms',
  'https://api.tosspayments.com',
  'https://kauth.kakao.com',
  'https://accounts.google.com',
  'https://*.ingest.sentry.io',
] as const;

const nextConfig: NextConfig = {
  transpilePackages: ['@tiptap/core', '@tiptap/pm', 'prosemirror-model'],
  // googleapis는 서버 전용 패키지로 번들링에서 제외한다.
  serverExternalPackages: ['googleapis'],
  // [보안] 보안 HTTP 헤더 설정.
  // CSP는 스테이징 검증 중이므로 Content-Security-Policy-Report-Only 모드로 먼저 배포.
  // 결제·로그인 E2E 검증 후 위반 없으면 Content-Security-Policy로 전환할 것.
  async headers() {
    const cspDirectives = [
      "default-src 'self'",
      // 운영에서 실제 로드되는 GTM/Clarity/Cloudflare beacon 스크립트를 허용한다.
      `script-src 'self' 'unsafe-inline' ${cspScriptSrcHosts.join(' ')}${isDev ? " 'unsafe-eval'" : ''}`,
      "style-src 'self' 'unsafe-inline'",
      // 프로필 이미지와 현재 운영에서 사용 중인 Google/Clarity 추적 픽셀을 허용한다.
      `img-src 'self' data: blob: ${cspImgSrcHosts.join(' ')}`,
      // 운영에서 실제 호출되는 GA4, Ads, Clarity 수집 엔드포인트를 허용한다.
      `connect-src 'self' ${cspConnectSrcHosts.join(' ')}${isDev ? ' ws://localhost:*' : ''}`,
      // 토스 결제창 iframe + 유튜브 nocookie embed iframe 허용
      'frame-src https://pay.toss.im https://cert.tosspayments.com https://www.youtube-nocookie.com',
      "font-src 'self' data:",
      "worker-src 'self' blob:",
    ].join('; ');

    return [
      {
        source: '/(.*)',
        headers: [
          // Report-Only 모드: 위반을 차단하지 않고 콘솔에 경고만 출력. 검증 완료 후 CSP로 전환 예정.
          {
            key: 'Content-Security-Policy-Report-Only',
            value: cspDirectives,
          },
          // [클릭재킹 방지] 동일 출처의 iframe만 허용
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          // [MIME 스니핑 방지] 브라우저가 Content-Type을 임의로 변경하는 행위 차단
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // [정보 유출 방지] 크로스 오리진 요청 시 origin만 전송
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // [HTTPS 강제] 1년간 HTTPS만 허용 (프로덕션에서 유효)
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          // [브라우저 API 제한] 불필요한 카메라·마이크·위치정보 API 비활성화
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
  // standalone: 빌드 산출물에 필요한 node_modules만 .next/standalone 에 포함되어
  // runtime 컨테이너의 yarn install 을 제거하고 이미지를 경량화한다.
  output: 'standalone',
  /* config options here */
  // 외부 이미지 도메인 허용 설정 추가
  images: {
    // 프로필/업로드 이미지 즉시반영 유지를 위해 캐시 TTL을 짧게 설정한다.
    minimumCacheTTL: 60,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img1.kakaocdn.net',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**', // 구글 이미지 전체 허용
      },
      {
        protocol: 'https',
        hostname: 'test-api.zeroone.it.kr',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.zeroone.it.kr',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.zeroone.it.kr',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.r2.cloudflarestorage.com',
        pathname: '/**',
      },
      ...(isProd
        ? ([] as RemotePattern[])
        : ([
            {
              protocol: 'http',
              hostname: 'localhost',
              port: '8080',
              pathname: '/**',
            },
          ] as RemotePattern[])),
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '1337',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'test-blog.zeroone.it.kr',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'blog.zeroone.it.kr',
        pathname: '/uploads/**',
      },
    ],
  },

  // Turbopack 설정 (Next.js 16: top-level turbopack)
  // SVG를 React 컴포넌트로 임포트하기 위한 @svgr/webpack 로더 규칙.
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
    resolveAlias: {
      public: './public',
    },
  },
};

const sentryConfig = withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.SENTRY_AUTH_TOKEN,
  // Next.js 16(Turbopack 기본)에서 Sentry 디버그 로그 treeshake가 지원되므로 별도 webpack 설정이 필요 없다.
  sourcemaps: {
    filesToDeleteAfterUpload: ['.next/static/**/*.map'],
  },
  widenClientFileUpload: false,
});

export default withBundleAnalyzer(sentryConfig);
