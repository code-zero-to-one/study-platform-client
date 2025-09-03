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
