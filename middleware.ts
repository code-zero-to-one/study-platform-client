import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isNumeric } from '@/shared/lib/validation';

export function middleware(request: NextRequest) {
  const hasAccessToken = request.cookies.has('accessToken');
  const hasMemberId =
    request.cookies.has('memberId') &&
    isNumeric(request.cookies.get('memberId')?.value);

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
