import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isApiError } from '@/api/client/api-error';
import { decodeJwt } from '@/utils/jwt';
import { getServerCookie } from '@/utils/server-cookie';
import { isNumeric } from '@/utils/validation';

const verifyAccessToken = async (accessToken: string) => {
  try {
    // Access token로 memberId만 반환하는 api
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/me`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (!response.ok) {
      const errorData = await response.json();

      if (isApiError(errorData) && errorData.errorCode === 'AUTH001') {
        return { state: 'invalid' };
      }

      return { state: 'unknownError' };
    }

    const data: { content: number } = await response.json();

    return { state: 'valid', memberId: data.content };
  } catch (error) {
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
  // 랜딩 페이지(/)는 인증 체크를 하지 않음
  if (request.nextUrl.pathname === '/') {
    // 이미 로그인된 사용자가 랜딩 페이지에 접근하면 1:1 스터디 화면인 /home 으로 리디렉션시키는 코드

    // if (hasAccessToken && hasMemberId) {
    //   const mainUrl = new URL('/home', request.url);

    //   return NextResponse.redirect(mainUrl);
    // }

    // 모든 사용자는 '/' 주소로 접근시 랜딩 페이지에 진입
    return NextResponse.next();
  }

  // 회원가입 페이지는 accessToken만 체크 (memberId는 회원가입 후에 생성됨)
  if (request.nextUrl.pathname === '/sign-up') {
    if (hasAccessToken && hasMemberId) {
      // 이미 회원가입 완료된 사용자는 홈으로 리디렉션
      const mainUrl = new URL('/home', request.url);

      return NextResponse.redirect(mainUrl);
    }
    // accessToken이 없으면 랜딩 페이지로 리디렉션
    if (!hasAccessToken) {
      const landingUrl = new URL('/', request.url);

      return NextResponse.redirect(landingUrl);
    }

    return NextResponse.next();
  }

  if (request.nextUrl.pathname === '/login') {
    if (hasAccessToken && hasMemberId) {
      // 이미 회원가입 완료된 사용자는 홈으로 리디렉션
      const mainUrl = new URL('/home', request.url);

      return NextResponse.redirect(mainUrl);
    }

    return NextResponse.next();
  }

  // 다른 모든 페이지는 인증이 필요함
  if (!hasAccessToken || !hasMemberId) {
    const landingUrl = new URL('/', request.url);

    return NextResponse.redirect(landingUrl);
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
        sameSite: 'lax', // strict에서 lax로 변경: 외부 사이트에서 redirect 시 쿠키 전송 허용
        path: '/',
      });
    } else {
      // 갱신 실패 - 쿠키 삭제 후 랜딩 페이지로 리디렉션
      response.cookies.delete('accessToken');
      response.cookies.delete('memberId');
      const landingUrl = new URL('/', request.url);

      return NextResponse.redirect(landingUrl);
    }
  }

  // 관리자 페이지 권한 체크
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const decodedJwt = decodeJwt(accessToken);

    if (!decodedJwt || !decodedJwt.roleIds.includes('ROLE_ADMIN')) {
      const homeUrl = new URL('/home', request.url);

      return NextResponse.redirect(homeUrl);
    }
  }

  return response;
}

// middleware가 적용될 경로 설정
export const config = {
  matcher: [
    '/',
    '/login',
    '/home',
    '/my-page',
    '/payment-management',
    '/settlement-management',
    '/my-study',
    '/my-study-review',
    '/sign-up',
    '/payment/:path*', // 결제 관련 모든 경로
    '/admin/:path*',
  ],
};
