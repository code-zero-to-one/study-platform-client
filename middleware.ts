import axios, { isAxiosError } from 'axios';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getServerCookie } from '@/shared/lib/server-cookie';
import { isNumeric } from '@/shared/lib/validation';
import { isApiError } from '@/shared/tanstack-query/api-error';

const verifyAccessToken = async (accessToken: string) => {
  try {
    // Access token로 memberId만 반환하는 api
    const res = await axios.get<{ content: number }>(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/me`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    return { state: 'valid', memberId: res.data.content }; // memberId
  } catch (error) {
    if (
      isAxiosError(error) &&
      error.response &&
      isApiError(error.response.data) &&
      error.response.data.errorCode === 'AUTH001'
    ) {
      return { state: 'invalid' };
    }

    return { state: 'unknownError' };
  }
};

const refreshAccessToken = async () => {
  try {
    const refreshToken = await getServerCookie('refresh_token');

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/access-token/refresh`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          cookie: `refresh_token=${refreshToken}`, // 쿠키를 수동으로 전송
        },
      },
    );

    const data: { content: { accessToken: string } } = await response.json();

    return data.content.accessToken;
  } catch (error) {
    return null;
  }
};

export async function middleware(request: NextRequest) {
  const accessToken = request.cookies.get('accessToken')?.value;
  const memberId = request.cookies.get('memberId')?.value;

  const hasAccessToken = request.cookies.has('accessToken');
  const hasMemberId = request.cookies.has('memberId') && isNumeric(memberId);

  if (
    !hasAccessToken ||
    (request.nextUrl.pathname !== '/sign-up' && !hasMemberId) // 회원가입 페이지가 아닌 경우 memberId 체크
  ) {
    const loginUrl = new URL('/login', request.url);

    return NextResponse.redirect(loginUrl);
  }

  // access token 갱신 필요 여부 확인
  const verifyResponse = await verifyAccessToken(accessToken);
  const response = NextResponse.next();

  // access token이 유효하지 않을 경우 -> 갱신
  if (verifyResponse.state === 'invalid') {
    const newAccessToken = await refreshAccessToken();

    if (newAccessToken) {
      // 갱신 성공
      response.cookies.set('accessToken', newAccessToken, {
        secure: true,
        sameSite: 'strict',
        path: '/',
      });
    } else {
      // 갱신 실패
      const loginUrl = new URL('/login', request.url);

      return NextResponse.redirect(loginUrl);
    }
  }

  // 이미 회원가입 완료 했는데, sign-up 페이지에 진입할 경우 메인 페이지로 리다이렉트
  if (request.nextUrl.pathname === '/sign-up' && hasMemberId) {
    const mainUrl = new URL('/', request.url);

    return NextResponse.redirect(mainUrl);
  }

  return response;
}

// middleware가 적용될 경로 설정
export const config = {
  matcher: ['/', '/my-page', '/my-study', '/my-study-review', '/sign-up'],
};
