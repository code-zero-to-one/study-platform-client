import { NextRequest, NextResponse } from 'next/server';
import {
  AUTH_ROUTE_PATHS,
  getSafeInternalRedirectPath,
} from '@/features/auth/model/auth-route';
import { clearServerAuthCookies } from '@/features/auth/server/middleware/auth-cookies';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const rawRedirect = searchParams.get('redirect');
  const redirectTo = getSafeInternalRedirectPath(
    rawRedirect,
    AUTH_ROUTE_PATHS.LOGIN,
  );

  // 절대 URL 생성: 요청의 origin을 우선 사용 (이미 protocol 포함)
  // origin이 없으면 host + protocol 조합, 그래도 없으면 환경 변수 사용
  const origin = request.headers.get('origin');

  const baseUrl =
    origin || // origin은 이미 protocol 포함 (예: https://test.zeroone.it.kr)
    (() => {
      const host = request.headers.get('host');
      const protocol = request.headers.get('x-forwarded-proto') || 'https';

      return host ? `${protocol}://${host}` : null;
    })() ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_API_PROD_BASE_URL?.replace('/api/v1', '') ||
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/api/v1', '') ||
    request.url.split('/api')[0];

  const response = NextResponse.redirect(new URL(redirectTo, baseUrl));

  clearServerAuthCookies(request, response);

  return response;
}
