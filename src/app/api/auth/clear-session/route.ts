import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const redirectTo = searchParams.get('redirect') || '/login';

  // 쿠키 삭제
  const cookieStore = await cookies();
  cookieStore.delete('accessToken');
  cookieStore.delete('memberId');
  cookieStore.delete('socialImageURL');

  // 리다이렉트
  return NextResponse.redirect(new URL(redirectTo, request.url));
}