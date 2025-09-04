import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isNumeric } from '@/shared/lib/validation';

export function middleware(request: NextRequest) {
  const hasAccessToken = request.cookies.has('accessToken');
  const hasMemberId =
    request.cookies.has('memberId') &&
    isNumeric(request.cookies.get('memberId')?.value);

  // sign-up 페이지에서 memberId는 null (사용자 이름을 등록해야 memberId 주어짐)
  if (request.url.endsWith('/sign-up')) {
    if (!hasAccessToken) {
      const loginUrl = new URL('/login', request.url);

      return NextResponse.redirect(loginUrl);
    }

    // 이미 사용자 이름을 등록했을 경우, 메인 페이지로 리다이렉트
    if (hasMemberId) {
      const mainUrl = new URL('/', request.url);

      return NextResponse.redirect(mainUrl);
    }

    return NextResponse.next();
  }

  if (!hasAccessToken || !hasMemberId) {
    const loginUrl = new URL('/login', request.url);

    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// middleware가 적용될 경로 설정
export const config = {
  matcher: ['/', '/my-page', '/my-study', '/my-study-review', '/sign-up'],
};
