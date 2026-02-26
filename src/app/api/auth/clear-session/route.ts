import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';


// new URL(path, base)는 path가 절대 URL이면 base를 무시하므로 반드시 사전 검증 필요.
function isSafeRedirectPath(path: string) {
  if (!path) return false;
  if (!path.startsWith('/')) return false; // 절대 URL(https://evil.com) 차단
  if (path.startsWith('//')) return false; // 프로토콜-상대 URL(//evil.com) 차단

  return true;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const rawRedirect = searchParams.get('redirect') || '/login';
  const redirectTo = isSafeRedirectPath(rawRedirect) ? rawRedirect : '/login';

  // 쿠키 삭제
  const cookieStore = await cookies();
  cookieStore.delete('accessToken');
  cookieStore.delete('memberId');
  cookieStore.delete('socialImageURL');

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

  // 리다이렉트
  return NextResponse.redirect(new URL(redirectTo, baseUrl));
}
