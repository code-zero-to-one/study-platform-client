import path from 'path';
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
  // output: 'standalone',
  /* config options here */
  // 외부 이미지 도메인 허용 설정 추가
  images: {
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
        hostname:
          'uploaded-files-qa.32cd2fa416bea795bf67cbf65411103b.r2.cloudflarestorage.com',
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

  // TurboPack 설정
  experimental: {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  // webpack 설정
  webpack: (config) => {
    // @ts-expect-error 타입 에러 무시
    const fileLoaderRule = config.module.rules.find((rule) =>
      rule.test?.test?.('.svg'),
    );

    config.module.rules.push(
      {
        ...fileLoaderRule,
        test: /\.svg$/i,
        resourceQuery: /url/,
      },
      {
        test: /\.svg$/i,
        issuer: fileLoaderRule.issuer,
        resourceQuery: {
          not: [...fileLoaderRule.resourceQuery.not, /url/],
        },
        use: [
          {
            loader: '@svgr/webpack',
            options: {
              typescript: true,
              ext: 'tsx',
            },
          },
        ],
      },
    );
    fileLoaderRule.exclude = /\.svg$/i;

    config.resolve = {
      ...config.resolve,
      alias: {
        ...config.resolve?.alias,
        public: path.join(__dirname, 'public'),
      },
    };

    return config;
  },
};

const sentryConfig = withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.SENTRY_AUTH_TOKEN,
  // disableLogger는 deprecated되었지만 Turbopack에서는 webpack.treeshake.removeDebugLogging를 사용할 수 없음
  // Next.js 15.4.1 이상으로 업그레이드하면 해결됨
  sourcemaps: {
    filesToDeleteAfterUpload: ['.next/static/**/*.map'],
  },
  widenClientFileUpload: true,
});

// [prototype 한정] Vercel preview 빌드의 Sentry 소스맵 업로드는 무료 플랜 45분 한도를 자주 초과한다.
// preview 환경(VERCEL_ENV=preview)에서만 Sentry 래핑을 건너뛰고, production 배포에는 영향 없음.
const isVercelPreview = process.env.VERCEL_ENV === 'preview';
const baseConfig = isVercelPreview ? nextConfig : sentryConfig;

export default withBundleAnalyzer(baseConfig);
