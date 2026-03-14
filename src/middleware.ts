import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isApiError } from '@/api/client/api-error';
import { decodeJwt } from '@/utils/jwt';
import { getServerCookie } from '@/utils/server-cookie';
import { isNumeric } from '@/utils/validation';

const ACCESS_TOKEN_COOKIE_OPTIONS = {
  secure: true,
  sameSite: 'lax' as const,
  path: '/',
};

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

  // 그룹스터디 상세: 비회원도 접근 가능, 로그인된 사용자는 토큰 갱신만 수행
  if (request.nextUrl.pathname.startsWith('/group-study')) {
    // 비회원(토큰 없음)은 그대로 통과
    if (!hasAccessToken || !hasMemberId || !accessToken) {
      return NextResponse.next();
    }

    // 로그인된 사용자는 토큰 유효성 검증 후 필요 시 갱신
    const verifyResponse = await verifyAccessToken(accessToken);
    const response = NextResponse.next();

    if (verifyResponse.state === 'invalid') {
      const newAccessToken = await refreshAccessToken();

      if (newAccessToken) {
        // 갱신 성공 → 새 토큰 쿠키 저장
        response.cookies.set(
          'accessToken',
          newAccessToken,
          ACCESS_TOKEN_COOKIE_OPTIONS,
        );
      } else {
        // refresh token도 만료 → 쿠키 삭제 후 비회원으로 통과
        response.cookies.delete('accessToken');
        response.cookies.delete('memberId');
      }
    }

    return response;
  }

  if (request.nextUrl.pathname === '/login') {
    if (hasAccessToken && hasMemberId && accessToken) {
      const verifyResponse = await verifyAccessToken(accessToken);

      if (verifyResponse.state === 'valid') {
        // 이미 회원가입 완료된 사용자는 홈으로 리디렉션
        const mainUrl = new URL('/home', request.url);

        return NextResponse.redirect(mainUrl);
      }

      // 만료/유효하지 않은 토큰으로 로그인 페이지 진입 시 루프 방지를 위해 세션 쿠키를 정리
      const response = NextResponse.next();
      response.cookies.delete('accessToken');
      response.cookies.delete('memberId');
      response.cookies.delete('socialImageURL');

      return response;
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
      response.cookies.set(
        'accessToken',
        newAccessToken,
        ACCESS_TOKEN_COOKIE_OPTIONS,
      );
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
    '/my-page',
    '/payment-management',
    '/settlement-management',
    '/my-study',
    '/my-study-review',
    '/sign-up',
    '/payment/:path*', // 결제 관련 모든 경로
    '/admin/:path*',
    '/group-study/:path*', // 그룹스터디 상세 (비회원 접근 가능, 토큰 갱신 필요)
  ],
};
