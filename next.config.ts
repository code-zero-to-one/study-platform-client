import type { NextConfig } from 'next';
import type { RemotePattern } from 'next/dist/shared/lib/image-config';

const isProd = process.env.NODE_ENV === 'production';
const isDev = process.env.NODE_ENV === 'development';

const nextConfig: NextConfig = {
  // [보안] 보안 HTTP 헤더 설정.
  // CSP는 스테이징 검증 중이므로 Content-Security-Policy-Report-Only 모드로 먼저 배포.
  // 결제·로그인 E2E 검증 후 위반 없으면 Content-Security-Policy로 전환할 것.
  async headers() {
    const cspDirectives = [
      "default-src 'self'",
      // GTM, Clarity, 토스페이먼츠 스크립트 허용. 개발 환경에서는 'unsafe-eval' 추가(Next.js HMR 필요).
      `script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.clarity.ms https://js.tosspayments.com${isDev ? " 'unsafe-eval'" : ''}`,
      "style-src 'self' 'unsafe-inline'",
      // 카카오·구글 프로필 이미지, 자사 API/CMS 이미지 도메인 허용
      "img-src 'self' data: blob: https://img1.kakaocdn.net https://lh3.googleusercontent.com https://api.zeroone.it.kr https://test-api.zeroone.it.kr https://www.zeroone.it.kr https://test-blog.zeroone.it.kr",
      // API, GA, Clarity, 토스, 카카오/구글 OAuth 연결 허용. 개발에서는 HMR WebSocket 추가.
      `connect-src 'self' https://api.zeroone.it.kr https://test-api.zeroone.it.kr https://www.google-analytics.com https://www.clarity.ms https://api.tosspayments.com https://kauth.kakao.com https://accounts.google.com${isDev ? ' ws://localhost:*' : ''}`,
      // 토스 결제창 iframe 허용
      'frame-src https://pay.toss.im https://cert.tosspayments.com',
      "font-src 'self' data:",
    ].join('; ');

    return [
      {
        source: '/(.*)',
        headers: [
          // Report-Only 모드: 위반을 차단하지 않고 콘솔에 경고만 출력. 검증 완료 후 CSP로 전환 예정.
          { key: 'Content-Security-Policy-Report-Only', value: cspDirectives },
          // [클릭재킹 방지] 동일 출처의 iframe만 허용
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          // [MIME 스니핑 방지] 브라우저가 Content-Type을 임의로 변경하는 행위 차단
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // [정보 유출 방지] 크로스 오리진 요청 시 origin만 전송
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
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
      // CMS 테스트 서버 이미지 도메인 허용 설정 (HTTPS)
      {
        protocol: 'https',
        hostname: 'test-blog.zeroone.it.kr',
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
        resourceQuery: { not: [...fileLoaderRule.resourceQuery.not, /url/] },
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

    return config;
  },
};

export default nextConfig;
